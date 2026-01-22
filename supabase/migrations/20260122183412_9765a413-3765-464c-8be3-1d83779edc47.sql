-- =============================================================
-- إصلاح سياسات RLS لجدولي profiles و invoices
-- إزالة السياسات المتضاربة وإنشاء سياسات موحدة آمنة
-- =============================================================

-- 1. حذف جميع السياسات الحالية لجدول profiles
DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "staff_profiles" ON profiles;
DROP POLICY IF EXISTS "user_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON profiles;

-- 2. إنشاء سياسات موحدة لجدول profiles
-- سياسة القراءة: المستخدم يرى ملفه فقط أو المسؤولين يرون الكل
CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR is_admin_or_nazer()
);

-- سياسة الإدراج: المستخدم يُنشئ ملفه فقط أو المسؤولين
CREATE POLICY "profiles_insert_own_or_admin"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR is_admin_or_nazer()
);

-- سياسة التحديث: المستخدم يُعدّل ملفه فقط أو المسؤولين
CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR is_admin_or_nazer()
);

-- سياسة الحذف: المسؤولين فقط
CREATE POLICY "profiles_delete_admin_only"
ON profiles FOR DELETE
TO authenticated
USING (is_admin_or_nazer());

-- =============================================================
-- 3. حذف جميع السياسات الحالية لجدول invoices
DROP POLICY IF EXISTS "invoices_delete" ON invoices;
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
DROP POLICY IF EXISTS "invoices_select" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "staff_manage_invoices" ON invoices;
DROP POLICY IF EXISTS "financial_staff_view_invoices" ON invoices;
DROP POLICY IF EXISTS "financial_staff_manage_invoices" ON invoices;

-- 4. إنشاء سياسات موحدة لجدول invoices
-- سياسة القراءة: الموظفين الماليين فقط
CREATE POLICY "invoices_select_financial_staff"
ON invoices FOR SELECT
TO authenticated
USING (is_financial_staff());

-- سياسة الإدراج: الموظفين الماليين فقط
CREATE POLICY "invoices_insert_financial_staff"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (is_financial_staff());

-- سياسة التحديث: الموظفين الماليين فقط
CREATE POLICY "invoices_update_financial_staff"
ON invoices FOR UPDATE
TO authenticated
USING (is_financial_staff());

-- سياسة الحذف: المسؤولين فقط
CREATE POLICY "invoices_delete_admin_only"
ON invoices FOR DELETE
TO authenticated
USING (is_admin_or_nazer());

-- =============================================================
-- 5. التأكد من تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 6. إضافة تعليق توثيقي
COMMENT ON TABLE profiles IS 'ملفات المستخدمين - RLS: المستخدم يرى ملفه فقط، المسؤولين يرون الكل';
COMMENT ON TABLE invoices IS 'الفواتير - RLS: الموظفين الماليين فقط';