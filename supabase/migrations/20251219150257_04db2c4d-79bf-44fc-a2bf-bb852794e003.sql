-- إصلاح saved_reports بالعمود الصحيح
DROP POLICY IF EXISTS "owner_insert_saved_reports" ON saved_reports;
DROP POLICY IF EXISTS "authenticated_insert_saved_reports" ON saved_reports;
DROP POLICY IF EXISTS "anyone_insert_saved_reports" ON saved_reports;
CREATE POLICY "owner_insert_saved_reports" ON saved_reports
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 21. sensitive_data_access_log 
DROP POLICY IF EXISTS "user_insert_own_sensitive_data_access_log" ON sensitive_data_access_log;
DROP POLICY IF EXISTS "system_insert_sensitive_data_access_log" ON sensitive_data_access_log;
DROP POLICY IF EXISTS "authenticated_insert_sensitive_log" ON sensitive_data_access_log;
DROP POLICY IF EXISTS "anyone_insert_sensitive_data_access_log" ON sensitive_data_access_log;
CREATE POLICY "user_insert_own_sensitive_data_access_log" ON sensitive_data_access_log
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 22. system_alerts
DROP POLICY IF EXISTS "staff_insert_system_alerts" ON system_alerts;
DROP POLICY IF EXISTS "authenticated_insert_system_alerts" ON system_alerts;
DROP POLICY IF EXISTS "anyone_insert_system_alerts" ON system_alerts;
CREATE POLICY "staff_insert_system_alerts" ON system_alerts
FOR INSERT TO authenticated
WITH CHECK (public.is_staff());

-- 23. system_error_logs
DROP POLICY IF EXISTS "user_insert_own_system_error_logs" ON system_error_logs;
DROP POLICY IF EXISTS "system_insert_system_error_logs" ON system_error_logs;
DROP POLICY IF EXISTS "authenticated_insert_error_logs" ON system_error_logs;
DROP POLICY IF EXISTS "anyone_insert_system_error_logs" ON system_error_logs;
CREATE POLICY "user_insert_own_system_error_logs" ON system_error_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 24. system_health_checks
DROP POLICY IF EXISTS "staff_insert_system_health_checks" ON system_health_checks;
DROP POLICY IF EXISTS "authenticated_insert_health_checks" ON system_health_checks;
DROP POLICY IF EXISTS "anyone_insert_system_health_checks" ON system_health_checks;
CREATE POLICY "staff_insert_system_health_checks" ON system_health_checks
FOR INSERT TO authenticated
WITH CHECK (public.is_staff());

-- 25. user_roles_audit
DROP POLICY IF EXISTS "trigger_only_insert_user_roles_audit" ON user_roles_audit;
DROP POLICY IF EXISTS "system_insert_user_roles_audit" ON user_roles_audit;
DROP POLICY IF EXISTS "authenticated_insert_roles_audit" ON user_roles_audit;
DROP POLICY IF EXISTS "anyone_insert_user_roles_audit" ON user_roles_audit;
CREATE POLICY "trigger_only_insert_user_roles_audit" ON user_roles_audit
FOR INSERT TO authenticated
WITH CHECK (false);

-- إضافة الفهارس
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_beneficiary_id ON beneficiary_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);