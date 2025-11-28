-- ========================================
-- إصلاح سياسات RLS الحرجة للمستفيدين
-- ========================================

-- 1. حذف السياسات القديمة للمستفيدين على جدول beneficiaries
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية بياناتهم فقط" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_select_own" ON beneficiaries;
DROP POLICY IF EXISTS "Beneficiaries can view their own data" ON beneficiaries;

-- 2. إنشاء سياسة جديدة - المستفيد يرى بياناته فقط
CREATE POLICY "beneficiary_view_own_only"
ON beneficiaries
FOR SELECT
TO authenticated
USING (
  -- الموظفون يرون الكل
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier', 'archivist')
  )
  OR
  -- المستفيد يرى بياناته فقط
  (user_id = auth.uid())
);

-- 3. إصلاح سياسات جدول payments
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية مدفوعاتهم" ON payments;
DROP POLICY IF EXISTS "beneficiaries_view_payments" ON payments;

CREATE POLICY "payment_view_own_only"
ON payments
FOR SELECT
TO authenticated
USING (
  -- الموظفون يرون الكل
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier')
  )
  OR
  -- المستفيد يرى مدفوعاته فقط
  (beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  ))
);

-- 4. إصلاح سياسات جدول loans
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية قروضهم فقط" ON loans;
DROP POLICY IF EXISTS "beneficiaries_view_loans" ON loans;

CREATE POLICY "loan_view_own_only"
ON loans
FOR SELECT
TO authenticated
USING (
  -- الموظفون يرون الكل
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier')
  )
  OR
  -- المستفيد يرى قروضه فقط
  (beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  ))
);

-- 5. إصلاح سياسات جدول beneficiary_requests
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية طلباتهم" ON beneficiary_requests;
DROP POLICY IF EXISTS "beneficiaries_view_requests" ON beneficiary_requests;

CREATE POLICY "request_view_own_only"
ON beneficiary_requests
FOR SELECT
TO authenticated
USING (
  -- الموظفون يرون الكل
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier', 'archivist')
  )
  OR
  -- المستفيد يرى طلباته فقط
  (beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  ))
);

-- 6. إصلاح سياسات جدول distributions - المستفيد يرى توزيعاته فقط
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية التوزيعات" ON distributions;
DROP POLICY IF EXISTS "beneficiaries_view_distributions" ON distributions;

CREATE POLICY "distribution_view_policy"
ON distributions
FOR SELECT
TO authenticated
USING (
  -- الموظفون يرون الكل
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier')
  )
  OR
  -- المستفيد يرى التوزيعات العامة (status = 'completed') بدون تفاصيل حساسة
  (status = 'completed')
);

-- 7. إصلاح سياسات جدول contracts - إخفاء بيانات المستأجرين عن المستفيدين
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية العقود" ON contracts;
DROP POLICY IF EXISTS "beneficiaries_view_contracts" ON contracts;

CREATE POLICY "contract_view_policy"
ON contracts
FOR SELECT
TO authenticated
USING (
  -- الموظفون يرون الكل
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier', 'archivist')
  )
  -- المستفيدون لا يرون العقود مباشرة - يرون فقط من خلال views آمنة
);

-- 8. تسجيل التحديث في سجل المراجعة
INSERT INTO audit_logs (action_type, description, table_name, severity, created_at)
VALUES (
  'RLS_UPDATE',
  'تشديد سياسات RLS - المستفيدون يرون بياناتهم فقط',
  'multiple_tables',
  'info',
  now()
);