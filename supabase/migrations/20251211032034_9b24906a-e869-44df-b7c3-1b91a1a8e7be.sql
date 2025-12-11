-- =============================================
-- توحيد سياسات RLS - بدون السياسات المحمية
-- Phase 2: RLS Policy Consolidation
-- =============================================

-- 1. جدول emergency_aid_requests - توحيد 13 سياسة
DROP POLICY IF EXISTS "Beneficiaries create emergency aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "Staff manage emergency aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "View emergency aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "admin_delete_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_create_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_insert_own_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_view_own_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_beneficiary_own" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_requests_insert_policy" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_requests_select_policy" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_requests_update_policy" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_manage_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "waqf_heir_view_emergency_aid" ON emergency_aid_requests;

CREATE POLICY "emergency_aid_select_unified" ON emergency_aid_requests FOR SELECT
USING (
  is_staff_only() 
  OR has_role(auth.uid(), 'waqf_heir')
  OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "emergency_aid_insert_unified" ON emergency_aid_requests FOR INSERT
WITH CHECK (
  is_staff_only()
  OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "emergency_aid_update_unified" ON emergency_aid_requests FOR UPDATE
USING (is_staff_only());

CREATE POLICY "emergency_aid_delete_unified" ON emergency_aid_requests FOR DELETE
USING (is_admin_or_nazer());

-- 2. جدول beneficiaries - توحيد 11 سياسة
DROP POLICY IF EXISTS "Admins can delete beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Admins can insert beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Admins can update beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Beneficiaries and staff view" ON beneficiaries;
DROP POLICY IF EXISTS "Staff manage beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiary_view_own" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiary_view_own_only" ON beneficiaries;
DROP POLICY IF EXISTS "staff_manage_beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "staff_view_beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "waqf_heir_view_beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "waqf_heirs_view_all_beneficiaries" ON beneficiaries;

CREATE POLICY "beneficiaries_select_unified" ON beneficiaries FOR SELECT
USING (
  is_staff_only() 
  OR has_role(auth.uid(), 'waqf_heir')
  OR user_id = auth.uid()
);

CREATE POLICY "beneficiaries_insert_unified" ON beneficiaries FOR INSERT
WITH CHECK (is_admin_or_nazer());

CREATE POLICY "beneficiaries_update_unified" ON beneficiaries FOR UPDATE
USING (is_admin_or_nazer());

CREATE POLICY "beneficiaries_delete_unified" ON beneficiaries FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- 3. جدول payment_vouchers - توحيد 11 سياسة
DROP POLICY IF EXISTS "Authorized users can create payment vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "Authorized users can update payment vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON payment_vouchers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON payment_vouchers;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON payment_vouchers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON payment_vouchers;
DROP POLICY IF EXISTS "Users can view payment vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "beneficiaries_view_own_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "beneficiary_read_only_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "financial_staff_manage_vouchers" ON payment_vouchers;

CREATE POLICY "payment_vouchers_select_unified" ON payment_vouchers FOR SELECT
USING (
  is_staff_only() 
  OR has_role(auth.uid(), 'waqf_heir')
  OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "payment_vouchers_insert_unified" ON payment_vouchers FOR INSERT
WITH CHECK (is_financial_staff());

CREATE POLICY "payment_vouchers_update_unified" ON payment_vouchers FOR UPDATE
USING (is_financial_staff());

CREATE POLICY "payment_vouchers_delete_unified" ON payment_vouchers FOR DELETE
USING (is_admin_or_nazer());

-- 4. جدول invoices - توحيد 10 سياسات
DROP POLICY IF EXISTS "financial_staff_manage_invoices" ON invoices;
DROP POLICY IF EXISTS "financial_staff_view_invoices" ON invoices;
DROP POLICY IF EXISTS "secure_invoices_staff_only" ON invoices;
DROP POLICY IF EXISTS "staff_and_heirs_view_invoices" ON invoices;
DROP POLICY IF EXISTS "staff_manage_invoices" ON invoices;
DROP POLICY IF EXISTS "waqf_heir_view_invoices" ON invoices;

CREATE POLICY "invoices_select_unified" ON invoices FOR SELECT
USING (is_staff_only() OR has_role(auth.uid(), 'waqf_heir'));

CREATE POLICY "invoices_insert_unified" ON invoices FOR INSERT
WITH CHECK (is_financial_staff());

CREATE POLICY "invoices_update_unified" ON invoices FOR UPDATE
USING (is_financial_staff());

CREATE POLICY "invoices_delete_unified" ON invoices FOR DELETE
USING (is_admin_or_nazer());

-- 5. جدول budgets - توحيد 10 سياسات
DROP POLICY IF EXISTS "Staff can view budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view budgets" ON budgets;
DROP POLICY IF EXISTS "financial_staff_can_insert_budgets" ON budgets;
DROP POLICY IF EXISTS "financial_staff_can_update_budgets" ON budgets;
DROP POLICY IF EXISTS "financial_staff_manage_budgets" ON budgets;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_budgets" ON budgets;
DROP POLICY IF EXISTS "staff_can_read_budgets" ON budgets;

CREATE POLICY "budgets_select_unified" ON budgets FOR SELECT
USING (is_staff_only() OR has_role(auth.uid(), 'waqf_heir') OR has_role(auth.uid(), 'beneficiary'));

CREATE POLICY "budgets_insert_unified" ON budgets FOR INSERT
WITH CHECK (is_financial_staff());

CREATE POLICY "budgets_update_unified" ON budgets FOR UPDATE
USING (is_financial_staff());

CREATE POLICY "budgets_delete_unified" ON budgets FOR DELETE
USING (is_admin_or_nazer());