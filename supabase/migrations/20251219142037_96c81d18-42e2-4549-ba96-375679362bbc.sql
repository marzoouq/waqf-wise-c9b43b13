-- إصلاح سياسات RLS المتبقية - المرحلة 2 (مصححة)

-- 1. إصلاح contract_attachments
DROP POLICY IF EXISTS "staff_view_contract_attachments" ON contract_attachments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contract_attachments;
CREATE POLICY "staff_view_contract_attachments_secure" ON contract_attachments FOR SELECT TO authenticated USING (public.is_staff());

-- 2. إصلاح contract_renewals
DROP POLICY IF EXISTS "staff_view_renewals" ON contract_renewals;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contract_renewals;
CREATE POLICY "staff_view_renewals_secure" ON contract_renewals FOR SELECT TO authenticated USING (public.is_staff());

-- 3. إصلاح document_versions
DROP POLICY IF EXISTS "staff_view_versions" ON document_versions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON document_versions;
CREATE POLICY "staff_view_versions_secure" ON document_versions FOR SELECT TO authenticated USING (public.is_staff());

-- 4. إصلاح document_tags
DROP POLICY IF EXISTS "staff_view_doc_tags" ON document_tags;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON document_tags;
CREATE POLICY "staff_view_doc_tags_secure" ON document_tags FOR SELECT TO authenticated USING (public.is_staff());

-- 5. إصلاح document_ocr_content
DROP POLICY IF EXISTS "staff_view_ocr" ON document_ocr_content;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON document_ocr_content;
CREATE POLICY "staff_view_ocr_secure" ON document_ocr_content FOR SELECT TO authenticated USING (public.is_staff());

-- 6. إصلاح request_attachments
DROP POLICY IF EXISTS "staff_view_request_attachments" ON request_attachments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON request_attachments;
CREATE POLICY "staff_or_own_view_request_attachments" ON request_attachments FOR SELECT TO authenticated USING (public.is_staff() OR request_id IN (SELECT br.id FROM beneficiary_requests br WHERE br.beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())));

-- 7. إصلاح request_comments
DROP POLICY IF EXISTS "staff_view_comments" ON request_comments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON request_comments;
CREATE POLICY "staff_or_own_view_comments" ON request_comments FOR SELECT TO authenticated USING (public.is_staff() OR request_id IN (SELECT br.id FROM beneficiary_requests br WHERE br.beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())));

-- 8. إصلاح approval_status
DROP POLICY IF EXISTS "staff_view_approval_status" ON approval_status;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_status;
CREATE POLICY "staff_view_approval_status_secure" ON approval_status FOR SELECT TO authenticated USING (public.is_staff());

-- 9. إصلاح approval_steps
DROP POLICY IF EXISTS "staff_view_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_steps;
CREATE POLICY "staff_view_approval_steps_secure" ON approval_steps FOR SELECT TO authenticated USING (public.is_staff());

-- 10. إصلاح approval_workflows
DROP POLICY IF EXISTS "staff_view_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_workflows;
CREATE POLICY "staff_view_workflows_secure" ON approval_workflows FOR SELECT TO authenticated USING (public.is_staff());

-- 11. إصلاح governance_decisions
DROP POLICY IF EXISTS "staff_view_decisions" ON governance_decisions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON governance_decisions;
CREATE POLICY "staff_or_heir_view_decisions" ON governance_decisions FOR SELECT TO authenticated USING (public.is_staff() OR public.is_heir());

-- 12. إصلاح governance_board_members
DROP POLICY IF EXISTS "staff_view_board_members" ON governance_board_members;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON governance_board_members;
CREATE POLICY "staff_or_heir_view_board_members" ON governance_board_members FOR SELECT TO authenticated USING (public.is_staff() OR public.is_heir());

-- 13. إصلاح waqf_nazers
DROP POLICY IF EXISTS "staff_view_nazers" ON waqf_nazers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON waqf_nazers;
CREATE POLICY "staff_or_heir_view_nazers" ON waqf_nazers FOR SELECT TO authenticated USING (public.is_staff() OR public.is_heir());

-- 14. إصلاح dashboards (created_by موجود)
DROP POLICY IF EXISTS "staff_view_dashboards" ON dashboards;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON dashboards;
CREATE POLICY "own_or_staff_view_dashboards" ON dashboards FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_staff());

-- 15. إصلاح dashboard_widgets
DROP POLICY IF EXISTS "staff_view_widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON dashboard_widgets;
CREATE POLICY "own_or_staff_view_widgets" ON dashboard_widgets FOR SELECT TO authenticated USING (public.is_staff() OR dashboard_id IN (SELECT id FROM dashboards WHERE created_by = auth.uid()));

-- 16. إصلاح kpi_values
DROP POLICY IF EXISTS "staff_view_kpis" ON kpi_values;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON kpi_values;
CREATE POLICY "staff_view_kpis_secure" ON kpi_values FOR SELECT TO authenticated USING (public.is_staff());

-- 17. إصلاح saved_reports (user_id بدلاً من created_by)
DROP POLICY IF EXISTS "staff_view_reports" ON saved_reports;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON saved_reports;
CREATE POLICY "own_or_staff_view_reports" ON saved_reports FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());

-- 18. إصلاح report_execution_log (executed_by موجود)
DROP POLICY IF EXISTS "staff_view_execution_log" ON report_execution_log;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON report_execution_log;
CREATE POLICY "own_or_staff_view_execution_log" ON report_execution_log FOR SELECT TO authenticated USING (executed_by = auth.uid() OR public.is_staff());

-- 19. إصلاح maintenance_schedules
DROP POLICY IF EXISTS "staff_view_maintenance" ON maintenance_schedules;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_schedules;
CREATE POLICY "staff_view_maintenance_secure" ON maintenance_schedules FOR SELECT TO authenticated USING (public.is_staff());

-- 20. إصلاح maintenance_schedule_log
DROP POLICY IF EXISTS "staff_view_maintenance_log" ON maintenance_schedule_log;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_schedule_log;
CREATE POLICY "staff_view_maintenance_log_secure" ON maintenance_schedule_log FOR SELECT TO authenticated USING (public.is_staff());

-- 21. إصلاح support_ticket_history
DROP POLICY IF EXISTS "staff_view_ticket_history" ON support_ticket_history;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON support_ticket_history;
CREATE POLICY "staff_or_own_view_ticket_history" ON support_ticket_history FOR SELECT TO authenticated USING (public.is_staff() OR ticket_id IN (SELECT st.id FROM support_tickets st WHERE st.user_id = auth.uid() OR st.beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())));

-- 22. إصلاح project_documentation
DROP POLICY IF EXISTS "staff_view_documentation" ON project_documentation;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON project_documentation;
CREATE POLICY "staff_view_documentation_secure" ON project_documentation FOR SELECT TO authenticated USING (public.is_staff());