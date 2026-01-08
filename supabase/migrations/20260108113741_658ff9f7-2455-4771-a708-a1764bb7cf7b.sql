
-- ==========================================
-- حذف جميع السياسات القديمة المتساهلة
-- ==========================================

-- الجداول الحرجة (public role)
DROP POLICY IF EXISTS "Anyone can insert alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.system_error_logs;
DROP POLICY IF EXISTS "النظام يمكنه إنشاء التذكيرات" ON public.payment_reminders;

-- الجداول الأخرى (authenticated with true)
DROP POLICY IF EXISTS "contact_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow insert dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "authenticated_insert_eligibility_assessments" ON public.eligibility_assessments;
DROP POLICY IF EXISTS "Allow insert kpi_values" ON public.kpi_values;
DROP POLICY IF EXISTS "system_insert_notification_logs" ON public.notification_logs;
DROP POLICY IF EXISTS "System create notifications v2" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert execution_log" ON public.report_execution_log;
DROP POLICY IF EXISTS "Authenticated users can insert attachments" ON public.request_attachments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.request_comments;
DROP POLICY IF EXISTS "Allow insert saved_reports" ON public.saved_reports;
DROP POLICY IF EXISTS "system_insert_access_logs" ON public.sensitive_data_access_log;
DROP POLICY IF EXISTS "Allow service and anon to insert health checks" ON public.system_health_checks;
DROP POLICY IF EXISTS "النظام يمكنه إضافة سجلات الأدوار" ON public.user_roles_audit;

-- ==========================================
-- إعادة إنشاء السياسات بشكل صحيح
-- ==========================================

-- 1. system_alerts
CREATE POLICY "staff_insert_alerts" 
ON public.system_alerts FOR INSERT TO authenticated
WITH CHECK (is_staff());

CREATE POLICY "service_insert_alerts" 
ON public.system_alerts FOR INSERT TO service_role
WITH CHECK (true);

-- 2. system_error_logs
CREATE POLICY "auth_insert_own_errors" 
ON public.system_error_logs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

CREATE POLICY "service_insert_errors" 
ON public.system_error_logs FOR INSERT TO service_role
WITH CHECK (true);

-- 3. payment_reminders
CREATE POLICY "finance_staff_create_reminders" 
ON public.payment_reminders FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR 
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "service_create_reminders" 
ON public.payment_reminders FOR INSERT TO service_role
WITH CHECK (true);

-- 4. contact_messages
CREATE POLICY "auth_insert_contact" 
ON public.contact_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. dashboards
CREATE POLICY "user_create_dashboards" 
ON public.dashboards FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- 6. eligibility_assessments
CREATE POLICY "staff_insert_assessments" 
ON public.eligibility_assessments FOR INSERT TO authenticated
WITH CHECK (is_staff());

-- 7. kpi_values
CREATE POLICY "staff_insert_kpi" 
ON public.kpi_values FOR INSERT TO authenticated
WITH CHECK (is_staff());

-- 8. notification_logs
CREATE POLICY "staff_insert_notif_logs" 
ON public.notification_logs FOR INSERT TO authenticated
WITH CHECK (is_staff());

-- 9. notifications
CREATE POLICY "system_notifications" 
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

-- 10. report_execution_log
CREATE POLICY "staff_insert_report_log" 
ON public.report_execution_log FOR INSERT TO authenticated
WITH CHECK (is_staff() OR executed_by = auth.uid());

-- 11. request_attachments
CREATE POLICY "user_insert_attachments" 
ON public.request_attachments FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid() OR is_staff());

-- 12. request_comments
CREATE POLICY "user_insert_comments" 
ON public.request_comments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

-- 13. saved_reports
CREATE POLICY "user_insert_reports" 
ON public.saved_reports FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR is_staff());

-- 14. sensitive_data_access_log
CREATE POLICY "auth_insert_access_log" 
ON public.sensitive_data_access_log FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 15. system_health_checks
CREATE POLICY "service_insert_health" 
ON public.system_health_checks FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "staff_insert_health" 
ON public.system_health_checks FOR INSERT TO authenticated
WITH CHECK (is_staff());

-- 16. user_roles_audit
CREATE POLICY "admin_insert_audit" 
ON public.user_roles_audit FOR INSERT TO authenticated
WITH CHECK (is_admin());
