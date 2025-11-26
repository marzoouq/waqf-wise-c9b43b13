-- إصلاح Views - إعادة إنشاء بدون SECURITY DEFINER/INVOKER
DROP VIEW IF EXISTS general_ledger CASCADE;
DROP VIEW IF EXISTS trial_balance CASCADE;

CREATE VIEW general_ledger AS
SELECT 
  a.code AS account_code,
  a.name_ar AS account_name,
  a.account_type,
  je.entry_number,
  je.entry_date,
  je.description AS entry_description,
  jel.description AS line_description,
  jel.debit_amount,
  jel.credit_amount,
  SUM(jel.debit_amount - jel.credit_amount) 
    OVER (PARTITION BY a.id ORDER BY je.entry_date, je.entry_number) AS running_balance,
  je.status,
  je.posted
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
JOIN accounts a ON jel.account_id = a.id
WHERE je.posted = true;

CREATE VIEW trial_balance AS
SELECT 
  a.code,
  a.name_ar,
  a.account_type,
  a.account_nature,
  COALESCE(SUM(jel.debit_amount), 0) AS total_debit,
  COALESCE(SUM(jel.credit_amount), 0) AS total_credit,
  COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) AS balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.posted = true
WHERE a.is_header = false
GROUP BY a.id, a.code, a.name_ar, a.account_type, a.account_nature
ORDER BY a.code;