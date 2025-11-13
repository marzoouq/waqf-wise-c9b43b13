-- ===================================================================
-- سياسات خاصة لتقارير الدرجة الأولى (قراءة فقط)
-- ===================================================================

-- 1. السماح للمستفيدين من الفئة الأولى برؤية العقارات المؤجرة
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية العقارات" ON properties;
DROP POLICY IF EXISTS "Authenticated users can view properties" ON properties;

CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية العقارات"
ON properties FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 2. السماح للمستفيدين من الفئة الأولى برؤية العقود (يوجد بالفعل)
-- لا حاجة لتعديل سياسة العقود لأنها موجودة بالفعل

-- 3. السماح للمستفيدين من الفئة الأولى برؤية طلبات الصيانة
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية الصيانة" ON maintenance_requests;
DROP POLICY IF EXISTS "Authenticated users can view maintenance requests" ON maintenance_requests;

CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية الصيانة"
ON maintenance_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 4. السماح للمستفيدين من الفئة الأولى برؤية المعاملات البنكية
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية المعاملات البنكية" ON bank_transactions;
DROP POLICY IF EXISTS "Allow authenticated read on bank_transactions" ON bank_transactions;

CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية المعاملات البنكية"
ON bank_transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 5. السماح برؤية كشوفات البنك
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية كشوفات البنك" ON bank_statements;
DROP POLICY IF EXISTS "Allow authenticated read on bank_statements" ON bank_statements;

CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية كشوفات البنك"
ON bank_statements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 6. السماح برؤية الحسابات البنكية
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية الحسابات البنكية" ON bank_accounts;
DROP POLICY IF EXISTS "Allow authenticated read on bank_accounts" ON bank_accounts;

CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية الحسابات البنكية"
ON bank_accounts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);