-- ===================================================================
-- تأمين بيانات المستفيدين - كل مستفيد يرى بياناته فقط
-- ===================================================================

-- 1. تحديث سياسات beneficiaries
DROP POLICY IF EXISTS "Authenticated users can view beneficiaries" ON beneficiaries;

CREATE POLICY "المستفيدون يمكنهم رؤية بياناتهم فقط"
ON beneficiaries FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

-- 2. تحديث سياسات beneficiary_requests
DROP POLICY IF EXISTS "Authenticated users can view requests" ON beneficiary_requests;
DROP POLICY IF EXISTS "Authenticated users can insert requests" ON beneficiary_requests;

CREATE POLICY "المستفيدون يمكنهم رؤية طلباتهم فقط"
ON beneficiary_requests FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "المستفيدون يمكنهم إضافة طلبات"
ON beneficiary_requests FOR INSERT
TO authenticated
WITH CHECK (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 3. تحديث سياسات beneficiary_attachments
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة المرفقات" ON beneficiary_attachments;
DROP POLICY IF EXISTS "الجميع يمكنهم إضافة مرفقات" ON beneficiary_attachments;

CREATE POLICY "المستفيدون يمكنهم رؤية مرفقاتهم فقط"
ON beneficiary_attachments FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'archivist'::app_role)
);

CREATE POLICY "المستفيدون يمكنهم إضافة مرفقات"
ON beneficiary_attachments FOR INSERT
TO authenticated
WITH CHECK (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'archivist'::app_role)
);

-- 4. تحديث سياسات payments
DROP POLICY IF EXISTS "Allow authenticated read on payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated insert on payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated update on payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated delete on payments" ON payments;

CREATE POLICY "المستفيدون يمكنهم رؤية مدفوعاتهم فقط"
ON payments FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "المسؤولون فقط يمكنهم إضافة مدفوعات"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "المسؤولون فقط يمكنهم تحديث مدفوعات"
ON payments FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

CREATE POLICY "المسؤولون فقط يمكنهم حذف مدفوعات"
ON payments FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- 5. تحديث سياسات loans
DROP POLICY IF EXISTS "Authenticated users can view loans" ON loans;

CREATE POLICY "المستفيدون يمكنهم رؤية قروضهم فقط"
ON loans FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 6. تحديث سياسات loan_installments
DROP POLICY IF EXISTS "Authenticated users can view installments" ON loan_installments;

CREATE POLICY "المستفيدون يمكنهم رؤية أقساطهم فقط"
ON loan_installments FOR SELECT
TO authenticated
USING (
  loan_id IN (
    SELECT id FROM loans WHERE beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 7. تحديث سياسات distributions (التوزيعات عامة للقراءة فقط للمستفيدين)
DROP POLICY IF EXISTS "Authenticated users can view distributions" ON distributions;

CREATE POLICY "الجميع يمكنهم رؤية التوزيعات المعتمدة"
ON distributions FOR SELECT
TO authenticated
USING (
  status = 'معتمد' OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 8. إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_beneficiary_id ON beneficiary_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_payments_beneficiary_id ON payments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_loans_beneficiary_id ON loans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_attachments_beneficiary_id ON beneficiary_attachments(beneficiary_id);