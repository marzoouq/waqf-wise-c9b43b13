-- ===========================================
-- توحيد سياسات RLS المتكررة
-- Consolidate Redundant RLS Policies
-- ===========================================

-- 1. bank_accounts: حذف السياسات المتكررة وإنشاء سياسات موحدة
DROP POLICY IF EXISTS "Admin manage bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_admin_all" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_manage_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "staff_manage_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Only financial staff can delete bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Only financial staff can insert bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Financial staff view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Only financial staff can view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_staff_select" ON bank_accounts;
DROP POLICY IF EXISTS "financial_staff_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "staff_and_heirs_view_bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON bank_accounts;
DROP POLICY IF EXISTS "Only financial staff can update bank accounts" ON bank_accounts;

-- سياسات bank_accounts الموحدة (4 سياسات فقط)
CREATE POLICY "bank_accounts_select_unified" ON bank_accounts
  FOR SELECT USING (
    is_admin_or_nazer() OR 
    is_financial_staff() OR 
    is_waqf_heir()
  );

CREATE POLICY "bank_accounts_insert_unified" ON bank_accounts
  FOR INSERT WITH CHECK (is_admin_or_nazer() OR is_accountant());

CREATE POLICY "bank_accounts_update_unified" ON bank_accounts
  FOR UPDATE USING (is_admin_or_nazer() OR is_accountant());

CREATE POLICY "bank_accounts_delete_unified" ON bank_accounts
  FOR DELETE USING (is_admin_or_nazer());

-- 2. distributions: حذف السياسات المتكررة وإنشاء سياسات موحدة
DROP POLICY IF EXISTS "Staff manage distributions" ON distributions;
DROP POLICY IF EXISTS "distributions_staff_all" ON distributions;
DROP POLICY IF EXISTS "financial_staff_manage_distributions" ON distributions;
DROP POLICY IF EXISTS "Admins can delete distributions" ON distributions;
DROP POLICY IF EXISTS "Admins can insert distributions" ON distributions;
DROP POLICY IF EXISTS "View distributions" ON distributions;
DROP POLICY IF EXISTS "beneficiaries_view_related_distributions" ON distributions;
DROP POLICY IF EXISTS "beneficiary_read_only_distributions" ON distributions;
DROP POLICY IF EXISTS "distribution_view_policy" ON distributions;
DROP POLICY IF EXISTS "distributions_beneficiary_own" ON distributions;
DROP POLICY IF EXISTS "distributions_heir_view" ON distributions;
DROP POLICY IF EXISTS "distributions_staff_view" ON distributions;
DROP POLICY IF EXISTS "heirs_view_distributions" ON distributions;
DROP POLICY IF EXISTS "staff_view_all_distributions" ON distributions;
DROP POLICY IF EXISTS "waqf_heir_view_distributions" ON distributions;
DROP POLICY IF EXISTS "All staff can view distributions" ON distributions;
DROP POLICY IF EXISTS "Only admins can update distributions" ON distributions;
DROP POLICY IF EXISTS "beneficiary_view_own_distributions" ON distributions;

-- سياسات distributions الموحدة (5 سياسات فقط)
CREATE POLICY "distributions_select_staff" ON distributions
  FOR SELECT USING (is_staff_only() OR is_admin_or_nazer() OR is_accountant());

CREATE POLICY "distributions_select_heirs" ON distributions
  FOR SELECT USING (is_waqf_heir());

CREATE POLICY "distributions_select_beneficiary" ON distributions
  FOR SELECT USING (
    id IN (
      SELECT dd.distribution_id FROM distribution_details dd
      JOIN beneficiaries b ON dd.beneficiary_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "distributions_insert_unified" ON distributions
  FOR INSERT WITH CHECK (is_admin_or_nazer());

CREATE POLICY "distributions_update_unified" ON distributions
  FOR UPDATE USING (is_admin_or_nazer());

CREATE POLICY "distributions_delete_unified" ON distributions
  FOR DELETE USING (is_admin_or_nazer());