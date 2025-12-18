
-- Batch final: Verified tables with correct columns

-- dashboard_widgets
DROP POLICY IF EXISTS "users_manage_own_widgets" ON public.dashboard_widgets;
CREATE POLICY "users_manage_widgets" ON public.dashboard_widgets
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM dashboards d WHERE d.id = dashboard_id AND d.created_by = auth.uid())
  OR is_admin()
);

-- dashboards
DROP POLICY IF EXISTS "users_update_own_dashboards" ON public.dashboards;
CREATE POLICY "users_manage_dashboards" ON public.dashboards
FOR ALL TO authenticated
USING (created_by = auth.uid() OR is_admin());

-- disclosure_beneficiaries
DROP POLICY IF EXISTS "الجميع يمكنهم مشاهدة المستفيدين ف" ON public.disclosure_beneficiaries;
CREATE POLICY "view_disclosure_beneficiaries" ON public.disclosure_beneficiaries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM annual_disclosures ad 
    WHERE ad.id = disclosure_id 
    AND (ad.status = 'published' OR is_financial_staff())
  )
);

-- rental_payments
DROP POLICY IF EXISTS "staff_manage_rental_payments" ON public.rental_payments;
CREATE POLICY "financial_rental_payments" ON public.rental_payments
FOR ALL TO authenticated
USING (is_financial_staff());

-- request_attachments
DROP POLICY IF EXISTS "staff_manage_request_attachments" ON public.request_attachments;
CREATE POLICY "staff_request_attachments" ON public.request_attachments
FOR ALL TO authenticated
USING (has_staff_access());

-- request_types
DROP POLICY IF EXISTS "staff_manage_request_types" ON public.request_types;
CREATE POLICY "staff_request_types" ON public.request_types
FOR ALL TO authenticated
USING (has_staff_access());

-- support_tickets - use user_id instead of created_by
DROP POLICY IF EXISTS "staff_manage_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "users_view_own_tickets" ON public.support_tickets;
CREATE POLICY "tickets_access" ON public.support_tickets
FOR ALL TO authenticated
USING (has_staff_access() OR user_id = auth.uid());

-- tenant_ledger
DROP POLICY IF EXISTS "staff_manage_tenant_ledger" ON public.tenant_ledger;
CREATE POLICY "financial_tenant_ledger" ON public.tenant_ledger
FOR ALL TO authenticated
USING (is_financial_staff());
