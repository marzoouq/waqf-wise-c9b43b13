-- إصلاح مشكلة التكرار اللانهائي في سياسات user_roles

-- حذف جميع السياسات الموجودة على user_roles
DROP POLICY IF EXISTS "Admin manage roles v2" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users view own roles v2" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;

-- إنشاء دالة SECURITY DEFINER للتحقق من الأدوار بدون تكرار
CREATE OR REPLACE FUNCTION public.check_is_admin_direct(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role IN ('admin', 'nazer')
  );
$$;

-- إنشاء سياسات بسيطة لا تسبب تكرار

-- 1. المستخدمون يمكنهم رؤية أدوارهم الخاصة
CREATE POLICY "users_view_own_roles"
ON user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. المديرون يمكنهم رؤية جميع الأدوار (باستخدام SECURITY DEFINER)
CREATE POLICY "admins_view_all_roles"
ON user_roles
FOR SELECT
TO authenticated
USING (check_is_admin_direct(auth.uid()));

-- 3. المديرون يمكنهم إضافة الأدوار
CREATE POLICY "admins_insert_roles"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (check_is_admin_direct(auth.uid()));

-- 4. المديرون يمكنهم تحديث الأدوار
CREATE POLICY "admins_update_roles"
ON user_roles
FOR UPDATE
TO authenticated
USING (check_is_admin_direct(auth.uid()));

-- 5. المديرون يمكنهم حذف الأدوار
CREATE POLICY "admins_delete_roles"
ON user_roles
FOR DELETE
TO authenticated
USING (check_is_admin_direct(auth.uid()));