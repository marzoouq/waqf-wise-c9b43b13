
-- ============================================
-- Phase 4 Enhancement: Simple RLS Policies
-- ============================================

-- RLS للعقارات والعقود وسندات الصرف فقط
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية العقارات" ON properties;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية العقود" ON contracts;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية سنداتهم" ON payment_vouchers;

CREATE POLICY "المستفيدون يمكنهم رؤية العقارات"
ON properties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "المستفيدون يمكنهم رؤية العقود"
ON contracts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "المستفيدون يمكنهم رؤية سنداتهم"
ON payment_vouchers
FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
);
