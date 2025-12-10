-- ===========================================
-- توحيد سياسات RLS - الجزء 2
-- loans, rental_payments, payments, journal_entries
-- ===========================================

-- 3. loans: حذف السياسات المتكررة
DROP POLICY IF EXISTS "Admin manage loans" ON loans;
DROP POLICY IF EXISTS "Admins can delete loans" ON loans;
DROP POLICY IF EXISTS "Admins can insert loans" ON loans;
DROP POLICY IF EXISTS "Admins can update loans" ON loans;
DROP POLICY IF EXISTS "Beneficiaries view own loans" ON loans;
DROP POLICY IF EXISTS "Only admin can manage loans" ON loans;
DROP POLICY IF EXISTS "Staff can view all loans" ON loans;
DROP POLICY IF EXISTS "beneficiaries_view_own_loans" ON loans;
DROP POLICY IF EXISTS "loans_admin_all" ON loans;
DROP POLICY IF EXISTS "loans_beneficiary_select" ON loans;
DROP POLICY IF EXISTS "loans_staff_all" ON loans;
DROP POLICY IF EXISTS "loans_staff_select" ON loans;
DROP POLICY IF EXISTS "staff_manage_loans" ON loans;
DROP POLICY IF EXISTS "staff_view_loans" ON loans;
DROP POLICY IF EXISTS "waqf_heir_view_loans" ON loans;
DROP POLICY IF EXISTS "heirs_view_all_loans" ON loans;
DROP POLICY IF EXISTS "financial_staff_manage_loans" ON loans;
DROP POLICY IF EXISTS "beneficiary_view_own_loans" ON loans;

-- سياسات loans الموحدة (5 سياسات فقط)
CREATE POLICY "loans_select_staff" ON loans
  FOR SELECT USING (is_staff_only() OR is_admin_or_nazer() OR is_accountant());

CREATE POLICY "loans_select_heirs" ON loans
  FOR SELECT USING (is_waqf_heir());

CREATE POLICY "loans_select_own" ON loans
  FOR SELECT USING (
    beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
  );

CREATE POLICY "loans_modify_unified" ON loans
  FOR ALL USING (is_admin_or_nazer() OR is_accountant())
  WITH CHECK (is_admin_or_nazer() OR is_accountant());

-- 4. rental_payments: حذف السياسات المتكررة
DROP POLICY IF EXISTS "Admin manage rental payments" ON rental_payments;
DROP POLICY IF EXISTS "Admins can manage rental payments" ON rental_payments;
DROP POLICY IF EXISTS "Only admins can delete rental payments" ON rental_payments;
DROP POLICY IF EXISTS "Only admins can insert rental payments" ON rental_payments;
DROP POLICY IF EXISTS "Only admins can update rental payments" ON rental_payments;
DROP POLICY IF EXISTS "Staff can view rental payments" ON rental_payments;
DROP POLICY IF EXISTS "financial_staff_manage_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "heirs_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "rental_payments_admin_all" ON rental_payments;
DROP POLICY IF EXISTS "rental_payments_staff_select" ON rental_payments;
DROP POLICY IF EXISTS "staff_manage_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "staff_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "waqf_heir_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "accountant_manage_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "cashier_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "all_staff_view_rental_payments" ON rental_payments;
DROP POLICY IF EXISTS "beneficiary_view_rental_payments" ON rental_payments;

-- سياسات rental_payments الموحدة (4 سياسات فقط)
CREATE POLICY "rental_payments_select_unified" ON rental_payments
  FOR SELECT USING (
    is_staff_only() OR is_admin_or_nazer() OR is_accountant() OR is_waqf_heir()
  );

CREATE POLICY "rental_payments_insert_unified" ON rental_payments
  FOR INSERT WITH CHECK (is_admin_or_nazer() OR is_accountant());

CREATE POLICY "rental_payments_update_unified" ON rental_payments
  FOR UPDATE USING (is_admin_or_nazer() OR is_accountant());

CREATE POLICY "rental_payments_delete_unified" ON rental_payments
  FOR DELETE USING (is_admin_or_nazer());

-- 5. payments: حذف السياسات المتكررة
DROP POLICY IF EXISTS "Admin manage payments" ON payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
DROP POLICY IF EXISTS "Beneficiaries view own payments" ON payments;
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
DROP POLICY IF EXISTS "financial_staff_manage_payments" ON payments;
DROP POLICY IF EXISTS "heirs_view_payments" ON payments;
DROP POLICY IF EXISTS "payments_admin_all" ON payments;
DROP POLICY IF EXISTS "payments_beneficiary_select" ON payments;
DROP POLICY IF EXISTS "payments_staff_select" ON payments;
DROP POLICY IF EXISTS "staff_manage_payments" ON payments;
DROP POLICY IF EXISTS "waqf_heir_view_payments" ON payments;
DROP POLICY IF EXISTS "accountant_manage_payments" ON payments;
DROP POLICY IF EXISTS "cashier_manage_payments" ON payments;

-- سياسات payments الموحدة (5 سياسات فقط)
CREATE POLICY "payments_select_staff" ON payments
  FOR SELECT USING (is_staff_only() OR is_admin_or_nazer() OR is_financial_staff());

CREATE POLICY "payments_select_heirs" ON payments
  FOR SELECT USING (is_waqf_heir());

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
  );

CREATE POLICY "payments_modify_unified" ON payments
  FOR ALL USING (is_admin_or_nazer() OR is_financial_staff())
  WITH CHECK (is_admin_or_nazer() OR is_financial_staff());

-- 6. journal_entries: حذف السياسات المتكررة
DROP POLICY IF EXISTS "Admin manage journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Admins can delete journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Admins can insert journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Admins can update journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Staff can view journal entries" ON journal_entries;
DROP POLICY IF EXISTS "accountant_manage_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "financial_staff_manage_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "heirs_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "journal_entries_admin_all" ON journal_entries;
DROP POLICY IF EXISTS "journal_entries_staff_select" ON journal_entries;
DROP POLICY IF EXISTS "staff_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "waqf_heir_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "all_staff_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "cashier_view_journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "beneficiary_view_journal_entries" ON journal_entries;

-- سياسات journal_entries الموحدة (4 سياسات فقط)
CREATE POLICY "journal_entries_select_unified" ON journal_entries
  FOR SELECT USING (
    is_staff_only() OR is_admin_or_nazer() OR is_accountant() OR is_waqf_heir()
  );

CREATE POLICY "journal_entries_insert_unified" ON journal_entries
  FOR INSERT WITH CHECK (is_admin_or_nazer() OR is_accountant());

CREATE POLICY "journal_entries_update_unified" ON journal_entries
  FOR UPDATE USING (is_admin_or_nazer() OR is_accountant());

CREATE POLICY "journal_entries_delete_unified" ON journal_entries
  FOR DELETE USING (is_admin_or_nazer());