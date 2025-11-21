-- منح صلاحيات القراءة الكاملة للمستفيدين على البيانات المالية (للحوكمة والشفافية)

-- سياسة قراءة الحسابات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع الحسابات"
ON accounts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة القيود اليومية للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة القيود اليومية"
ON journal_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة بنود القيود للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة بنود القيود"
ON journal_entry_lines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة التوزيعات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع التوزيعات"
ON distributions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة تفاصيل التوزيعات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة تفاصيل التوزيعات"
ON distribution_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة المدفوعات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع المدفوعات"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة السنوات المالية للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة السنوات المالية"
ON fiscal_years
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة الميزانيات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة الميزانيات"
ON budgets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة التدفقات النقدية للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة التدفقات النقدية"
ON cash_flows
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة موافقات التوزيعات للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة موافقات التوزيعات"
ON distribution_approvals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);

-- سياسة قراءة تفاصيل مستفيدي الإفصاح
CREATE POLICY "المستفيدون يمكنهم قراءة تفاصيل الإفصاح"
ON disclosure_beneficiaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'beneficiary'
  )
);