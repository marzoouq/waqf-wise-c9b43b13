-- إصلاح نهائي لـ RLS policies على system_health_checks
-- المشكلة: النظام يحاول إدراج فحوصات صحية بدون مستخدم مصادق عليه

-- حذف جميع الـ policies القديمة
DROP POLICY IF EXISTS "Allow system health checks insertion" ON system_health_checks;
DROP POLICY IF EXISTS "System can insert health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Allow admins to read health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Authenticated users can view health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Authenticated users can update health checks" ON system_health_checks;
DROP POLICY IF EXISTS "Authenticated users can delete health checks" ON system_health_checks;

-- إنشاء policies جديدة محسّنة

-- السماح للنظام (service_role و anon) بإدراج فحوصات صحية
CREATE POLICY "Allow service and anon to insert health checks"
ON system_health_checks
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- السماح للمشرفين فقط بقراءة فحوصات الصحة
CREATE POLICY "Admins can read health checks"
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

-- السماح للمشرفين بحذف الفحوصات القديمة
CREATE POLICY "Admins can delete old health checks"
ON system_health_checks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);