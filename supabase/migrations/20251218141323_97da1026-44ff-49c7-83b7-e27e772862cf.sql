
-- Batch 8 retry: Without knowledge_base
-- journal_entries
DROP POLICY IF EXISTS "staff_manage_journal_entries" ON public.journal_entries;
CREATE POLICY "financial_staff_journal_entries" ON public.journal_entries
FOR ALL TO authenticated
USING (is_financial_staff());

-- journal_entry_lines
DROP POLICY IF EXISTS "staff_manage_journal_lines" ON public.journal_entry_lines;
CREATE POLICY "financial_staff_journal_lines" ON public.journal_entry_lines
FOR ALL TO authenticated
USING (is_financial_staff());

-- maintenance_requests
DROP POLICY IF EXISTS "staff_manage_maintenance" ON public.maintenance_requests;
CREATE POLICY "staff_manage_maintenance" ON public.maintenance_requests
FOR ALL TO authenticated
USING (has_staff_access());

-- notifications
DROP POLICY IF EXISTS "users_view_own_notifications" ON public.notifications;
CREATE POLICY "users_own_notifications" ON public.notifications
FOR ALL TO authenticated
USING (user_id = auth.uid());

-- opening_balances
DROP POLICY IF EXISTS "staff_manage_opening_balances" ON public.opening_balances;
CREATE POLICY "financial_opening_balances" ON public.opening_balances
FOR ALL TO authenticated
USING (is_financial_staff());

-- payment_vouchers
DROP POLICY IF EXISTS "staff_manage_payment_vouchers" ON public.payment_vouchers;
CREATE POLICY "financial_payment_vouchers" ON public.payment_vouchers
FOR ALL TO authenticated
USING (is_financial_staff());

-- pos_transactions
DROP POLICY IF EXISTS "staff_manage_pos_transactions" ON public.pos_transactions;
CREATE POLICY "financial_pos_transactions" ON public.pos_transactions
FOR ALL TO authenticated
USING (is_financial_staff());

-- property_units
DROP POLICY IF EXISTS "staff_manage_units" ON public.property_units;
CREATE POLICY "staff_manage_units" ON public.property_units
FOR ALL TO authenticated
USING (has_staff_access());
