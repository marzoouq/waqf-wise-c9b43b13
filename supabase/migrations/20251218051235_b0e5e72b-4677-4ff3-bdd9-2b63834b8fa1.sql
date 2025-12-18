-- الدفعة 3 (مُعدّلة): تحديث سياسات ALL_STAFF 
-- Batch 3 (Fixed): Update ALL_STAFF policies - without budget_items

-- 11. contracts - staff manage
DROP POLICY IF EXISTS "staff_manage_contracts" ON public.contracts;
CREATE POLICY "staff_manage_contracts" ON public.contracts
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 12. contract_renewals - staff manage
DROP POLICY IF EXISTS "staff_manage_contract_renewals" ON public.contract_renewals;
CREATE POLICY "staff_manage_contract_renewals" ON public.contract_renewals
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 13. distributions - staff manage
DROP POLICY IF EXISTS "staff_manage_distributions" ON public.distributions;
CREATE POLICY "staff_manage_distributions" ON public.distributions
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 14. distributions - heirs view
DROP POLICY IF EXISTS "heirs_view_distributions" ON public.distributions;
CREATE POLICY "heirs_view_distributions" ON public.distributions
  FOR SELECT TO authenticated
  USING (has_staff_access() OR has_full_read_access());

-- 15. fiscal_year_closings - staff view
DROP POLICY IF EXISTS "staff_view_fiscal_year_closings" ON public.fiscal_year_closings;
CREATE POLICY "staff_view_fiscal_year_closings" ON public.fiscal_year_closings
  FOR SELECT TO authenticated
  USING (has_staff_access() OR has_full_read_access());

-- 16. invoices - staff manage
DROP POLICY IF EXISTS "staff_manage_invoices" ON public.invoices;
CREATE POLICY "staff_manage_invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 17. journal_entries - staff manage
DROP POLICY IF EXISTS "staff_manage_journal_entries" ON public.journal_entries;
CREATE POLICY "staff_manage_journal_entries" ON public.journal_entries
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 18. journal_entry_lines - staff manage
DROP POLICY IF EXISTS "staff_manage_journal_entry_lines" ON public.journal_entry_lines;
CREATE POLICY "staff_manage_journal_entry_lines" ON public.journal_entry_lines
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 19. maintenance_requests - staff manage
DROP POLICY IF EXISTS "staff_manage_maintenance_requests" ON public.maintenance_requests;
CREATE POLICY "staff_manage_maintenance_requests" ON public.maintenance_requests
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 20. payment_vouchers - staff manage
DROP POLICY IF EXISTS "staff_manage_payment_vouchers" ON public.payment_vouchers;
CREATE POLICY "staff_manage_payment_vouchers" ON public.payment_vouchers
  FOR ALL TO authenticated
  USING (has_staff_access());

-- 21. rental_payments - staff manage
DROP POLICY IF EXISTS "staff_manage_rental_payments" ON public.rental_payments;
CREATE POLICY "staff_manage_rental_payments" ON public.rental_payments
  FOR ALL TO authenticated
  USING (has_staff_access());