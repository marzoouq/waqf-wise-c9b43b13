
-- المرحلة 4: تقييد RLS للجداول الفارغة (احترازية للمستقبل)
-- تاريخ الفحص الجنائي: 2026-01-19

-- 1. account_year_balances - تقييد للموظفين الماليين
DROP POLICY IF EXISTS "Allow authenticated users to read account year balances" ON account_year_balances;
CREATE POLICY "financial_staff_view_year_balances" ON account_year_balances 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant', 'cashier')
    )
  );

-- 2. contract_notifications - للموظفين فقط (بدون ربط بالمستأجر لعدم وجود user_id)
DROP POLICY IF EXISTS "authenticated_select_contract_notifications" ON contract_notifications;
CREATE POLICY "staff_view_notifications" ON contract_notifications 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
    )
  );

-- 3. contract_settlements - للموظفين فقط
DROP POLICY IF EXISTS "authenticated_select_settlements" ON contract_settlements;
CREATE POLICY "staff_view_settlements" ON contract_settlements 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

-- 4. contract_termination_requests - للموظفين أو منشئ الطلب
DROP POLICY IF EXISTS "authenticated_select_termination_requests" ON contract_termination_requests;
CREATE POLICY "staff_or_creator_view_terminations" ON contract_termination_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
    OR created_by = auth.uid()
  );

-- 5. eligibility_criteria - للموظفين فقط (معايير الأهلية حساسة)
DROP POLICY IF EXISTS "authenticated_select_eligibility_criteria" ON eligibility_criteria;
CREATE POLICY "staff_view_eligibility" ON eligibility_criteria 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

-- 6. rent_adjustment_requests - للموظفين أو منشئ الطلب
DROP POLICY IF EXISTS "authenticated_select_rent_adjustments" ON rent_adjustment_requests;
CREATE POLICY "staff_or_creator_view_adjustments" ON rent_adjustment_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
    OR created_by = auth.uid()
  );

-- 7. unit_handovers - للموظفين فقط
DROP POLICY IF EXISTS "authenticated_select_unit_handovers" ON unit_handovers;
CREATE POLICY "staff_view_handovers" ON unit_handovers 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant', 'cashier')
    )
  );

-- تعليقات توثيقية
COMMENT ON POLICY "financial_staff_view_year_balances" ON account_year_balances IS 'فحص جنائي 2026-01-19: تقييد للموظفين الماليين';
COMMENT ON POLICY "staff_view_notifications" ON contract_notifications IS 'فحص جنائي 2026-01-19: للموظفين فقط';
COMMENT ON POLICY "staff_view_settlements" ON contract_settlements IS 'فحص جنائي 2026-01-19: للموظفين فقط';
COMMENT ON POLICY "staff_or_creator_view_terminations" ON contract_termination_requests IS 'فحص جنائي 2026-01-19: للموظفين أو منشئ الطلب';
COMMENT ON POLICY "staff_view_eligibility" ON eligibility_criteria IS 'فحص جنائي 2026-01-19: للموظفين فقط';
COMMENT ON POLICY "staff_or_creator_view_adjustments" ON rent_adjustment_requests IS 'فحص جنائي 2026-01-19: للموظفين أو منشئ الطلب';
COMMENT ON POLICY "staff_view_handovers" ON unit_handovers IS 'فحص جنائي 2026-01-19: للموظفين فقط';
