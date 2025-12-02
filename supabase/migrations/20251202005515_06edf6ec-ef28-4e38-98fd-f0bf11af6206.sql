-- ============================================
-- المرحلة 2: تفعيل دور waqf_heir وتحديث RLS
-- ============================================

-- 1. إنشاء دالة للتحقق من وارث الوقف
CREATE OR REPLACE FUNCTION public.is_waqf_heir(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'waqf_heir'::app_role
  )
$$;

-- 2. تعيين الدور الجديد للـ 14 وارث نشط
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'waqf_heir'::app_role
FROM beneficiaries
WHERE status = 'نشط' AND user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. حذف دور beneficiary من المستخدمين غير المرتبطين بالورثة
DELETE FROM user_roles
WHERE role = 'beneficiary'
AND user_id NOT IN (
  SELECT user_id FROM beneficiaries 
  WHERE user_id IS NOT NULL AND status = 'نشط'
);

-- ============================================
-- تحديث سياسات RLS لاستخدام waqf_heir
-- ============================================

-- Properties: Staff + waqf_heir
DROP POLICY IF EXISTS "staff_and_active_beneficiaries" ON properties;
CREATE POLICY "staff_and_waqf_heirs_can_view_properties"
ON properties FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR 
  public.is_accountant() OR
  public.is_waqf_heir()
);

-- Funds: Staff + waqf_heir
DROP POLICY IF EXISTS "staff_can_view_funds" ON funds;
CREATE POLICY "staff_and_waqf_heirs_can_view_funds"
ON funds FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR 
  public.is_accountant() OR
  public.is_waqf_heir()
);

-- Waqf Units: Staff + waqf_heir
DROP POLICY IF EXISTS "Authenticated users can view waqf units" ON waqf_units;
CREATE POLICY "staff_and_waqf_heirs_can_view_waqf_units"
ON waqf_units FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR 
  public.is_accountant() OR
  public.is_waqf_heir()
);

-- Governance Board Members: Staff + waqf_heir
DROP POLICY IF EXISTS "Authenticated users can view governance board members" ON governance_board_members;
CREATE POLICY "staff_and_waqf_heirs_can_view_governance_members"
ON governance_board_members FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR
  public.is_waqf_heir()
);

-- Governance Decisions: Staff + waqf_heir
DROP POLICY IF EXISTS "Authenticated users can view governance decisions" ON governance_decisions;
CREATE POLICY "staff_and_waqf_heirs_can_view_governance_decisions"
ON governance_decisions FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR
  public.is_waqf_heir()
);

-- Distributions: Staff + waqf_heir (read only)
DROP POLICY IF EXISTS "Authenticated users can view distributions" ON distributions;
CREATE POLICY "staff_and_waqf_heirs_can_view_distributions"
ON distributions FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR
  public.is_waqf_heir()
);

-- Distribution Details: Staff + waqf_heir (own data only)
DROP POLICY IF EXISTS "Beneficiaries can view their own distribution details" ON distribution_details;
CREATE POLICY "waqf_heirs_can_view_own_distribution_details"
ON distribution_details FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR
  (
    public.is_waqf_heir() AND
    beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
  )
);

-- Budgets: Staff + waqf_heir (read only for transparency)
DROP POLICY IF EXISTS "Authenticated users can view budgets" ON budgets;
CREATE POLICY "staff_and_waqf_heirs_can_view_budgets"
ON budgets FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR
  public.is_waqf_heir()
);

-- Cash Flows: Staff + waqf_heir (read only for transparency)
DROP POLICY IF EXISTS "Authenticated users can view cash flows" ON cash_flows;
CREATE POLICY "staff_and_waqf_heirs_can_view_cash_flows"
ON cash_flows FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR
  public.is_waqf_heir()
);

-- Families: Staff + waqf_heir (own family only)
DROP POLICY IF EXISTS "Authenticated users can view families" ON families;
CREATE POLICY "staff_and_waqf_heirs_can_view_families"
ON families FOR SELECT TO authenticated
USING (
  public.is_staff() OR
  (
    public.is_waqf_heir() AND
    id IN (SELECT family_id FROM beneficiaries WHERE user_id = auth.uid())
  )
);

-- Annual Disclosures: Staff + waqf_heir (for transparency)
DROP POLICY IF EXISTS "Authenticated users can view annual disclosures" ON annual_disclosures;
CREATE POLICY "staff_and_waqf_heirs_can_view_annual_disclosures"
ON annual_disclosures FOR SELECT TO authenticated
USING (
  public.is_staff() OR
  public.is_waqf_heir()
);

-- Waqf Distribution Settings: Staff + waqf_heir (for transparency)
DROP POLICY IF EXISTS "Authenticated users can view waqf distribution settings" ON waqf_distribution_settings;
CREATE POLICY "staff_and_waqf_heirs_can_view_distribution_settings"
ON waqf_distribution_settings FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR
  public.is_waqf_heir()
);

-- Organization Settings: Staff + waqf_heir (for transparency)
DROP POLICY IF EXISTS "Authenticated users can view organization settings" ON organization_settings;
CREATE POLICY "staff_and_waqf_heirs_can_view_org_settings"
ON organization_settings FOR SELECT TO authenticated
USING (
  public.is_admin_or_nazer() OR
  public.is_waqf_heir()
);

-- Waqf Reserves: Staff + waqf_heir (for transparency)
DROP POLICY IF EXISTS "Authenticated users can view waqf reserves" ON waqf_reserves;
CREATE POLICY "staff_and_waqf_heirs_can_view_reserves"
ON waqf_reserves FOR SELECT TO authenticated
USING (
  public.is_financial_staff() OR
  public.is_waqf_heir()
);

COMMENT ON FUNCTION public.is_waqf_heir IS 'التحقق من أن المستخدم هو أحد الورثة الـ14 المعتمدين للوقف';