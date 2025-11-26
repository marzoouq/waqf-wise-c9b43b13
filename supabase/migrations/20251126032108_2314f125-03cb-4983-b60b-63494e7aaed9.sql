-- إصلاح تحذيرات Security Definer Views
-- حذف الـ views القديمة وإعادة إنشائها بدون SECURITY DEFINER

-- حذف Views القديمة
DROP VIEW IF EXISTS trial_balance CASCADE;
DROP VIEW IF EXISTS general_ledger CASCADE;
DROP VIEW IF EXISTS income_statement CASCADE;
DROP VIEW IF EXISTS trial_balance_enhanced CASCADE;

-- إعادة إنشاء trial_balance view بدون SECURITY DEFINER
CREATE VIEW trial_balance AS
SELECT 
  a.code,
  a.name_ar,
  a.account_type,
  a.account_nature,
  COALESCE(SUM(jel.debit_amount), 0) as total_debit,
  COALESCE(SUM(jel.credit_amount), 0) as total_credit,
  COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0) as balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE a.is_active = true 
  AND a.is_header = false
  AND (je.status = 'posted' OR je.status IS NULL)
GROUP BY a.id, a.code, a.name_ar, a.account_type, a.account_nature
HAVING COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0) != 0
ORDER BY a.code;

-- إعادة إنشاء general_ledger view
CREATE VIEW general_ledger AS
SELECT 
  je.entry_date,
  je.entry_number,
  je.description as entry_description,
  a.code as account_code,
  a.name_ar as account_name,
  jel.description as line_description,
  jel.debit_amount,
  jel.credit_amount,
  je.status
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts a ON jel.account_id = a.id
WHERE je.status = 'posted'
ORDER BY je.entry_date DESC, je.entry_number, jel.line_number;