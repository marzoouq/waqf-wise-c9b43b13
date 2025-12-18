
-- Batch 13: loan, notification, opening tables

-- loan_installments
DROP POLICY IF EXISTS "financial_staff_manage_loan_installments" ON public.loan_installments;
CREATE POLICY "financial_loan_installments" ON public.loan_installments
FOR ALL TO authenticated
USING (is_financial_staff());

-- notification_logs
DROP POLICY IF EXISTS "users_read_own_notification_logs" ON public.notification_logs;
CREATE POLICY "users_notification_logs" ON public.notification_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_staff_access());

-- notification_rules
DROP POLICY IF EXISTS "notification_rules_staff_only" ON public.notification_rules;
CREATE POLICY "staff_notification_rules" ON public.notification_rules
FOR ALL TO authenticated
USING (has_staff_access());

-- opening_balances
DROP POLICY IF EXISTS "open_bal_manage" ON public.opening_balances;
DROP POLICY IF EXISTS "open_bal_view" ON public.opening_balances;
CREATE POLICY "financial_opening_bal" ON public.opening_balances
FOR ALL TO authenticated
USING (is_financial_staff());

-- organization_settings
DROP POLICY IF EXISTS "admin_nazer_update_org_settings" ON public.organization_settings;
CREATE POLICY "admin_org_settings" ON public.organization_settings
FOR ALL TO authenticated
USING (is_admin());

-- permissions
DROP POLICY IF EXISTS "Admin can manage permissions" ON public.permissions;
CREATE POLICY "admin_permissions" ON public.permissions
FOR ALL TO authenticated
USING (is_admin());

-- pos_transactions
DROP POLICY IF EXISTS "pos_trans_select" ON public.pos_transactions;
DROP POLICY IF EXISTS "pos_trans_update" ON public.pos_transactions;
CREATE POLICY "financial_pos_trans" ON public.pos_transactions
FOR ALL TO authenticated
USING (is_financial_staff());
