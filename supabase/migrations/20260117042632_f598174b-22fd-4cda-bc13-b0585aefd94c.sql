
-- ============================================
-- إصلاح شامل للمشاكل الأمنية
-- ============================================

-- المرحلة 1: إصلاح landing_page_settings
DROP POLICY IF EXISTS "public_can_view_landing_settings" ON landing_page_settings;
DROP POLICY IF EXISTS "anyone_can_view_landing_settings" ON landing_page_settings;
DROP POLICY IF EXISTS "Public can view landing settings" ON landing_page_settings;

CREATE POLICY "public_read_safe_landing_settings"
ON landing_page_settings FOR SELECT
TO anon, authenticated
USING (
  is_active = true 
  AND setting_key NOT IN ('contact_phone', 'contact_email', 'contact_address', 'admin_email', 'system_email')
);

CREATE POLICY "staff_full_read_landing_settings"
ON landing_page_settings FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'archivist', 'cashier'))
);

-- المرحلة 2: حماية الـ Views المالية

-- 1. accounts_hierarchy
DROP VIEW IF EXISTS public.accounts_hierarchy CASCADE;
CREATE VIEW public.accounts_hierarchy WITH (security_invoker = true)
AS SELECT a.id, a.code, a.name_ar, a.name_en, a.account_type, a.account_nature,
  a.parent_id, a.is_header, a.is_active, a.current_balance, a.description,
  a.created_at, a.updated_at, p.name_ar as parent_name, p.code as parent_code
FROM accounts a LEFT JOIN accounts p ON a.parent_id = p.id;
REVOKE ALL ON public.accounts_hierarchy FROM anon;
GRANT SELECT ON public.accounts_hierarchy TO authenticated;

-- 2. trial_balance
DROP VIEW IF EXISTS public.trial_balance CASCADE;
CREATE VIEW public.trial_balance WITH (security_invoker = true)
AS SELECT a.id as account_id, a.code, a.name_ar, a.account_type, a.account_nature,
  COALESCE(SUM(jl.debit_amount), 0) as total_debit,
  COALESCE(SUM(jl.credit_amount), 0) as total_credit,
  COALESCE(SUM(jl.debit_amount), 0) - COALESCE(SUM(jl.credit_amount), 0) as balance
FROM accounts a
LEFT JOIN journal_entry_lines jl ON a.id = jl.account_id
LEFT JOIN journal_entries je ON jl.journal_entry_id = je.id AND je.status = 'posted'
WHERE a.is_active = true
GROUP BY a.id, a.code, a.name_ar, a.account_type, a.account_nature;
REVOKE ALL ON public.trial_balance FROM anon;
GRANT SELECT ON public.trial_balance TO authenticated;

-- 3. general_ledger
DROP VIEW IF EXISTS public.general_ledger CASCADE;
CREATE VIEW public.general_ledger WITH (security_invoker = true)
AS SELECT a.id as account_id, a.code as account_code, a.name_ar as account_name, a.account_type,
  je.id as entry_id, je.entry_number, je.entry_date, je.description as entry_description,
  jl.description as line_description, jl.debit_amount, jl.credit_amount, je.status
FROM accounts a
JOIN journal_entry_lines jl ON a.id = jl.account_id
JOIN journal_entries je ON jl.journal_entry_id = je.id WHERE je.status = 'posted';
REVOKE ALL ON public.general_ledger FROM anon;
GRANT SELECT ON public.general_ledger TO authenticated;

-- 4. unified_transactions_view
DROP VIEW IF EXISTS public.unified_transactions_view CASCADE;
CREATE VIEW public.unified_transactions_view WITH (security_invoker = true)
AS SELECT 'payment' as transaction_type, p.id, p.payment_number as reference_number,
  p.payment_date as transaction_date, p.amount, p.description, p.status, p.created_at
FROM payments p
UNION ALL
SELECT 'voucher' as transaction_type, pv.id, pv.voucher_number as reference_number,
  COALESCE(pv.paid_at, pv.created_at)::date as transaction_date,
  pv.amount, pv.description, pv.status, pv.created_at
FROM payment_vouchers pv;
REVOKE ALL ON public.unified_transactions_view FROM anon;
GRANT SELECT ON public.unified_transactions_view TO authenticated;

-- 5. loans_summary
DROP VIEW IF EXISTS public.loans_summary CASCADE;
CREATE VIEW public.loans_summary WITH (security_invoker = true)
AS SELECT l.id, l.loan_number, l.beneficiary_id, b.full_name as beneficiary_name,
  l.principal_amount, l.remaining_balance, l.monthly_installment, l.status,
  l.start_date, l.end_date, l.created_at
FROM loans l LEFT JOIN beneficiaries b ON l.beneficiary_id = b.id;
REVOKE ALL ON public.loans_summary FROM anon;
GRANT SELECT ON public.loans_summary TO authenticated;

-- 6. distributions_summary
DROP VIEW IF EXISTS public.distributions_summary CASCADE;
CREATE VIEW public.distributions_summary WITH (security_invoker = true)
AS SELECT d.id, d.month, d.distribution_date, d.total_amount, d.beneficiaries_count,
  d.status, d.distribution_type, d.waqf_name, d.created_at
FROM distributions d;
REVOKE ALL ON public.distributions_summary FROM anon;
GRANT SELECT ON public.distributions_summary TO authenticated;

-- 7. waqf_balance_summary
DROP VIEW IF EXISTS public.waqf_balance_summary CASCADE;
CREATE VIEW public.waqf_balance_summary WITH (security_invoker = true)
AS SELECT a.id as account_id, a.code, a.name_ar, a.account_type, a.current_balance, a.account_nature
FROM accounts a WHERE a.is_active = true AND a.is_header = false;
REVOKE ALL ON public.waqf_balance_summary FROM anon;
GRANT SELECT ON public.waqf_balance_summary TO authenticated;

-- 8. monthly_financial_summary
DROP VIEW IF EXISTS public.monthly_financial_summary CASCADE;
CREATE VIEW public.monthly_financial_summary WITH (security_invoker = true)
AS SELECT DATE_TRUNC('month', je.entry_date) as month,
  SUM(jl.debit_amount) as total_debits, SUM(jl.credit_amount) as total_credits,
  COUNT(DISTINCT je.id) as entries_count
FROM journal_entries je
JOIN journal_entry_lines jl ON je.id = jl.journal_entry_id
WHERE je.status = 'posted'
GROUP BY DATE_TRUNC('month', je.entry_date);
REVOKE ALL ON public.monthly_financial_summary FROM anon;
GRANT SELECT ON public.monthly_financial_summary TO authenticated;

-- 9. unmatched_bank_transactions
DROP VIEW IF EXISTS public.unmatched_bank_transactions CASCADE;
CREATE VIEW public.unmatched_bank_transactions WITH (security_invoker = true)
AS SELECT bt.id, bt.transaction_date, bt.amount, bt.description, bt.transaction_type,
  bt.reference_number, bs.bank_account_id, ba.bank_name
FROM bank_transactions bt
JOIN bank_statements bs ON bt.statement_id = bs.id
JOIN bank_accounts ba ON bs.bank_account_id = ba.id
WHERE bt.is_matched = false;
REVOKE ALL ON public.unmatched_bank_transactions FROM anon;
GRANT SELECT ON public.unmatched_bank_transactions TO authenticated;

-- 10. beneficiaries_overview
DROP VIEW IF EXISTS public.beneficiaries_overview CASCADE;
CREATE VIEW public.beneficiaries_overview WITH (security_invoker = true)
AS SELECT b.id, b.full_name, b.beneficiary_number, b.category, b.status, b.family_id,
  f.family_name, b.total_received, b.account_balance, b.created_at
FROM beneficiaries b LEFT JOIN families f ON b.family_id = f.id;
REVOKE ALL ON public.beneficiaries_overview FROM anon;
GRANT SELECT ON public.beneficiaries_overview TO authenticated;

-- 11. properties_overview (استخدام name بدلاً من property_name)
DROP VIEW IF EXISTS public.properties_overview CASCADE;
CREATE VIEW public.properties_overview WITH (security_invoker = true)
AS SELECT p.id, p.name as property_name, p.type as property_type, p.location, p.status,
  p.total_units, p.occupied_units, p.monthly_revenue, p.created_at
FROM properties p;
REVOKE ALL ON public.properties_overview FROM anon;
GRANT SELECT ON public.properties_overview TO authenticated;

-- 12. beneficiaries_masked
DROP VIEW IF EXISTS public.beneficiaries_masked CASCADE;
CREATE VIEW public.beneficiaries_masked WITH (security_invoker = true)
AS SELECT b.id, b.beneficiary_number, CONCAT(LEFT(b.full_name, 3), '***') as full_name_masked,
  b.category, b.status, CONCAT('****', RIGHT(b.national_id, 4)) as national_id_masked, b.family_id
FROM beneficiaries b;
REVOKE ALL ON public.beneficiaries_masked FROM anon;
GRANT SELECT ON public.beneficiaries_masked TO authenticated;

-- 13. payment_vouchers_masked
DROP VIEW IF EXISTS public.payment_vouchers_masked CASCADE;
CREATE VIEW public.payment_vouchers_masked WITH (security_invoker = true)
AS SELECT pv.id, pv.voucher_number, COALESCE(pv.paid_at, pv.created_at)::date as voucher_date,
  pv.amount, pv.status, pv.payment_method,
  CONCAT(LEFT(COALESCE(b.full_name, 'غير محدد'), 3), '***') as payee_name_masked, pv.created_at
FROM payment_vouchers pv LEFT JOIN beneficiaries b ON pv.beneficiary_id = b.id;
REVOKE ALL ON public.payment_vouchers_masked FROM anon;
GRANT SELECT ON public.payment_vouchers_masked TO authenticated;
