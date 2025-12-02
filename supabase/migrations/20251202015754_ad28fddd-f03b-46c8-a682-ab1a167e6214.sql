-- المرحلة الأولى: نظام شفافية منفصل للورثة

-- 1. إضافة عمود target_role لتحديد الفئة المستهدفة
ALTER TABLE beneficiary_visibility_settings 
ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'beneficiary' CHECK (target_role IN ('beneficiary', 'waqf_heir'));

-- 2. تحديث السجل الحالي ليكون للمستفيدين
UPDATE beneficiary_visibility_settings
SET target_role = 'beneficiary'
WHERE target_role IS NULL;

-- 3. إنشاء سجل منفصل للورثة بشفافية كاملة
INSERT INTO beneficiary_visibility_settings (
  target_role,
  show_overview, show_profile, show_requests, show_distributions,
  show_statements, show_properties, show_documents, show_bank_accounts,
  show_financial_reports, show_approvals_log, show_disclosures,
  show_governance, show_budgets,
  show_other_beneficiaries_names, show_other_beneficiaries_amounts,
  show_other_beneficiaries_personal_data, show_family_tree,
  show_total_beneficiaries_count, show_beneficiary_categories,
  show_beneficiaries_statistics, show_inactive_beneficiaries,
  mask_iban, mask_phone_numbers, mask_exact_amounts,
  mask_tenant_info, mask_national_ids,
  show_bank_balances, show_bank_transactions, show_bank_statements,
  show_invoices, show_contracts_details, show_maintenance_costs,
  show_property_revenues, show_expenses_breakdown,
  show_governance_meetings, show_nazer_decisions, show_policy_changes,
  show_strategic_plans, show_audit_reports, show_compliance_reports,
  show_own_loans, show_other_loans, mask_loan_amounts,
  show_emergency_aid, show_emergency_statistics,
  show_annual_budget, show_budget_execution, show_reserve_funds,
  show_investment_plans,
  show_journal_entries, show_trial_balance, show_ledger_details,
  show_internal_messages, show_support_tickets,
  allow_export_pdf, allow_print
) VALUES (
  'waqf_heir',
  true, true, true, true, true, true, true, true, true, true, true, true, true,
  true, true, true, true, true, true, true, true,
  false, false, false, false, false,
  true, true, true, true, true, true, true, true,
  true, true, true, true, true, true,
  true, true, false, true, true,
  true, true, true, true,
  true, true, true,
  true, true,
  true, true
)
ON CONFLICT DO NOTHING;

-- 4. تحديث سياسات RLS للعقود
DROP POLICY IF EXISTS "heirs_cannot_view_contracts" ON contracts;
DROP POLICY IF EXISTS "staff_view_contracts" ON contracts;
DROP POLICY IF EXISTS "staff_and_heirs_view_contracts" ON contracts;
DROP POLICY IF EXISTS "staff_manage_contracts" ON contracts;

CREATE POLICY "staff_and_heirs_view_contracts"
ON contracts FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "staff_manage_contracts"
ON contracts FOR ALL
USING (is_staff());

-- 5. تحديث سياسات RLS لدفعات الإيجار
DROP POLICY IF EXISTS "staff_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "staff_and_heirs_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "staff_manage_rental_payments" ON rental_payments;

CREATE POLICY "staff_and_heirs_view_rental_payments"
ON rental_payments FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "staff_manage_rental_payments"
ON rental_payments FOR ALL
USING (is_staff());

-- 6. تحديث سياسات RLS للفواتير
DROP POLICY IF EXISTS "staff_view_invoices" ON invoices;
DROP POLICY IF EXISTS "staff_and_heirs_view_invoices" ON invoices;
DROP POLICY IF EXISTS "staff_manage_invoices" ON invoices;

CREATE POLICY "staff_and_heirs_view_invoices"
ON invoices FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "staff_manage_invoices"
ON invoices FOR ALL
USING (is_staff());

-- 7. تحديث سياسات RLS للحسابات البنكية
DROP POLICY IF EXISTS "staff_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "staff_and_heirs_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "staff_manage_bank_accounts" ON bank_accounts;

CREATE POLICY "staff_and_heirs_view_bank_accounts"
ON bank_accounts FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "staff_manage_bank_accounts"
ON bank_accounts FOR ALL
USING (is_staff());

-- 8. تحديث سياسات RLS للقيود المحاسبية
DROP POLICY IF EXISTS "staff_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "staff_and_heirs_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "staff_manage_journal_entries" ON journal_entries;

CREATE POLICY "staff_and_heirs_view_journal_entries"
ON journal_entries FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "staff_manage_journal_entries"
ON journal_entries FOR ALL
USING (is_staff());

-- 9. تحديث سياسات RLS لتفاصيل القيود
DROP POLICY IF EXISTS "staff_view_journal_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "staff_and_heirs_view_journal_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "staff_manage_journal_lines" ON journal_entry_lines;

CREATE POLICY "staff_and_heirs_view_journal_lines"
ON journal_entry_lines FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "staff_manage_journal_lines"
ON journal_entry_lines FOR ALL
USING (is_staff());

-- 10. تحديث سياسات RLS للتوزيعات
DROP POLICY IF EXISTS "staff_view_distributions" ON distributions;
DROP POLICY IF EXISTS "beneficiaries_view_own_distributions" ON distributions;
DROP POLICY IF EXISTS "staff_and_heirs_view_all_distributions" ON distributions;
DROP POLICY IF EXISTS "beneficiaries_view_related_distributions" ON distributions;
DROP POLICY IF EXISTS "staff_manage_distributions" ON distributions;

CREATE POLICY "staff_and_heirs_view_all_distributions"
ON distributions FOR SELECT
USING (is_staff() OR is_waqf_heir());

CREATE POLICY "beneficiaries_view_related_distributions"
ON distributions FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM beneficiaries
    WHERE id IN (
      SELECT beneficiary_id FROM distribution_details
      WHERE distribution_id = distributions.id
    )
  )
);

CREATE POLICY "staff_manage_distributions"
ON distributions FOR ALL
USING (is_staff());