-- إصلاح تحذيرات الأمان: إضافة search_path لجميع الدوال (مصحح)

-- 1. إصلاح دالة has_permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission TEXT
) RETURNS BOOLEAN
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM public.user_permissions up
      INNER JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = _user_id
        AND p.name = _permission
    ) THEN (
      SELECT up.granted FROM public.user_permissions up
      INNER JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = _user_id AND p.name = _permission
      LIMIT 1
    )
    ELSE (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        INNER JOIN public.role_permissions rp ON rp.role::TEXT = ur.role::TEXT
        INNER JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = _user_id
          AND p.name = _permission
          AND rp.granted = true
      )
    )
  END;
$$;

-- 2. إصلاح دالة update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. التأكد من عدم وجود Views بـ SECURITY DEFINER
DROP VIEW IF EXISTS public.beneficiary_permissions_view CASCADE;
DROP VIEW IF EXISTS public.user_full_permissions_view CASCADE;

-- 4. إنشاء دالة مساعدة للحصول على صلاحيات المستخدم
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE (
  permission_id UUID,
  permission_name TEXT,
  permission_category TEXT,
  granted BOOLEAN,
  source TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.permission_id,
    p.name as permission_name,
    p.category as permission_category,
    up.granted,
    'user_override'::TEXT as source
  FROM public.user_permissions up
  INNER JOIN public.permissions p ON p.id = up.permission_id
  WHERE up.user_id = _user_id
  
  UNION
  
  SELECT 
    rp.permission_id,
    p.name as permission_name,
    p.category as permission_category,
    rp.granted,
    'role'::TEXT as source
  FROM public.user_roles ur
  INNER JOIN public.role_permissions rp ON rp.role::TEXT = ur.role::TEXT
  INNER JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = _user_id
    AND rp.granted = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_permissions up2
      WHERE up2.user_id = _user_id 
        AND up2.permission_id = rp.permission_id
    );
$$;

-- 5. إنشاء دالة للتحقق من عدة صلاحيات دفعة واحدة
CREATE OR REPLACE FUNCTION public.has_any_permission(
  _user_id UUID,
  _permissions TEXT[]
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM unnest(_permissions) AS perm
    WHERE public.has_permission(_user_id, perm) = true
  );
$$;

-- 6. إنشاء دالة للتحقق من جميع الصلاحيات
CREATE OR REPLACE FUNCTION public.has_all_permissions(
  _user_id UUID,
  _permissions TEXT[]
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM unnest(_permissions) AS perm
    WHERE public.has_permission(_user_id, perm) = false
  );
$$;

-- 7. إضافة تعليقات توضيحية للدوال
COMMENT ON FUNCTION public.has_permission IS 'تحقق من صلاحية واحدة للمستخدم - يأخذ user overrides بعين الاعتبار';
COMMENT ON FUNCTION public.get_user_permissions IS 'يعيد جميع صلاحيات المستخدم من الدور والاستثناءات';
COMMENT ON FUNCTION public.has_any_permission IS 'تحقق إذا كان المستخدم لديه أي من الصلاحيات المطلوبة';
COMMENT ON FUNCTION public.has_all_permissions IS 'تحقق إذا كان المستخدم لديه جميع الصلاحيات المطلوبة';

-- 8. إنشاء Indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_granted 
ON public.user_permissions(user_id, granted) 
WHERE granted = true;

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_granted 
ON public.role_permissions(role, granted) 
WHERE granted = true;

CREATE INDEX IF NOT EXISTS idx_permissions_name 
ON public.permissions(name);

CREATE INDEX IF NOT EXISTS idx_permissions_category 
ON public.permissions(category);

-- 9. تحديث RLS policies لتكون أكثر أماناً
DROP POLICY IF EXISTS "Admin can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admin can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admin can manage user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.permissions_audit;
DROP POLICY IF EXISTS "Admin and Nazer can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admin can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admin and Nazer can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admin and Nazer can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admin and Nazer can view user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admin and Nazer can manage user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admin and Nazer can view audit logs" ON public.permissions_audit;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.permissions_audit;

-- Permissions table policies
CREATE POLICY "Authenticated can view permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage permissions"
ON public.permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
);

-- Role permissions policies
CREATE POLICY "Authenticated can view role permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage role permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
);

-- User permissions policies
CREATE POLICY "Users can view their permissions"
ON public.user_permissions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
);

CREATE POLICY "Admin can manage user permissions"
ON public.user_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
);

-- Audit logs policies
CREATE POLICY "Admin can view audit logs"
ON public.permissions_audit FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::TEXT IN ('admin', 'nazer')
  )
);

CREATE POLICY "System can insert audit logs"
ON public.permissions_audit FOR INSERT
TO authenticated
WITH CHECK (true);

-- 10. إنشاء trigger لتسجيل التغييرات
CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    INSERT INTO public.permissions_audit (
      user_id,
      permission_id,
      action,
      granted,
      performed_by,
      notes
    ) VALUES (
      NEW.user_id,
      NEW.permission_id,
      TG_OP,
      NEW.granted,
      auth.uid(),
      COALESCE(NEW.notes, TG_OP || ' permission at ' || NOW()::TEXT)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_user_permissions_changes ON public.user_permissions;
CREATE TRIGGER audit_user_permissions_changes
AFTER INSERT OR UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.log_permission_change();

-- 11. Grant permissions للدوال
GRANT EXECUTE ON FUNCTION public.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_all_permissions TO authenticated;