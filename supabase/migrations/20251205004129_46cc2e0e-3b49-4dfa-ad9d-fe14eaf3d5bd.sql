-- إصلاح سياسات profiles لتجنب التكرار

-- حذف السياسات المشكلة
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles for admin purposes" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "admins_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_manage_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_staff" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;

-- إنشاء دالة للتحقق من الموظفين
CREATE OR REPLACE FUNCTION public.check_is_staff_direct(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  );
$$;

-- سياسات بسيطة للـ profiles

-- 1. المستخدمون يمكنهم رؤية ملفهم الشخصي
CREATE POLICY "profiles_view_own"
ON profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. الموظفون يمكنهم رؤية جميع الملفات
CREATE POLICY "profiles_staff_view_all"
ON profiles
FOR SELECT
TO authenticated
USING (check_is_staff_direct(auth.uid()));

-- 3. المستخدمون يمكنهم إنشاء ملفهم الشخصي
CREATE POLICY "profiles_insert_self"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. المستخدمون يمكنهم تحديث ملفهم الشخصي
CREATE POLICY "profiles_update_self"
ON profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 5. المديرون يمكنهم تحديث أي ملف
CREATE POLICY "profiles_admin_update"
ON profiles
FOR UPDATE
TO authenticated
USING (check_is_admin_direct(auth.uid()));

-- 6. المديرون يمكنهم إنشاء ملفات للمستخدمين الجدد
CREATE POLICY "profiles_admin_insert"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (check_is_admin_direct(auth.uid()));