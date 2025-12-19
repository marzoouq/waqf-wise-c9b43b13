
-- ============================================
-- المرحلة 5: تنظيف وتوحيد السياسات المتضاربة
-- ============================================

-- 1. تنظيف سياسات beneficiary_requests (11 سياسة → 4)
DROP POLICY IF EXISTS "Admins can delete requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "admin_delete_beneficiary_requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "beneficiary_requests_own" ON beneficiary_requests;
DROP POLICY IF EXISTS "beneficiary_requests_staff_or_owner" ON beneficiary_requests;
DROP POLICY IF EXISTS "staff_insert_beneficiary_requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "staff_manage_requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "staff_select_beneficiary_requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "staff_update_beneficiary_requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم إضافة طلبات" ON beneficiary_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية طلباتهم فق" ON beneficiary_requests;

CREATE POLICY "requests_select_unified" ON beneficiary_requests
FOR SELECT TO authenticated
USING (
  public.is_staff() OR 
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "requests_insert_unified" ON beneficiary_requests
FOR INSERT TO authenticated
WITH CHECK (
  public.is_staff() OR 
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "requests_update_unified" ON beneficiary_requests
FOR UPDATE TO authenticated
USING (public.is_staff());

CREATE POLICY "requests_delete_unified" ON beneficiary_requests
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 2. تنظيف سياسات loan_installments (10 سياسات → 4)
DROP POLICY IF EXISTS "Admins can insert installments" ON loan_installments;
DROP POLICY IF EXISTS "Admins can update installments" ON loan_installments;
DROP POLICY IF EXISTS "admin_delete_loan_installments" ON loan_installments;
DROP POLICY IF EXISTS "financial_loan_installments" ON loan_installments;
DROP POLICY IF EXISTS "staff_insert_loan_installments" ON loan_installments;
DROP POLICY IF EXISTS "staff_manage_loan_installments" ON loan_installments;
DROP POLICY IF EXISTS "staff_or_own_view_installments" ON loan_installments;
DROP POLICY IF EXISTS "staff_select_loan_installments" ON loan_installments;
DROP POLICY IF EXISTS "staff_update_loan_installments" ON loan_installments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية أقساطهم فق" ON loan_installments;

CREATE POLICY "installments_select_unified" ON loan_installments
FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR 
  loan_id IN (
    SELECT id FROM loans WHERE beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "installments_insert_unified" ON loan_installments
FOR INSERT TO authenticated
WITH CHECK (public.is_financial_staff());

CREATE POLICY "installments_update_unified" ON loan_installments
FOR UPDATE TO authenticated
USING (public.is_financial_staff());

CREATE POLICY "installments_delete_unified" ON loan_installments
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 3. تنظيف سياسات approval_workflows (10 سياسات → 4)
DROP POLICY IF EXISTS "admin_delete_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "admin_insert_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "admin_nazer_manage_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "admin_update_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "admins_can_delete_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "admins_can_insert_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "admins_can_update_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "staff_can_read_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "staff_select_approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "staff_view_workflows_secure" ON approval_workflows;

CREATE POLICY "workflows_select_unified" ON approval_workflows
FOR SELECT TO authenticated
USING (public.is_staff());

CREATE POLICY "workflows_insert_unified" ON approval_workflows
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "workflows_update_unified" ON approval_workflows
FOR UPDATE TO authenticated
USING (public.is_admin_or_nazer());

CREATE POLICY "workflows_delete_unified" ON approval_workflows
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 4. تنظيف سياسات payment_vouchers (10 سياسات → 4)
DROP POLICY IF EXISTS "admin_delete_payment_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "financial_payment_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "payment_vouchers_delete_unified" ON payment_vouchers;
DROP POLICY IF EXISTS "payment_vouchers_insert_unified" ON payment_vouchers;
DROP POLICY IF EXISTS "payment_vouchers_select_unified" ON payment_vouchers;
DROP POLICY IF EXISTS "payment_vouchers_update_unified" ON payment_vouchers;
DROP POLICY IF EXISTS "staff_insert_payment_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "staff_select_payment_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "staff_update_payment_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية سنداتهم" ON payment_vouchers;

CREATE POLICY "vouchers_select_unified" ON payment_vouchers
FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR 
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "vouchers_insert_unified" ON payment_vouchers
FOR INSERT TO authenticated
WITH CHECK (public.is_financial_staff());

CREATE POLICY "vouchers_update_unified" ON payment_vouchers
FOR UPDATE TO authenticated
USING (public.is_financial_staff());

CREATE POLICY "vouchers_delete_unified" ON payment_vouchers
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 5. تنظيف سياسات approval_steps (9 سياسات → 4)
DROP POLICY IF EXISTS "admin_nazer_manage_steps" ON approval_steps;
DROP POLICY IF EXISTS "admins_can_insert_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "admins_can_update_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "staff_can_read_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "staff_delete_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "staff_insert_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "staff_select_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "staff_update_approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "staff_view_approval_steps_secure" ON approval_steps;

CREATE POLICY "steps_select_unified" ON approval_steps
FOR SELECT TO authenticated
USING (public.is_staff());

CREATE POLICY "steps_insert_unified" ON approval_steps
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "steps_update_unified" ON approval_steps
FOR UPDATE TO authenticated
USING (public.is_admin_or_nazer());

CREATE POLICY "steps_delete_unified" ON approval_steps
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 6. تنظيف سياسات approval_status (9 سياسات → 4)
DROP POLICY IF EXISTS "admin_nazer_manage_status" ON approval_status;
DROP POLICY IF EXISTS "admins_can_insert_approval_status" ON approval_status;
DROP POLICY IF EXISTS "admins_can_update_approval_status" ON approval_status;
DROP POLICY IF EXISTS "staff_can_read_approval_status" ON approval_status;
DROP POLICY IF EXISTS "staff_delete_approval_status" ON approval_status;
DROP POLICY IF EXISTS "staff_insert_approval_status" ON approval_status;
DROP POLICY IF EXISTS "staff_select_approval_status" ON approval_status;
DROP POLICY IF EXISTS "staff_update_approval_status" ON approval_status;
DROP POLICY IF EXISTS "staff_view_approval_status_secure" ON approval_status;

CREATE POLICY "status_select_unified" ON approval_status
FOR SELECT TO authenticated
USING (public.is_staff());

CREATE POLICY "status_insert_unified" ON approval_status
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "status_update_unified" ON approval_status
FOR UPDATE TO authenticated
USING (public.is_admin_or_nazer());

CREATE POLICY "status_delete_unified" ON approval_status
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 7. تنظيف سياسات distribution_details (9 سياسات → 4)
DROP POLICY IF EXISTS "admin_delete_distribution_details" ON distribution_details;
DROP POLICY IF EXISTS "distribution_details_access" ON distribution_details;
DROP POLICY IF EXISTS "full_access_select_distribution_details" ON distribution_details;
DROP POLICY IF EXISTS "staff_insert_distribution_details" ON distribution_details;
DROP POLICY IF EXISTS "staff_update_distribution_details" ON distribution_details;
DROP POLICY IF EXISTS "waqf_heirs_can_view_own_distribution_details" ON distribution_details;
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة تفاصيل التوزي" ON distribution_details;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إدارة تفاصيل الت" ON distribution_details;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON distribution_details;

CREATE POLICY "dist_details_select_unified" ON distribution_details
FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR 
  public.is_heir() OR
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "dist_details_insert_unified" ON distribution_details
FOR INSERT TO authenticated
WITH CHECK (public.is_financial_staff());

CREATE POLICY "dist_details_update_unified" ON distribution_details
FOR UPDATE TO authenticated
USING (public.is_financial_staff());

CREATE POLICY "dist_details_delete_unified" ON distribution_details
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 8. تنظيف سياسات auto_journal_templates (9 سياسات → 4)
DROP POLICY IF EXISTS "admin_delete_auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "admin_insert_auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "admin_manage_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "admin_update_auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "admins_can_insert_auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "admins_can_update_auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "financial_staff_can_read_auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "financial_staff_read_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "staff_select_auto_journal_templates" ON auto_journal_templates;

CREATE POLICY "templates_select_unified" ON auto_journal_templates
FOR SELECT TO authenticated
USING (public.is_financial_staff());

CREATE POLICY "templates_insert_unified" ON auto_journal_templates
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "templates_update_unified" ON auto_journal_templates
FOR UPDATE TO authenticated
USING (public.is_admin_or_nazer());

CREATE POLICY "templates_delete_unified" ON auto_journal_templates
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 9. تنظيف سياسات bank_matching_rules (9 سياسات → 4)
DROP POLICY IF EXISTS "accountants_read_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "admin_delete_bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "admin_insert_bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "admin_manage_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "admin_update_bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "admins_can_insert_bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "admins_can_update_bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "financial_staff_can_read_bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "staff_select_bank_matching_rules" ON bank_matching_rules;

CREATE POLICY "matching_rules_select_unified" ON bank_matching_rules
FOR SELECT TO authenticated
USING (public.is_financial_staff());

CREATE POLICY "matching_rules_insert_unified" ON bank_matching_rules
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "matching_rules_update_unified" ON bank_matching_rules
FOR UPDATE TO authenticated
USING (public.is_admin_or_nazer());

CREATE POLICY "matching_rules_delete_unified" ON bank_matching_rules
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());

-- 10. تنظيف سياسات loan_payments (9 سياسات → 4)
DROP POLICY IF EXISTS "admin_delete_loan_payments" ON loan_payments;
DROP POLICY IF EXISTS "loan_payments_staff_manage" ON loan_payments;
DROP POLICY IF EXISTS "staff_insert_loan_payments" ON loan_payments;
DROP POLICY IF EXISTS "staff_manage_loan_payments" ON loan_payments;
DROP POLICY IF EXISTS "staff_select_loan_payments" ON loan_payments;
DROP POLICY IF EXISTS "staff_update_loan_payments" ON loan_payments;
DROP POLICY IF EXISTS "المستفيدون والموظفون يمكنهم قراءة" ON loan_payments;
DROP POLICY IF EXISTS "الموظفون المصرح لهم يمكنهم إضافة س" ON loan_payments;
DROP POLICY IF EXISTS "الموظفون المصرح لهم يمكنهم تحديث س" ON loan_payments;

CREATE POLICY "loan_payments_select_unified" ON loan_payments
FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR 
  loan_id IN (
    SELECT id FROM loans WHERE beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "loan_payments_insert_unified" ON loan_payments
FOR INSERT TO authenticated
WITH CHECK (public.is_financial_staff());

CREATE POLICY "loan_payments_update_unified" ON loan_payments
FOR UPDATE TO authenticated
USING (public.is_financial_staff());

CREATE POLICY "loan_payments_delete_unified" ON loan_payments
FOR DELETE TO authenticated
USING (public.is_admin_or_nazer());
