-- الدفعة 4: سياسات BENEFICIARY (بدون الجداول المفقودة)

-- beneficiary_requests
DROP POLICY IF EXISTS "beneficiary_requests_own" ON public.beneficiary_requests;
CREATE POLICY "beneficiary_requests_own" ON public.beneficiary_requests
  FOR ALL USING (
    owns_beneficiary(beneficiary_id) OR has_staff_access()
  );

-- heir_distributions
DROP POLICY IF EXISTS "heir_distributions_heirs_own" ON public.heir_distributions;
CREATE POLICY "heir_distributions_heirs_own" ON public.heir_distributions
  FOR SELECT USING (
    has_staff_access() OR 
    (has_full_read_access() AND owns_beneficiary(beneficiary_id))
  );

-- loans
DROP POLICY IF EXISTS "loans_staff_manage" ON public.loans;
CREATE POLICY "loans_staff_manage" ON public.loans
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "loans_beneficiary_own" ON public.loans;
CREATE POLICY "loans_beneficiary_own" ON public.loans
  FOR SELECT USING (owns_beneficiary(beneficiary_id));

-- loan_payments
DROP POLICY IF EXISTS "loan_payments_staff_manage" ON public.loan_payments;
CREATE POLICY "loan_payments_staff_manage" ON public.loan_payments
  FOR ALL USING (is_financial_staff());

-- notifications
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_staff_create" ON public.notifications;
CREATE POLICY "notifications_staff_create" ON public.notifications
  FOR INSERT WITH CHECK (has_staff_access());

-- payments
DROP POLICY IF EXISTS "payments_staff_manage" ON public.payments;
CREATE POLICY "payments_staff_manage" ON public.payments
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "payments_beneficiary_own" ON public.payments;
CREATE POLICY "payments_beneficiary_own" ON public.payments
  FOR SELECT USING (owns_beneficiary(beneficiary_id));

-- rental_payments
DROP POLICY IF EXISTS "rental_payments_staff_manage" ON public.rental_payments;
CREATE POLICY "rental_payments_staff_manage" ON public.rental_payments
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "rental_payments_view" ON public.rental_payments;
CREATE POLICY "rental_payments_view" ON public.rental_payments
  FOR SELECT USING (has_full_read_access());

-- support_tickets
DROP POLICY IF EXISTS "support_tickets_staff_manage" ON public.support_tickets;
CREATE POLICY "support_tickets_staff_manage" ON public.support_tickets
  FOR ALL USING (has_staff_access());

DROP POLICY IF EXISTS "support_tickets_own" ON public.support_tickets;
CREATE POLICY "support_tickets_own" ON public.support_tickets
  FOR ALL USING (auth.uid() = user_id);