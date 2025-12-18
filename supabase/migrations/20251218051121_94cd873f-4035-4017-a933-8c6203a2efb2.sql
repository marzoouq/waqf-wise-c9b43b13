-- الدفعة 1: تحديث سياسات ADMIN_ONLY و ADMIN_NAZER (20 سياسة)
-- Batch 1: Update ADMIN_ONLY and ADMIN_NAZER policies

-- 1. backup_schedules - admin only
DROP POLICY IF EXISTS "Admins can manage backup schedules" ON public.backup_schedules;
CREATE POLICY "Admins can manage backup schedules" ON public.backup_schedules
  FOR ALL TO authenticated
  USING (is_admin());

-- 2. audit_logs - admin/nazer
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (is_admin_or_nazer());

-- 3. approval_workflows - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_workflows" ON public.approval_workflows;
CREATE POLICY "admin_nazer_manage_workflows" ON public.approval_workflows
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 4. auto_journal_templates - admin manage
DROP POLICY IF EXISTS "admin_manage_journal_templates" ON public.auto_journal_templates;
CREATE POLICY "admin_manage_journal_templates" ON public.auto_journal_templates
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 5. bank_matching_rules - admin manage
DROP POLICY IF EXISTS "admin_manage_matching_rules" ON public.bank_matching_rules;
CREATE POLICY "admin_manage_matching_rules" ON public.bank_matching_rules
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 6. approval_status - financial staff
DROP POLICY IF EXISTS "admin_nazer_manage_status" ON public.approval_status;
CREATE POLICY "admin_nazer_manage_status" ON public.approval_status
  FOR ALL TO authenticated
  USING (is_financial_staff());

-- 7. approval_steps - financial staff
DROP POLICY IF EXISTS "admin_nazer_manage_steps" ON public.approval_steps;
CREATE POLICY "admin_nazer_manage_steps" ON public.approval_steps
  FOR ALL TO authenticated
  USING (is_financial_staff());

-- 8. auto_journal_log - financial staff read
DROP POLICY IF EXISTS "financial_staff_read_journal_log" ON public.auto_journal_log;
CREATE POLICY "financial_staff_read_journal_log" ON public.auto_journal_log
  FOR SELECT TO authenticated
  USING (is_financial_staff() OR has_staff_access());

-- 9. auto_journal_templates - financial staff read
DROP POLICY IF EXISTS "financial_staff_read_journal_templates" ON public.auto_journal_templates;
CREATE POLICY "financial_staff_read_journal_templates" ON public.auto_journal_templates
  FOR SELECT TO authenticated
  USING (has_staff_access());

-- 10. bank_matching_rules - accountants read
DROP POLICY IF EXISTS "accountants_read_matching_rules" ON public.bank_matching_rules;
CREATE POLICY "accountants_read_matching_rules" ON public.bank_matching_rules
  FOR SELECT TO authenticated
  USING (is_financial_staff());

-- 11. bank_reconciliation_matches - accountants manage
DROP POLICY IF EXISTS "accountants_manage_reconciliation_matches" ON public.bank_reconciliation_matches;
CREATE POLICY "accountants_manage_reconciliation_matches" ON public.bank_reconciliation_matches
  FOR ALL TO authenticated
  USING (is_financial_staff());

-- 12. bank_reconciliation_matches - accountants read
DROP POLICY IF EXISTS "accountants_read_reconciliation_matches" ON public.bank_reconciliation_matches;
-- Already covered by manage policy above

-- 13. bank_statements - financial staff update
DROP POLICY IF EXISTS "financial_staff_update_bank_statements" ON public.bank_statements;
CREATE POLICY "financial_staff_update_bank_statements" ON public.bank_statements
  FOR UPDATE TO authenticated
  USING (is_financial_staff());

-- 14. approval_history - first class beneficiaries
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_approval_history" ON public.approval_history;
CREATE POLICY "first_class_beneficiaries_can_view_approval_history" ON public.approval_history
  FOR SELECT TO authenticated
  USING (is_financial_staff() OR is_first_class_beneficiary());

-- 15. approvals - first class beneficiaries
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_approvals" ON public.approvals;
CREATE POLICY "first_class_beneficiaries_can_view_approvals" ON public.approvals
  FOR SELECT TO authenticated
  USING (is_financial_staff() OR is_first_class_beneficiary());

-- 16. bank_statements - first class beneficiaries
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_bank_statements" ON public.bank_statements;
CREATE POLICY "first_class_beneficiaries_can_view_bank_statements" ON public.bank_statements
  FOR SELECT TO authenticated
  USING (is_financial_staff() OR is_first_class_beneficiary());