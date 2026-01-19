
-- ======================================
-- إصلاح سياسات RLS على user_roles
-- المشكلة: الناظر لا يستطيع رؤية أدوار المستخدمين
-- ======================================

-- حذف السياسة القديمة المقيدة
DROP POLICY IF EXISTS "users_read_own_role_secure" ON user_roles;

-- إنشاء سياسة SELECT جديدة تسمح للناظر والمشرف برؤية جميع الأدوار
CREATE POLICY "staff_read_all_roles" 
ON user_roles 
FOR SELECT 
USING (
  user_id = auth.uid()           -- المستخدم يرى دوره
  OR is_admin_or_nazer()         -- المشرف والناظر يرون الجميع
);

-- التحقق من أن السياسة admin_manage_user_roles موجودة للعمليات الأخرى
-- (INSERT, UPDATE, DELETE) - تبقى للمشرف فقط
