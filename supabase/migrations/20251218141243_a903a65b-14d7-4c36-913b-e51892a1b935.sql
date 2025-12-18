
-- Batch 5: Update remaining RLS policies

-- beneficiary_requests
DROP POLICY IF EXISTS "request_view_own_only" ON public.beneficiary_requests;
DROP POLICY IF EXISTS "beneficiary_requests_owner_or_staff" ON public.beneficiary_requests;

CREATE POLICY "beneficiary_requests_staff_or_owner" ON public.beneficiary_requests
FOR ALL TO authenticated
USING (has_staff_access() OR owns_beneficiary(beneficiary_id));

-- beneficiary_sessions
DROP POLICY IF EXISTS "Staff can view all sessions" ON public.beneficiary_sessions;
CREATE POLICY "staff_view_sessions" ON public.beneficiary_sessions
FOR SELECT TO authenticated
USING (has_staff_access());

-- beneficiary_tags
DROP POLICY IF EXISTS "staff_manage_beneficiary_tags" ON public.beneficiary_tags;
CREATE POLICY "staff_manage_tags" ON public.beneficiary_tags
FOR ALL TO authenticated
USING (has_staff_access());

-- beneficiary_visibility_audit
DROP POLICY IF EXISTS "nazer_admin_can_view_audit" ON public.beneficiary_visibility_audit;
CREATE POLICY "admin_view_visibility_audit" ON public.beneficiary_visibility_audit
FOR SELECT TO authenticated
USING (is_admin());

-- beneficiary_visibility_settings
DROP POLICY IF EXISTS "nazer_admin_can_manage_visibility" ON public.beneficiary_visibility_settings;
CREATE POLICY "admin_manage_visibility" ON public.beneficiary_visibility_settings
FOR ALL TO authenticated
USING (is_admin());

-- cashier_shifts
DROP POLICY IF EXISTS "pos_shifts_update" ON public.cashier_shifts;
DROP POLICY IF EXISTS "pos_shifts_select" ON public.cashier_shifts;
CREATE POLICY "staff_manage_shifts" ON public.cashier_shifts
FOR ALL TO authenticated
USING (is_financial_staff());

-- contract_attachments
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة مرفقات ال" ON public.contract_attachments;
CREATE POLICY "authenticated_view_attachments" ON public.contract_attachments
FOR SELECT TO authenticated
USING (true);

-- contract_units
DROP POLICY IF EXISTS "staff_view_contract_units" ON public.contract_units;
DROP POLICY IF EXISTS "staff_manage_contract_units" ON public.contract_units;
CREATE POLICY "staff_manage_contract_units" ON public.contract_units
FOR ALL TO authenticated
USING (has_staff_access());
