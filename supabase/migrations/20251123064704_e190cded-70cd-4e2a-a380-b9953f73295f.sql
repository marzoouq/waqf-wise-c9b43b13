-- ========================================
-- المرحلة 1: إصلاح قاعدة البيانات
-- ========================================

-- 1.1 إنشاء profiles للمستخدمين الإداريين الذين ليس لديهم profile
INSERT INTO profiles (id, email, full_name, avatar_url)
SELECT 
    au.id,
    au.email,
    CASE 
        WHEN ur.role = 'nazer' THEN 'الناظر'
        WHEN ur.role = 'admin' THEN 'المشرف'
        WHEN ur.role = 'accountant' THEN 'المحاسب'
        WHEN ur.role = 'cashier' THEN 'موظف الصرف'
        WHEN ur.role = 'archivist' THEN 'الأرشيفي'
        ELSE 'مستخدم'
    END as full_name,
    '/avatars/default-admin.png'
FROM auth.users au
INNER JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- 1.2 تحديث Trigger لإنشاء Profile تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    '/avatars/default-user.png'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- إعادة إنشاء Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1.3 تحديث profile للمستخدم الحالي
INSERT INTO profiles (id, email, full_name, avatar_url, phone)
VALUES (
    'be7e9576-6437-4c48-973f-be400b085789',
    '1086970629@waqf.internal',
    'المشرف الرئيسي',
    '/avatars/admin.png',
    '1086970629'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    phone = EXCLUDED.phone,
    updated_at = now();

-- ========================================
-- المرحلة 2: تحسين نظام الأدوار
-- ========================================

-- 2.1 إنشاء View لعرض المستخدمين مع الأدوار
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.phone,
    p.created_at,
    p.updated_at,
    p.last_login_at,
    p.is_active,
    STRING_AGG(ur.role::text, ',' ORDER BY ur.role) as roles,
    ARRAY_AGG(ur.role ORDER BY ur.role) as roles_array,
    COUNT(ur.role) as roles_count
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.email, p.full_name, p.avatar_url, p.phone, p.created_at, p.updated_at, p.last_login_at, p.is_active;

-- منح صلاحيات القراءة للـ View
GRANT SELECT ON users_with_roles TO authenticated;

-- 2.2 إنشاء جدول Audit Log للأدوار
CREATE TABLE IF NOT EXISTS user_roles_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role app_role NOT NULL,
    action text NOT NULL CHECK (action IN ('added', 'removed')),
    changed_by uuid,
    changed_by_name text,
    changed_at timestamptz NOT NULL DEFAULT now(),
    notes text
);

-- تفعيل RLS على جدول الـ Audit
ALTER TABLE user_roles_audit ENABLE ROW LEVEL SECURITY;

-- سياسة للمسؤولين لقراءة السجل
CREATE POLICY "المسؤولون يمكنهم قراءة سجل الأدوار"
ON user_roles_audit
FOR SELECT
TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'nazer')
);

-- سياسة للنظام لإضافة سجلات
CREATE POLICY "النظام يمكنه إضافة سجلات الأدوار"
ON user_roles_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2.3 إنشاء Trigger لتسجيل تغييرات الأدوار
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    v_user_name text;
BEGIN
    -- الحصول على اسم المستخدم المنفذ
    SELECT full_name INTO v_user_name 
    FROM profiles 
    WHERE id = auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_roles_audit (user_id, role, action, changed_by, changed_by_name)
        VALUES (NEW.user_id, NEW.role, 'added', auth.uid(), COALESCE(v_user_name, 'النظام'));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO user_roles_audit (user_id, role, action, changed_by, changed_by_name)
        VALUES (OLD.user_id, OLD.role, 'removed', auth.uid(), COALESCE(v_user_name, 'النظام'));
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- إنشاء Trigger على جدول user_roles
DROP TRIGGER IF EXISTS user_roles_audit_trigger ON user_roles;
CREATE TRIGGER user_roles_audit_trigger
    AFTER INSERT OR DELETE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION log_role_change();

-- 2.4 إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_user_id ON user_roles_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_changed_at ON user_roles_audit(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_role ON user_roles_audit(role);