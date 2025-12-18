-- الدفعة 5: جداول إضافية (بدون owns_beneficiary)

-- properties
DROP POLICY IF EXISTS "properties_staff_manage" ON public.properties;
CREATE POLICY "properties_staff_manage" ON public.properties
  FOR ALL USING (is_admin_or_nazer());

DROP POLICY IF EXISTS "properties_view" ON public.properties;
CREATE POLICY "properties_view" ON public.properties
  FOR SELECT USING (has_full_read_access());

-- property_units
DROP POLICY IF EXISTS "property_units_staff_manage" ON public.property_units;
CREATE POLICY "property_units_staff_manage" ON public.property_units
  FOR ALL USING (is_admin_or_nazer());

DROP POLICY IF EXISTS "property_units_view" ON public.property_units;
CREATE POLICY "property_units_view" ON public.property_units
  FOR SELECT USING (has_full_read_access());

-- contracts
DROP POLICY IF EXISTS "contracts_staff_manage" ON public.contracts;
CREATE POLICY "contracts_staff_manage" ON public.contracts
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "contracts_view" ON public.contracts;
CREATE POLICY "contracts_view" ON public.contracts
  FOR SELECT USING (has_full_read_access());

-- tenants
DROP POLICY IF EXISTS "tenants_staff_manage" ON public.tenants;
CREATE POLICY "tenants_staff_manage" ON public.tenants
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "tenants_view" ON public.tenants;
CREATE POLICY "tenants_view" ON public.tenants
  FOR SELECT USING (has_staff_access());

-- tenant_ledger
DROP POLICY IF EXISTS "tenant_ledger_staff_manage" ON public.tenant_ledger;
CREATE POLICY "tenant_ledger_staff_manage" ON public.tenant_ledger
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "tenant_ledger_view" ON public.tenant_ledger;
CREATE POLICY "tenant_ledger_view" ON public.tenant_ledger
  FOR SELECT USING (has_staff_access());

-- distributions
DROP POLICY IF EXISTS "distributions_staff_manage" ON public.distributions;
CREATE POLICY "distributions_staff_manage" ON public.distributions
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "distributions_view" ON public.distributions;
CREATE POLICY "distributions_view" ON public.distributions
  FOR SELECT USING (has_full_read_access());

-- families
DROP POLICY IF EXISTS "families_staff_manage" ON public.families;
CREATE POLICY "families_staff_manage" ON public.families
  FOR ALL USING (has_staff_access());

DROP POLICY IF EXISTS "families_view" ON public.families;
CREATE POLICY "families_view" ON public.families
  FOR SELECT USING (has_full_read_access());

-- fiscal_years
DROP POLICY IF EXISTS "fiscal_years_staff_manage" ON public.fiscal_years;
CREATE POLICY "fiscal_years_staff_manage" ON public.fiscal_years
  FOR ALL USING (is_financial_staff());

DROP POLICY IF EXISTS "fiscal_years_view" ON public.fiscal_years;
CREATE POLICY "fiscal_years_view" ON public.fiscal_years
  FOR SELECT USING (has_full_read_access());

-- emergency_aid_requests
DROP POLICY IF EXISTS "emergency_aid_requests_staff_manage" ON public.emergency_aid_requests;
CREATE POLICY "emergency_aid_requests_staff_manage" ON public.emergency_aid_requests
  FOR ALL USING (has_staff_access());

DROP POLICY IF EXISTS "emergency_aid_requests_own" ON public.emergency_aid_requests;
CREATE POLICY "emergency_aid_requests_own" ON public.emergency_aid_requests
  FOR ALL USING (owns_beneficiary(beneficiary_id));