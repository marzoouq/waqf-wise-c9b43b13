
-- إصلاح مشكلة Security Definer في الـ views
-- تحويل current_user_roles من SECURITY DEFINER إلى SECURITY INVOKER

DROP VIEW IF EXISTS current_user_roles CASCADE;

CREATE OR REPLACE VIEW current_user_roles 
WITH (security_invoker = true)
AS
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at,
  p.full_name,
  p.email
FROM user_roles ur
LEFT JOIN profiles p ON p.user_id = ur.user_id
WHERE ur.user_id = auth.uid();

-- إضافة تعليق توضيحي
COMMENT ON VIEW current_user_roles IS 'View for current authenticated user roles - SECURITY INVOKER';

-- التأكد من وجود RLS policies على الجداول الأساسية
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمستخدمين برؤية أدوارهم الخاصة
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- سياسة للمشرفين لرؤية جميع الأدوار
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" 
ON user_roles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer')
  )
);

-- سياسة للسماح للمستخدمين برؤية ملفاتهم الشخصية
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- سياسة للمشرفين لرؤية جميع الملفات الشخصية
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer')
  )
);
