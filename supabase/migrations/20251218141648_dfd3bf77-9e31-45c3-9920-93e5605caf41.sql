
-- Batch 16: system, tenant, user, voting, zatca tables

-- system_health_checks
DROP POLICY IF EXISTS "Admins can delete old health checks" ON public.system_health_checks;
DROP POLICY IF EXISTS "Admins can read health checks" ON public.system_health_checks;
CREATE POLICY "admin_health_checks" ON public.system_health_checks
FOR ALL TO authenticated
USING (is_admin());

-- system_settings
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم تحديث الإعدا" ON public.system_settings;
CREATE POLICY "admin_system_settings" ON public.system_settings
FOR ALL TO authenticated
USING (is_admin());

-- tenant_ledger
DROP POLICY IF EXISTS "Staff can view tenant ledger" ON public.tenant_ledger;
CREATE POLICY "financial_tenant_ledger_v2" ON public.tenant_ledger
FOR ALL TO authenticated
USING (is_financial_staff());

-- tenants
DROP POLICY IF EXISTS "Staff can delete tenants" ON public.tenants;
DROP POLICY IF EXISTS "Staff can update tenants" ON public.tenants;
DROP POLICY IF EXISTS "Staff can view tenants" ON public.tenants;
CREATE POLICY "staff_tenants" ON public.tenants
FOR ALL TO authenticated
USING (has_staff_access());

-- user_sessions
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
CREATE POLICY "admin_user_sessions" ON public.user_sessions
FOR SELECT TO authenticated
USING (is_admin() OR user_id = auth.uid());

-- voting_delegations
DROP POLICY IF EXISTS "users_can_view_own_delegations" ON public.voting_delegations;
CREATE POLICY "voting_delegations_access" ON public.voting_delegations
FOR SELECT TO authenticated
USING (delegator_id = auth.uid() OR delegate_id = auth.uid() OR is_admin());

-- zatca_submission_log
DROP POLICY IF EXISTS "accountants_read_zatca_log" ON public.zatca_submission_log;
DROP POLICY IF EXISTS "admin_update_zatca_log" ON public.zatca_submission_log;
CREATE POLICY "financial_zatca_log" ON public.zatca_submission_log
FOR ALL TO authenticated
USING (is_financial_staff());

-- disclosure_beneficiaries remaining
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة تفاصيل ال" ON public.disclosure_beneficiaries;
