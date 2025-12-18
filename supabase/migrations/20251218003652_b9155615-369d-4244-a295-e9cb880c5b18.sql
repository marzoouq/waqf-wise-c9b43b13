-- إنشاء قيد محاسبي للدفعة المعلقة 100,000 ريال
INSERT INTO journal_entries (
  entry_number, 
  entry_date, 
  description, 
  status, 
  fiscal_year_id, 
  reference_type, 
  reference_id
)
VALUES (
  'JE-2025-0003', 
  '2025-11-01', 
  'قيد إيجار عقار - الثبيتي (تصحيحي)', 
  'posted', 
  'a51951b9-3687-489d-9861-5790e5e9a492',
  'rental_payment', 
  'a938304e-eb02-48aa-9c28-8b710d2228dc'
);

-- إضافة سطور القيد
-- مدين: النقدية والبنوك
INSERT INTO journal_entry_lines (
  journal_entry_id,
  account_id,
  line_number,
  debit_amount,
  credit_amount
)
SELECT 
  id,
  '2ad64b1a-5ec3-4aab-b56d-2c08f1574f6a',
  1,
  100000,
  0
FROM journal_entries 
WHERE entry_number = 'JE-2025-0003';

-- دائن: إيرادات الإيجار (بعد خصم الضريبة 15%)
INSERT INTO journal_entry_lines (
  journal_entry_id,
  account_id,
  line_number,
  debit_amount,
  credit_amount
)
SELECT 
  id,
  '29dc0878-9fd0-4297-8c78-e4956ceeaaaf',
  2,
  0,
  86956.52
FROM journal_entries 
WHERE entry_number = 'JE-2025-0003';

-- دائن: ضريبة القيمة المضافة (15%)
INSERT INTO journal_entry_lines (
  journal_entry_id,
  account_id,
  line_number,
  debit_amount,
  credit_amount
)
SELECT 
  je.id,
  acc.id,
  3,
  0,
  13043.48
FROM journal_entries je
CROSS JOIN accounts acc
WHERE je.entry_number = 'JE-2025-0003'
AND acc.code = '2.1.2';

-- ربط القيد بالدفعة
UPDATE rental_payments
SET journal_entry_id = (
  SELECT id FROM journal_entries WHERE entry_number = 'JE-2025-0003'
)
WHERE id = 'a938304e-eb02-48aa-9c28-8b710d2228dc';

-- تحديث رصيد حساب النقدية
UPDATE accounts
SET current_balance = current_balance + 100000
WHERE code = '1.1.1';

-- تحديث رصيد حساب الإيرادات
UPDATE accounts
SET current_balance = current_balance + 86956.52
WHERE code = '4.1.1';

-- تحديث رصيد حساب ضريبة القيمة المضافة
UPDATE accounts
SET current_balance = current_balance + 13043.48
WHERE code = '2.1.2';