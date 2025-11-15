-- المرحلة الثانية: تحسين RLS Policies

-- 1. تحسين RLS Policy لجدول activities
DROP POLICY IF EXISTS "System can insert activities" ON activities;
DROP POLICY IF EXISTS "Admins can view all activities" ON activities;

CREATE POLICY "النظام يمكنه إضافة الأنشطة"
ON activities FOR INSERT
WITH CHECK (true);

CREATE POLICY "المدراء والمحاسبون يمكنهم رؤية الأنشطة"
ON activities FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 2. تحسين RLS Policy لجدول journal_entries
DROP POLICY IF EXISTS "Allow authenticated read on journal_entries" ON journal_entries;

CREATE POLICY "الأدوار المالية يمكنها رؤية القيود"
ON journal_entries FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

-- 3. تحسين RLS Policy لجدول approvals
DROP POLICY IF EXISTS "Allow authenticated read on approvals" ON approvals;
DROP POLICY IF EXISTS "Allow authenticated insert on approvals" ON approvals;
DROP POLICY IF EXISTS "Allow authenticated update on approvals" ON approvals;

CREATE POLICY "المحاسبون يمكنهم رؤية الموافقات"
ON approvals FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "المحاسبون يمكنهم إضافة الموافقات"
ON approvals FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "المحاسبون يمكنهم تحديث الموافقات"
ON approvals FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 4. تحديث RLS Policies لجدول bank_accounts
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم  " ON bank_accounts;

CREATE POLICY "الأدوار المالية والمستفيدون من الفئة الأولى"
ON bank_accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries
    WHERE beneficiaries.user_id = auth.uid() 
    AND beneficiaries.category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
);