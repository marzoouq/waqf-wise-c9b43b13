-- ======================================
-- المرحلة 3: تشديد سياسات RLS لفصل البيانات بين المستخدمين
-- ======================================

-- 1. تحديث سياسات accounts لتقييدها على الأدوار المالية فقط
DROP POLICY IF EXISTS "Allow authenticated read on accounts" ON accounts;

CREATE POLICY "الأدوار المالية فقط يمكنها قراءة الحسابات"
ON accounts FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant') OR
  has_role(auth.uid(), 'cashier')
);

DROP POLICY IF EXISTS "Allow authenticated insert on accounts" ON accounts;

CREATE POLICY "المحاسبون فقط يمكنهم إضافة حسابات"
ON accounts FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'accountant')
);

DROP POLICY IF EXISTS "Allow authenticated update on accounts" ON accounts;

CREATE POLICY "المحاسبون فقط يمكنهم تحديث الحسابات"
ON accounts FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'accountant')
);

-- 2. تحديث سياسات approval_stats
DROP POLICY IF EXISTS "Everyone can view approval stats" ON approval_stats;

CREATE POLICY "الأدوار الإدارية والمالية فقط يمكنها رؤية إحصائيات الموافقات"
ON approval_stats FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);

-- 3. تشديد سياسات documents - الأرشيفيون والمسؤولون فقط
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;

CREATE POLICY "الأرشيفيون والمسؤولون يمكنهم رؤية المستندات"
ON documents FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'archivist')
);

DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;

CREATE POLICY "الأرشيفيون والمسؤولون يمكنهم إضافة مستندات"
ON documents FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'archivist')
);

DROP POLICY IF EXISTS "Authenticated users can update documents" ON documents;

CREATE POLICY "الأرشيفيون والمسؤولون يمكنهم تحديث المستندات"
ON documents FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'archivist')
);

-- 4. تشديد سياسات folders
DROP POLICY IF EXISTS "Authenticated users can view folders" ON folders;

CREATE POLICY "الأرشيفيون والمسؤولون يمكنهم رؤية المجلدات"
ON folders FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'archivist')
);

DROP POLICY IF EXISTS "Authenticated users can insert folders" ON folders;

CREATE POLICY "الأرشيفيون والمسؤولون يمكنهم إضافة مجلدات"
ON folders FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'archivist')
);

DROP POLICY IF EXISTS "Authenticated users can update folders" ON folders;

CREATE POLICY "الأرشيفيون والمسؤولون يمكنهم تحديث المجلدات"
ON folders FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'archivist')
);

-- 5. تقييد invoices على الأدوار المالية
DROP POLICY IF EXISTS "Allow authenticated read on invoices" ON invoices;

CREATE POLICY "الأدوار المالية فقط يمكنها قراءة الفواتير"
ON invoices FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant') OR
  has_role(auth.uid(), 'cashier')
);

DROP POLICY IF EXISTS "Allow authenticated insert on invoices" ON invoices;

CREATE POLICY "المحاسبون والصرافون يمكنهم إضافة فواتير"
ON invoices FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'accountant') OR
  has_role(auth.uid(), 'cashier')
);

DROP POLICY IF EXISTS "Allow authenticated update on invoices" ON invoices;

CREATE POLICY "المحاسبون والصرافون يمكنهم تحديث الفواتير"
ON invoices FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'accountant') OR
  has_role(auth.uid(), 'cashier')
);

-- 6. تقييد journal_entries على المحاسبين
DROP POLICY IF EXISTS "Allow authenticated read on journal_entries" ON journal_entries;

CREATE POLICY "المحاسبون والمسؤولون فقط يمكنهم رؤية القيود"
ON journal_entries FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);

DROP POLICY IF EXISTS "Allow authenticated insert on journal_entries" ON journal_entries;

CREATE POLICY "المحاسبون فقط يمكنهم إضافة قيود"
ON journal_entries FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'accountant')
);

DROP POLICY IF EXISTS "Allow authenticated update on journal_entries" ON journal_entries;

CREATE POLICY "المحاسبون فقط يمكنهم تحديث القيود"
ON journal_entries FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'accountant')
);

-- 7. تحديث سياسات fiscal_years
DROP POLICY IF EXISTS "Allow authenticated read on fiscal_years" ON fiscal_years;

CREATE POLICY "الأدوار المالية يمكنها رؤية السنوات المالية"
ON fiscal_years FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);

DROP POLICY IF EXISTS "Allow authenticated insert on fiscal_years" ON fiscal_years;

CREATE POLICY "المسؤولون فقط يمكنهم إضافة سنوات مالية"
ON fiscal_years FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer')
);

DROP POLICY IF EXISTS "Allow authenticated update on fiscal_years" ON fiscal_years;

CREATE POLICY "المسؤولون فقط يمكنهم تحديث السنوات المالية"
ON fiscal_years FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR
  has_role(auth.uid(), 'nazer')
);

-- 8. تأكيد سياسات contracts محمية للأدوار الإدارية فقط
-- (هذه محمية بالفعل بشكل صحيح)

-- 9. تأكيد سياسات properties محمية
-- (محمية بالفعل في migrations سابقة)
