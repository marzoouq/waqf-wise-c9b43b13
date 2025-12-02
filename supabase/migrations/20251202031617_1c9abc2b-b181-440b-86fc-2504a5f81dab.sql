-- المرحلة 1: تحديث سياسات RLS لدعم ورثة الوقف (waqf_heir)

-- 1.1 تحديث سياسة beneficiaries
DROP POLICY IF EXISTS "waqf_heirs_view_all_beneficiaries" ON beneficiaries;
CREATE POLICY "waqf_heirs_view_all_beneficiaries"
ON beneficiaries FOR SELECT
USING (
  is_waqf_heir() OR 
  is_staff() OR 
  user_id = auth.uid()
);

-- 1.2 تحديث سياسة payments
DROP POLICY IF EXISTS "waqf_heirs_view_all_payments" ON payments;
CREATE POLICY "waqf_heirs_view_all_payments"
ON payments FOR SELECT
USING (
  is_waqf_heir() OR 
  is_staff() OR 
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

-- 1.3 تحديث سياسة loans
DROP POLICY IF EXISTS "waqf_heirs_view_all_loans" ON loans;
CREATE POLICY "waqf_heirs_view_all_loans"
ON loans FOR SELECT
USING (
  is_waqf_heir() OR 
  is_staff() OR 
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

-- 1.4 تحديث سياسة heir_distributions
DROP POLICY IF EXISTS "waqf_heirs_view_all_heir_distributions" ON heir_distributions;
CREATE POLICY "waqf_heirs_view_all_heir_distributions"
ON heir_distributions FOR SELECT
USING (
  is_waqf_heir() OR 
  is_staff() OR 
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

-- 1.5 تحديث سياسة emergency_aid_requests
DROP POLICY IF EXISTS "waqf_heirs_view_all_emergency_aid" ON emergency_aid_requests;
CREATE POLICY "waqf_heirs_view_all_emergency_aid"
ON emergency_aid_requests FOR SELECT
USING (
  is_waqf_heir() OR 
  is_staff() OR 
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);