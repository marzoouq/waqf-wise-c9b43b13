
-- Batch 11: eligibility, family, financial tables

-- eligibility_criteria
DROP POLICY IF EXISTS "admin_nazer_manage_eligibility" ON public.eligibility_criteria;
CREATE POLICY "admin_eligibility" ON public.eligibility_criteria
FOR ALL TO authenticated
USING (is_admin());

-- family_relationships
DROP POLICY IF EXISTS "staff_manage_family_relationships" ON public.family_relationships;
CREATE POLICY "staff_family_relationships" ON public.family_relationships
FOR ALL TO authenticated
USING (has_staff_access());

-- financial_forecasts
DROP POLICY IF EXISTS "admin_manage_forecasts" ON public.financial_forecasts;
DROP POLICY IF EXISTS "financial_staff_read_forecasts" ON public.financial_forecasts;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_forecasts" ON public.financial_forecasts;
CREATE POLICY "financial_forecasts_access" ON public.financial_forecasts
FOR ALL TO authenticated
USING (is_financial_staff() OR is_heir());

-- financial_kpis
DROP POLICY IF EXISTS "admin_manage_kpis" ON public.financial_kpis;
DROP POLICY IF EXISTS "financial_staff_read_kpis" ON public.financial_kpis;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_kpis" ON public.financial_kpis;
CREATE POLICY "financial_kpis_access" ON public.financial_kpis
FOR ALL TO authenticated
USING (is_financial_staff() OR is_heir());

-- governance_meeting_attendance
DROP POLICY IF EXISTS "admin_can_manage_attendance" ON public.governance_meeting_attendance;
DROP POLICY IF EXISTS "admin_nazer_can_view_attendance" ON public.governance_meeting_attendance;
CREATE POLICY "admin_meeting_attendance" ON public.governance_meeting_attendance
FOR ALL TO authenticated
USING (is_admin());

-- heir_distributions
DROP POLICY IF EXISTS "heir_dist_manage" ON public.heir_distributions;
DROP POLICY IF EXISTS "heir_dist_view" ON public.heir_distributions;
DROP POLICY IF EXISTS "heirs_see_own_distributions_immediately" ON public.heir_distributions;
CREATE POLICY "heir_dist_unified" ON public.heir_distributions
FOR ALL TO authenticated
USING (is_financial_staff() OR is_heir_own_data(beneficiary_id));

-- historical_invoices
DROP POLICY IF EXISTS "hist_inv_manage" ON public.historical_invoices;
DROP POLICY IF EXISTS "hist_inv_select" ON public.historical_invoices;
CREATE POLICY "hist_inv_unified" ON public.historical_invoices
FOR ALL TO authenticated
USING (is_financial_staff());
