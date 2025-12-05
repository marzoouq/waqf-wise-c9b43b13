-- ============ إصلاح سياسات RLS لجدول contract_units ============
DROP POLICY IF EXISTS "allow_read_contract_units" ON contract_units;
DROP POLICY IF EXISTS "staff_view_contract_units" ON contract_units;

CREATE POLICY "staff_view_contract_units" ON contract_units
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist', 'waqf_heir')
  )
);

-- ============ إصلاح سياسات RLS لجدول tasks ============
DROP POLICY IF EXISTS "Allow authenticated read on tasks" ON tasks;

-- السياسة الموجودة للموظفين كافية، نحذف السياسة العامة فقط

-- ============ تنظيف سياسات profiles المكررة ============
-- حذف السياسات القديمة المكررة
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;

-- إنشاء سياسات موحدة
CREATE POLICY "profiles_select_own" ON profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_select_staff" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
);

CREATE POLICY "profiles_insert_own" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

-- ============ تنظيف سياسات user_roles المكررة ============
DROP POLICY IF EXISTS "Admins can manage all user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow users to read their own roles" ON user_roles;
DROP POLICY IF EXISTS "Staff can view user roles" ON user_roles;

-- إنشاء سياسات موحدة
CREATE POLICY "user_roles_select_own" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_select_admin" ON user_roles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'nazer')
  )
);

CREATE POLICY "user_roles_admin_manage" ON user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'nazer')
  )
);