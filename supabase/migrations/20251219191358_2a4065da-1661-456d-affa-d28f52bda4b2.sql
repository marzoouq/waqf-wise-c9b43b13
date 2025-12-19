-- إكمال المرحلة 2 - الأجزاء المتبقية

-- 1. حذف السياسة الموجودة أولاً ثم إعادة إنشائها
DROP POLICY IF EXISTS "profiles_select" ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'nazer')
    )
  );

-- 2. تقييد الوصول للحسابات البنكية
DROP POLICY IF EXISTS "bank_accounts_staff_access" ON bank_accounts;
DROP POLICY IF EXISTS "Staff can manage bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_nazer_accountant" ON bank_accounts;

CREATE POLICY "bank_accounts_nazer_accountant" ON bank_accounts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'nazer', 'accountant')
    )
  );

-- 3. إضافة Function للتحقق من صلاحيات الوصول للبيانات الحساسة
CREATE OR REPLACE FUNCTION public.can_view_sensitive_data()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  );
END;
$$;

-- 4. تسجيل الوصول للبيانات الحساسة
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    action_type,
    table_name,
    record_id,
    user_id,
    description,
    severity
  ) VALUES (
    'SENSITIVE_ACCESS',
    TG_TABLE_NAME,
    NEW.id::text,
    auth.uid(),
    'تم الوصول لبيانات حساسة',
    'info'
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.can_view_sensitive_data() IS 'التحقق من صلاحية عرض البيانات الحساسة';
COMMENT ON FUNCTION public.log_sensitive_access() IS 'تسجيل الوصول للبيانات الحساسة';