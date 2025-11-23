-- إصلاح RLS policy لـ system_health_checks
-- المشكلة: الجدول لا يسمح بإدراج صفوف جديدة

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Allow system health checks insertion" ON system_health_checks;
DROP POLICY IF EXISTS "Allow admins to read health checks" ON system_health_checks;

-- إنشاء policy للسماح بإدراج فحوصات الصحة من النظام
CREATE POLICY "Allow system health checks insertion"
ON system_health_checks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- السماح بقراءة فحوصات الصحة للمشرفين فقط
CREATE POLICY "Allow admins to read health checks"
ON system_health_checks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);