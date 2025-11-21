-- منح صلاحيات القراءة للمستفيدين على العقارات والعقود والإيجارات (للشفافية والحوكمة)

-- سياسة قراءة العقارات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع العقارات"
ON properties
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة العقود للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع العقود"
ON contracts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة الإيجارات المدفوعة للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع الإيجارات"
ON rental_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة مرفقات العقود للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة مرفقات العقود"
ON contract_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة طلبات الصيانة للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة طلبات الصيانة"
ON maintenance_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);