
-- Batch 15: role, scheduled, smart, support tables

-- role_permissions
DROP POLICY IF EXISTS "Admin can manage role permissions" ON public.role_permissions;
CREATE POLICY "admin_role_perms" ON public.role_permissions
FOR ALL TO authenticated
USING (is_admin());

-- scheduled_report_jobs
DROP POLICY IF EXISTS "Admins can manage scheduled reports" ON public.scheduled_report_jobs;
DROP POLICY IF EXISTS "Users can view their scheduled reports" ON public.scheduled_report_jobs;
CREATE POLICY "scheduled_reports_access" ON public.scheduled_report_jobs
FOR ALL TO authenticated
USING (is_admin() OR created_by = auth.uid());

-- smart_alerts
DROP POLICY IF EXISTS "Nazer and Admin can update alerts" ON public.smart_alerts;
CREATE POLICY "admin_smart_alerts" ON public.smart_alerts
FOR ALL TO authenticated
USING (is_admin());

-- support_agent_availability
DROP POLICY IF EXISTS "Admin can manage agent availability" ON public.support_agent_availability;
DROP POLICY IF EXISTS "Agents can view their availability" ON public.support_agent_availability;
CREATE POLICY "support_availability" ON public.support_agent_availability
FOR ALL TO authenticated
USING (is_admin() OR user_id = auth.uid());

-- support_agent_stats
DROP POLICY IF EXISTS "Users can view their stats" ON public.support_agent_stats;
CREATE POLICY "support_stats" ON public.support_agent_stats
FOR SELECT TO authenticated
USING (is_admin() OR user_id = auth.uid());

-- support_assignment_settings
DROP POLICY IF EXISTS "Admin can manage assignment settings" ON public.support_assignment_settings;
CREATE POLICY "admin_support_settings" ON public.support_assignment_settings
FOR ALL TO authenticated
USING (is_admin());

-- support_escalations
DROP POLICY IF EXISTS "Users can view escalations" ON public.support_escalations;
CREATE POLICY "support_escalations_access" ON public.support_escalations
FOR SELECT TO authenticated
USING (has_staff_access());

-- support_notification_templates
DROP POLICY IF EXISTS "support_templates_staff_only" ON public.support_notification_templates;
CREATE POLICY "staff_support_templates" ON public.support_notification_templates
FOR ALL TO authenticated
USING (has_staff_access());
