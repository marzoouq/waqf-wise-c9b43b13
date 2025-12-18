
-- Batch 14: profiles, docs, reports, requests

-- profiles
DROP POLICY IF EXISTS "staff_view_all_profiles" ON public.profiles;
CREATE POLICY "staff_profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_staff_access() OR user_id = auth.uid());

-- project_documentation
DROP POLICY IF EXISTS "Allow nazer and admin to update documentation" ON public.project_documentation;
CREATE POLICY "admin_project_docs" ON public.project_documentation
FOR ALL TO authenticated
USING (is_admin());

-- report_templates
DROP POLICY IF EXISTS "report_templates_staff_only" ON public.report_templates;
CREATE POLICY "staff_report_templates" ON public.report_templates
FOR ALL TO authenticated
USING (has_staff_access());

-- request_approvals
DROP POLICY IF EXISTS "Admins can manage request approvals" ON public.request_approvals;
CREATE POLICY "staff_request_approvals" ON public.request_approvals
FOR ALL TO authenticated
USING (has_staff_access());

-- request_workflows
DROP POLICY IF EXISTS "Staff can update workflows" ON public.request_workflows;
DROP POLICY IF EXISTS "Users can view their assigned workflows" ON public.request_workflows;
CREATE POLICY "workflows_access" ON public.request_workflows
FOR ALL TO authenticated
USING (has_staff_access() OR assigned_to = auth.uid());

-- retention_policies
DROP POLICY IF EXISTS "Admins can manage retention policies" ON public.retention_policies;
CREATE POLICY "admin_retention" ON public.retention_policies
FOR ALL TO authenticated
USING (is_admin());

-- risk_assessments
DROP POLICY IF EXISTS "admin_can_manage_risk_assessments" ON public.risk_assessments;
DROP POLICY IF EXISTS "admin_nazer_can_view_risk_assessments" ON public.risk_assessments;
CREATE POLICY "admin_risk" ON public.risk_assessments
FOR ALL TO authenticated
USING (is_admin());
