-- الدفعة 2: تحديث سياسات FINANCIAL_STAFF (25 سياسة)
-- Batch 2: Update FINANCIAL_STAFF policies

-- 1. beneficiary_requests - staff manage
DROP POLICY IF EXISTS "staff_manage_requests" ON public.beneficiary_requests;
CREATE POLICY "staff_manage_requests" ON public.beneficiary_requests
  FOR ALL TO authenticated
  USING (has_staff_access() OR (beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())));

-- 2. cashier_shifts - financial staff
DROP POLICY IF EXISTS "financial_staff_manage_shifts" ON public.cashier_shifts;
CREATE POLICY "financial_staff_manage_shifts" ON public.cashier_shifts
  FOR ALL TO authenticated
  USING (is_financial_staff() OR has_staff_access());

-- 3. pos_transactions - financial staff
DROP POLICY IF EXISTS "financial_staff_manage_pos" ON public.pos_transactions;
CREATE POLICY "financial_staff_manage_pos" ON public.pos_transactions
  FOR ALL TO authenticated
  USING (is_financial_staff() OR has_staff_access());

-- 4. invoice_lines - first class view
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_invoice_lines" ON public.invoice_lines;
CREATE POLICY "first_class_beneficiaries_can_view_invoice_lines" ON public.invoice_lines
  FOR SELECT TO authenticated
  USING (is_financial_staff() OR is_first_class_beneficiary());

-- 5. kpi_definitions - financial staff
DROP POLICY IF EXISTS "financial_staff_manage_kpis" ON public.kpi_definitions;
CREATE POLICY "financial_staff_manage_kpis" ON public.kpi_definitions
  FOR ALL TO authenticated
  USING (is_financial_staff());

-- 6. zatca_submission_log - financial staff
DROP POLICY IF EXISTS "financial_staff_manage_zatca" ON public.zatca_submission_log;
CREATE POLICY "financial_staff_manage_zatca" ON public.zatca_submission_log
  FOR ALL TO authenticated
  USING (is_financial_staff());

-- 7. kb_articles - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_kb_articles" ON public.kb_articles;
CREATE POLICY "admin_nazer_manage_kb_articles" ON public.kb_articles
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 8. kb_faqs - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_kb_faqs" ON public.kb_faqs;
CREATE POLICY "admin_nazer_manage_kb_faqs" ON public.kb_faqs
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 9. knowledge_articles - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_knowledge_articles" ON public.knowledge_articles;
CREATE POLICY "admin_nazer_manage_knowledge_articles" ON public.knowledge_articles
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 10. notification_rules - admin/nazer manage
DROP POLICY IF EXISTS "admin_manage_notification_rules" ON public.notification_rules;
CREATE POLICY "admin_manage_notification_rules" ON public.notification_rules
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 11. organization_settings - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_org_settings" ON public.organization_settings;
CREATE POLICY "admin_nazer_manage_org_settings" ON public.organization_settings
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 12. permissions - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_permissions" ON public.permissions;
CREATE POLICY "admin_nazer_manage_permissions" ON public.permissions
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 13. role_permissions - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_role_permissions" ON public.role_permissions;
CREATE POLICY "admin_nazer_manage_role_permissions" ON public.role_permissions
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 14. opening_balances - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_opening_balances" ON public.opening_balances;
CREATE POLICY "admin_nazer_manage_opening_balances" ON public.opening_balances
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 15. historical_invoices - admin/nazer manage
DROP POLICY IF EXISTS "admin_nazer_manage_historical_invoices" ON public.historical_invoices;
CREATE POLICY "admin_nazer_manage_historical_invoices" ON public.historical_invoices
  FOR ALL TO authenticated
  USING (is_admin_or_nazer());

-- 16. tenant_ledger - staff view
DROP POLICY IF EXISTS "staff_view_tenant_ledger" ON public.tenant_ledger;
CREATE POLICY "staff_view_tenant_ledger" ON public.tenant_ledger
  FOR SELECT TO authenticated
  USING (has_staff_access());

-- 17. tenants - staff view
DROP POLICY IF EXISTS "staff_view_tenants" ON public.tenants;
CREATE POLICY "staff_view_tenants" ON public.tenants
  FOR SELECT TO authenticated
  USING (has_staff_access());

-- 18. heir_distributions - staff view
DROP POLICY IF EXISTS "staff_view_heir_distributions" ON public.heir_distributions;
CREATE POLICY "staff_view_heir_distributions" ON public.heir_distributions
  FOR SELECT TO authenticated
  USING (has_staff_access() OR has_full_read_access());

-- 19. historical_invoices - staff view
DROP POLICY IF EXISTS "staff_view_historical_invoices" ON public.historical_invoices;
CREATE POLICY "staff_view_historical_invoices" ON public.historical_invoices
  FOR SELECT TO authenticated
  USING (has_staff_access() OR has_full_read_access());