
-- ==========================================
-- إصلاح جذري للسياسات الأمنية - المرحلة 2
-- ==========================================

-- 1. إصلاح سياسة eligibility_assessments (بدون assessor_id)
DROP POLICY IF EXISTS "staff_insert_eligibility_assessments" ON public.eligibility_assessments;
CREATE POLICY "staff_insert_eligibility_assessments" 
ON public.eligibility_assessments 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff());

-- 2. إصلاح سياسة report_execution_log
DROP POLICY IF EXISTS "staff_insert_execution_log" ON public.report_execution_log;
CREATE POLICY "staff_insert_execution_log" 
ON public.report_execution_log 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff() OR executed_by = auth.uid());

-- 3. إصلاح سياسة request_attachments
DROP POLICY IF EXISTS "users_insert_own_attachments" ON public.request_attachments;
CREATE POLICY "users_insert_own_attachments" 
ON public.request_attachments 
FOR INSERT 
TO authenticated
WITH CHECK (uploaded_by = auth.uid() OR is_staff());

-- 4. إصلاح سياسة request_comments
DROP POLICY IF EXISTS "users_insert_own_comments" ON public.request_comments;
CREATE POLICY "users_insert_own_comments" 
ON public.request_comments 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

-- 5. إصلاح سياسة saved_reports
DROP POLICY IF EXISTS "users_insert_own_reports" ON public.saved_reports;
CREATE POLICY "users_insert_own_reports" 
ON public.saved_reports 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

-- 6. إصلاح سياسة sensitive_data_access_log
DROP POLICY IF EXISTS "authenticated_insert_access_logs" ON public.sensitive_data_access_log;
CREATE POLICY "authenticated_insert_access_logs" 
ON public.sensitive_data_access_log 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. إصلاح سياسات notification_logs
DROP POLICY IF EXISTS "staff_insert_notification_logs" ON public.notification_logs;
CREATE POLICY "staff_insert_notification_logs" 
ON public.notification_logs 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff());

-- 8. إصلاح سياسات notifications
DROP POLICY IF EXISTS "system_create_notifications" ON public.notifications;
CREATE POLICY "system_create_notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

-- 9. إصلاح سياسات kpi_values
DROP POLICY IF EXISTS "staff_insert_kpi_values" ON public.kpi_values;
CREATE POLICY "staff_insert_kpi_values" 
ON public.kpi_values 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff());

-- 10. إصلاح سياسة user_roles_audit
DROP POLICY IF EXISTS "النظام يمكنه إضافة سجلات الأدوار" ON public.user_roles_audit;
CREATE POLICY "system_insert_roles_audit" 
ON public.user_roles_audit 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());
