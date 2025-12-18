-- =====================================================
-- الدفعة 3: تحديث سياسات جداول المستفيدين والتوزيعات (إعادة تشغيل)
-- =====================================================

-- 1. beneficiary_requests - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view all requests" ON public.beneficiary_requests;
DROP POLICY IF EXISTS "Beneficiaries can view own requests" ON public.beneficiary_requests;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض جميع الطلبات" ON public.beneficiary_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم عرض طلباتهم" ON public.beneficiary_requests;

CREATE POLICY "staff_select_beneficiary_requests" ON public.beneficiary_requests
FOR SELECT TO authenticated USING (
  has_staff_access() OR 
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "staff_insert_beneficiary_requests" ON public.beneficiary_requests
FOR INSERT TO authenticated WITH CHECK (
  has_staff_access() OR 
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "staff_update_beneficiary_requests" ON public.beneficiary_requests
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_beneficiary_requests" ON public.beneficiary_requests
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 2. beneficiary_sessions - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view beneficiary sessions" ON public.beneficiary_sessions;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض جلسات المستفيدين" ON public.beneficiary_sessions;

CREATE POLICY "staff_select_beneficiary_sessions" ON public.beneficiary_sessions
FOR SELECT TO authenticated USING (
  has_staff_access() OR user_id = auth.uid()
);

CREATE POLICY "user_insert_beneficiary_sessions" ON public.beneficiary_sessions
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR has_staff_access());

CREATE POLICY "user_update_beneficiary_sessions" ON public.beneficiary_sessions
FOR UPDATE TO authenticated USING (user_id = auth.uid() OR has_staff_access());

CREATE POLICY "admin_delete_beneficiary_sessions" ON public.beneficiary_sessions
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 3. beneficiary_tags - تحديث السياسات
DROP POLICY IF EXISTS "Staff can manage beneficiary tags" ON public.beneficiary_tags;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة علامات المستفيدين" ON public.beneficiary_tags;

CREATE POLICY "staff_select_beneficiary_tags" ON public.beneficiary_tags
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_beneficiary_tags" ON public.beneficiary_tags
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_beneficiary_tags" ON public.beneficiary_tags
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_beneficiary_tags" ON public.beneficiary_tags
FOR DELETE TO authenticated USING (has_staff_access());

-- 4. beneficiary_visibility_audit - تحديث السياسات
DROP POLICY IF EXISTS "Admin can view visibility audit" ON public.beneficiary_visibility_audit;
DROP POLICY IF EXISTS "المسؤولون يمكنهم عرض سجل تغييرات الرؤية" ON public.beneficiary_visibility_audit;

CREATE POLICY "admin_select_beneficiary_visibility_audit" ON public.beneficiary_visibility_audit
FOR SELECT TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_insert_beneficiary_visibility_audit" ON public.beneficiary_visibility_audit
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

-- 5. beneficiary_visibility_settings - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view visibility settings" ON public.beneficiary_visibility_settings;
DROP POLICY IF EXISTS "Admin can manage visibility settings" ON public.beneficiary_visibility_settings;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض إعدادات الرؤية" ON public.beneficiary_visibility_settings;

CREATE POLICY "staff_select_beneficiary_visibility_settings" ON public.beneficiary_visibility_settings
FOR SELECT TO authenticated USING (has_full_read_access());

CREATE POLICY "admin_insert_beneficiary_visibility_settings" ON public.beneficiary_visibility_settings
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_beneficiary_visibility_settings" ON public.beneficiary_visibility_settings
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_beneficiary_visibility_settings" ON public.beneficiary_visibility_settings
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 6. distribution_approvals - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view distribution approvals" ON public.distribution_approvals;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض موافقات التوزيعات" ON public.distribution_approvals;

CREATE POLICY "staff_select_distribution_approvals" ON public.distribution_approvals
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_distribution_approvals" ON public.distribution_approvals
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_distribution_approvals" ON public.distribution_approvals
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_distribution_approvals" ON public.distribution_approvals
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 7. distribution_details - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view distribution details" ON public.distribution_details;
DROP POLICY IF EXISTS "Heirs can view own distribution details" ON public.distribution_details;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض تفاصيل التوزيعات" ON public.distribution_details;

CREATE POLICY "full_access_select_distribution_details" ON public.distribution_details
FOR SELECT TO authenticated USING (
  has_staff_access() OR 
  has_full_read_access() OR
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "staff_insert_distribution_details" ON public.distribution_details
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_distribution_details" ON public.distribution_details
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_distribution_details" ON public.distribution_details
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 8. loan_approvals - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view loan approvals" ON public.loan_approvals;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض موافقات القروض" ON public.loan_approvals;

CREATE POLICY "staff_select_loan_approvals" ON public.loan_approvals
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_loan_approvals" ON public.loan_approvals
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_loan_approvals" ON public.loan_approvals
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_loan_approvals" ON public.loan_approvals
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 9. loan_installments - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view loan installments" ON public.loan_installments;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض أقساط القروض" ON public.loan_installments;

CREATE POLICY "staff_select_loan_installments" ON public.loan_installments
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_loan_installments" ON public.loan_installments
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_loan_installments" ON public.loan_installments
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_loan_installments" ON public.loan_installments
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 10. loan_payments - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view loan payments" ON public.loan_payments;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض دفعات القروض" ON public.loan_payments;

CREATE POLICY "staff_select_loan_payments" ON public.loan_payments
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_loan_payments" ON public.loan_payments
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_loan_payments" ON public.loan_payments
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_loan_payments" ON public.loan_payments
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 11. payment_approvals - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view payment approvals" ON public.payment_approvals;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض موافقات المدفوعات" ON public.payment_approvals;

CREATE POLICY "staff_select_payment_approvals" ON public.payment_approvals
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_payment_approvals" ON public.payment_approvals
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_payment_approvals" ON public.payment_approvals
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "admin_delete_payment_approvals" ON public.payment_approvals
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 12. payment_vouchers - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view payment vouchers" ON public.payment_vouchers;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض سندات الصرف" ON public.payment_vouchers;

CREATE POLICY "staff_select_payment_vouchers" ON public.payment_vouchers
FOR SELECT TO authenticated USING (has_full_read_access());

CREATE POLICY "staff_insert_payment_vouchers" ON public.payment_vouchers
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "staff_update_payment_vouchers" ON public.payment_vouchers
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "admin_delete_payment_vouchers" ON public.payment_vouchers
FOR DELETE TO authenticated USING (is_admin_or_nazer());