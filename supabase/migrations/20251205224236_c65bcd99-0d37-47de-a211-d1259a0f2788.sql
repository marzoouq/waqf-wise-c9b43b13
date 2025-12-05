
-- =====================================================
-- Critical Security Fix: Convert RLS policies - Part 3 (Corrected)
-- Version: 2.6.27
-- =====================================================

-- حذف السياسات المنشأة جزئياً
DROP POLICY IF EXISTS "financial_staff_view_bank_accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "financial_staff_manage_bank_accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "financial_staff_view_payments" ON public.payments;
DROP POLICY IF EXISTS "financial_staff_manage_payments" ON public.payments;
DROP POLICY IF EXISTS "beneficiary_view_own_payments" ON public.payments;

-- BANK_ACCOUNTS
CREATE POLICY "financial_staff_view_bank_accounts" ON public.bank_accounts
  FOR SELECT TO authenticated USING (public.is_financial_staff());

CREATE POLICY "financial_staff_manage_bank_accounts" ON public.bank_accounts
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

-- PAYMENTS (using beneficiary_id)
CREATE POLICY "financial_staff_view_payments" ON public.payments
  FOR SELECT TO authenticated USING (public.is_financial_staff());

CREATE POLICY "financial_staff_manage_payments" ON public.payments
  FOR ALL TO authenticated USING (public.is_financial_staff()) WITH CHECK (public.is_financial_staff());

CREATE POLICY "beneficiary_view_own_payments" ON public.payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.beneficiaries b WHERE b.id = payments.beneficiary_id AND b.user_id = auth.uid()));

-- LOANS
DROP POLICY IF EXISTS "financial_staff_view_loans" ON public.loans;
DROP POLICY IF EXISTS "financial_staff_manage_loans" ON public.loans;
DROP POLICY IF EXISTS "beneficiary_view_own_loans" ON public.loans;

CREATE POLICY "financial_staff_view_loans" ON public.loans
  FOR SELECT TO authenticated USING (public.is_financial_staff());

CREATE POLICY "financial_staff_manage_loans" ON public.loans
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "beneficiary_view_own_loans" ON public.loans
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.beneficiaries b WHERE b.id = loans.beneficiary_id AND b.user_id = auth.uid()));

-- CONTRACTS
DROP POLICY IF EXISTS "staff_view_contracts" ON public.contracts;
DROP POLICY IF EXISTS "staff_manage_contracts" ON public.contracts;
DROP POLICY IF EXISTS "waqf_heir_view_contracts" ON public.contracts;

CREATE POLICY "staff_view_contracts" ON public.contracts
  FOR SELECT TO authenticated USING (public.is_staff_only());

CREATE POLICY "staff_manage_contracts" ON public.contracts
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "waqf_heir_view_contracts" ON public.contracts
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- DISTRIBUTIONS
DROP POLICY IF EXISTS "financial_staff_view_distributions" ON public.distributions;
DROP POLICY IF EXISTS "financial_staff_manage_distributions" ON public.distributions;
DROP POLICY IF EXISTS "waqf_heir_view_distributions" ON public.distributions;

CREATE POLICY "financial_staff_view_distributions" ON public.distributions
  FOR SELECT TO authenticated USING (public.is_financial_staff());

CREATE POLICY "financial_staff_manage_distributions" ON public.distributions
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "waqf_heir_view_distributions" ON public.distributions
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- EMERGENCY_AID_REQUESTS
DROP POLICY IF EXISTS "staff_view_emergency_aid" ON public.emergency_aid_requests;
DROP POLICY IF EXISTS "staff_manage_emergency_aid" ON public.emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_view_own_emergency_aid" ON public.emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiary_create_emergency_aid" ON public.emergency_aid_requests;

CREATE POLICY "staff_view_emergency_aid" ON public.emergency_aid_requests
  FOR SELECT TO authenticated USING (public.is_staff_only());

CREATE POLICY "staff_manage_emergency_aid" ON public.emergency_aid_requests
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "beneficiary_view_own_emergency_aid" ON public.emergency_aid_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.beneficiaries b WHERE b.id = emergency_aid_requests.beneficiary_id AND b.user_id = auth.uid()));

CREATE POLICY "beneficiary_create_emergency_aid" ON public.emergency_aid_requests
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.beneficiaries b WHERE b.id = emergency_aid_requests.beneficiary_id AND b.user_id = auth.uid()));

-- INVOICES
DROP POLICY IF EXISTS "financial_staff_view_invoices" ON public.invoices;
DROP POLICY IF EXISTS "financial_staff_manage_invoices" ON public.invoices;
DROP POLICY IF EXISTS "waqf_heir_view_invoices" ON public.invoices;

CREATE POLICY "financial_staff_view_invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.is_financial_staff());

CREATE POLICY "financial_staff_manage_invoices" ON public.invoices
  FOR ALL TO authenticated USING (public.is_financial_staff()) WITH CHECK (public.is_financial_staff());

CREATE POLICY "waqf_heir_view_invoices" ON public.invoices
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- RENTAL_PAYMENTS
DROP POLICY IF EXISTS "financial_staff_view_rental_payments" ON public.rental_payments;
DROP POLICY IF EXISTS "financial_staff_manage_rental_payments" ON public.rental_payments;
DROP POLICY IF EXISTS "waqf_heir_view_rental_payments" ON public.rental_payments;

CREATE POLICY "financial_staff_view_rental_payments" ON public.rental_payments
  FOR SELECT TO authenticated USING (public.is_financial_staff());

CREATE POLICY "financial_staff_manage_rental_payments" ON public.rental_payments
  FOR ALL TO authenticated USING (public.is_financial_staff()) WITH CHECK (public.is_financial_staff());

CREATE POLICY "waqf_heir_view_rental_payments" ON public.rental_payments
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- SUPPORT_TICKETS
DROP POLICY IF EXISTS "user_view_own_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "user_create_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "staff_view_all_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "staff_manage_tickets" ON public.support_tickets;

CREATE POLICY "user_view_own_tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_create_tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "staff_view_all_tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (public.is_staff_only());

CREATE POLICY "staff_manage_tickets" ON public.support_tickets
  FOR ALL TO authenticated USING (public.is_staff_only()) WITH CHECK (public.is_staff_only());

-- INTERNAL_MESSAGES
DROP POLICY IF EXISTS "user_view_own_messages" ON public.internal_messages;
DROP POLICY IF EXISTS "user_send_messages" ON public.internal_messages;
DROP POLICY IF EXISTS "user_update_own_messages" ON public.internal_messages;

CREATE POLICY "user_view_own_messages" ON public.internal_messages
  FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "user_send_messages" ON public.internal_messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

CREATE POLICY "user_update_own_messages" ON public.internal_messages
  FOR UPDATE TO authenticated USING (receiver_id = auth.uid());

-- FAMILIES
DROP POLICY IF EXISTS "staff_view_families" ON public.families;
DROP POLICY IF EXISTS "staff_manage_families" ON public.families;
DROP POLICY IF EXISTS "member_view_own_family" ON public.families;
DROP POLICY IF EXISTS "waqf_heir_view_families" ON public.families;

CREATE POLICY "staff_view_families" ON public.families
  FOR SELECT TO authenticated USING (public.is_staff_only());

CREATE POLICY "staff_manage_families" ON public.families
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "member_view_own_family" ON public.families
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.beneficiaries b WHERE b.family_id = families.id AND b.user_id = auth.uid()));

CREATE POLICY "waqf_heir_view_families" ON public.families
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- PROPERTIES
DROP POLICY IF EXISTS "staff_view_properties" ON public.properties;
DROP POLICY IF EXISTS "staff_manage_properties" ON public.properties;
DROP POLICY IF EXISTS "waqf_heir_view_properties" ON public.properties;

CREATE POLICY "staff_view_properties" ON public.properties
  FOR SELECT TO authenticated USING (public.is_staff_only());

CREATE POLICY "staff_manage_properties" ON public.properties
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "waqf_heir_view_properties" ON public.properties
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- MAINTENANCE_REQUESTS
DROP POLICY IF EXISTS "staff_view_maintenance_requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "staff_manage_maintenance_requests" ON public.maintenance_requests;

CREATE POLICY "staff_view_maintenance_requests" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (public.is_staff_only());

CREATE POLICY "staff_manage_maintenance_requests" ON public.maintenance_requests
  FOR ALL TO authenticated USING (public.is_staff_only()) WITH CHECK (public.is_staff_only());

-- CONTACT_MESSAGES (allow public insert for landing page)
DROP POLICY IF EXISTS "anyone_can_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "staff_view_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "staff_manage_contact_messages" ON public.contact_messages;

CREATE POLICY "anyone_can_insert_contact" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "staff_view_contact_messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_admin_or_nazer());

CREATE POLICY "staff_manage_contact_messages" ON public.contact_messages
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

-- BENEFICIARIES
DROP POLICY IF EXISTS "staff_view_beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "staff_manage_beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "beneficiary_view_own" ON public.beneficiaries;
DROP POLICY IF EXISTS "waqf_heir_view_beneficiaries" ON public.beneficiaries;

CREATE POLICY "staff_view_beneficiaries" ON public.beneficiaries
  FOR SELECT TO authenticated USING (public.is_staff_only() OR public.is_admin_or_nazer());

CREATE POLICY "staff_manage_beneficiaries" ON public.beneficiaries
  FOR ALL TO authenticated USING (public.is_admin_or_nazer()) WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "beneficiary_view_own" ON public.beneficiaries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "waqf_heir_view_beneficiaries" ON public.beneficiaries
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir'));

-- PROFILES
DROP POLICY IF EXISTS "user_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "user_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "staff_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "user_insert_own_profile" ON public.profiles;

CREATE POLICY "user_view_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "staff_view_all_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin_or_nazer());

CREATE POLICY "user_insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
