
-- إصلاح تحذيرات الأمان: تحويل Views إلى SECURITY INVOKER

-- 1. accounts_hierarchy
DROP VIEW IF EXISTS public.accounts_hierarchy;
CREATE VIEW public.accounts_hierarchy WITH (security_invoker = true) AS
SELECT a.id, a.code, a.name_ar, a.name_en, a.account_type, a.account_nature,
  a.is_header, a.is_active, a.current_balance, a.parent_id,
  p.name_ar as parent_name, p.code as parent_code,
  (SELECT COUNT(*) FROM accounts c WHERE c.parent_id = a.id) as children_count
FROM accounts a LEFT JOIN accounts p ON a.parent_id = p.id;

-- 2. distributions_summary
DROP VIEW IF EXISTS public.distributions_summary;
CREATE VIEW public.distributions_summary WITH (security_invoker = true) AS
SELECT d.id, d.distribution_date, d.total_amount, d.status, d.beneficiaries_count,
  d.distribution_type, d.waqf_name, d.nazer_share, d.waqif_charity, d.waqf_corpus, d.distributable_amount,
  COALESCE((SELECT COUNT(*) FROM distribution_details dd WHERE dd.distribution_id = d.id), 0) as details_count,
  COALESCE((SELECT SUM(allocated_amount) FROM distribution_details dd WHERE dd.distribution_id = d.id), 0) as total_allocated,
  COALESCE((SELECT COUNT(*) FROM distribution_details dd WHERE dd.distribution_id = d.id AND dd.payment_status = 'paid'), 0) as paid_count
FROM distributions d;

-- 3. properties_overview
DROP VIEW IF EXISTS public.properties_overview;
CREATE VIEW public.properties_overview WITH (security_invoker = true) AS
SELECT p.id, p.name, p.type, p.location, p.status, p.total_units, p.occupied_units,
  p.available_units, p.occupancy_percentage, p.monthly_revenue,
  (SELECT COUNT(*) FROM contracts c WHERE c.property_id = p.id AND c.status = 'نشط') as active_contracts,
  (SELECT COALESCE(SUM(monthly_rent), 0) FROM contracts c WHERE c.property_id = p.id AND c.status = 'نشط') as total_monthly_rent
FROM properties p;

-- 4. beneficiaries_overview
DROP VIEW IF EXISTS public.beneficiaries_overview;
CREATE VIEW public.beneficiaries_overview WITH (security_invoker = true) AS
SELECT b.id, b.full_name, b.national_id, b.phone, b.category, b.status, b.relationship, b.gender,
  b.account_balance, b.total_received, b.total_payments,
  (SELECT COUNT(*) FROM distribution_details dd WHERE dd.beneficiary_id = b.id) as distributions_count,
  (SELECT COALESCE(SUM(allocated_amount), 0) FROM distribution_details dd WHERE dd.beneficiary_id = b.id) as total_distributions,
  (SELECT COUNT(*) FROM loans l WHERE l.beneficiary_id = b.id AND l.status = 'نشط') as active_loans
FROM beneficiaries b;

-- 5. journal_entries_with_lines
DROP VIEW IF EXISTS public.journal_entries_with_lines;
CREATE VIEW public.journal_entries_with_lines WITH (security_invoker = true) AS
SELECT je.id, je.entry_number, je.entry_date, je.description, je.status, je.reference_type, je.reference_id,
  fy.name as fiscal_year,
  (SELECT COALESCE(SUM(debit_amount), 0) FROM journal_entry_lines jel WHERE jel.journal_entry_id = je.id) as total_debit,
  (SELECT COALESCE(SUM(credit_amount), 0) FROM journal_entry_lines jel WHERE jel.journal_entry_id = je.id) as total_credit,
  (SELECT COUNT(*) FROM journal_entry_lines jel WHERE jel.journal_entry_id = je.id) as lines_count
FROM journal_entries je LEFT JOIN fiscal_years fy ON je.fiscal_year_id = fy.id;

-- 6. loans_summary
DROP VIEW IF EXISTS public.loans_summary;
CREATE VIEW public.loans_summary WITH (security_invoker = true) AS
SELECT l.id, l.loan_number, l.loan_amount, l.remaining_balance, l.paid_amount, l.status, l.start_date as loan_date,
  b.full_name as beneficiary_name, b.national_id as beneficiary_national_id,
  (SELECT COUNT(*) FROM loan_installments li WHERE li.loan_id = l.id) as total_installments,
  (SELECT COUNT(*) FROM loan_installments li WHERE li.loan_id = l.id AND li.status = 'مدفوع') as paid_installments
FROM loans l LEFT JOIN beneficiaries b ON l.beneficiary_id = b.id;

-- 7. invoices_summary
DROP VIEW IF EXISTS public.invoices_summary;
CREATE VIEW public.invoices_summary WITH (security_invoker = true) AS
SELECT i.id, i.invoice_number, i.invoice_date, i.customer_name, i.total_amount, i.tax_amount,
  i.status, i.invoice_type, i.is_zatca_compliant,
  (SELECT COUNT(*) FROM invoice_lines il WHERE il.invoice_id = i.id) as lines_count
FROM invoices i;

-- 8. unmatched_bank_transactions
DROP VIEW IF EXISTS public.unmatched_bank_transactions;
CREATE VIEW public.unmatched_bank_transactions WITH (security_invoker = true) AS
SELECT bt.id, bt.transaction_date, bt.description, bt.amount, bt.transaction_type, bt.reference_number,
  bs.statement_date, ba.bank_name, ba.account_number
FROM bank_transactions bt
JOIN bank_statements bs ON bt.statement_id = bs.id
JOIN bank_accounts ba ON bs.bank_account_id = ba.id
WHERE bt.is_matched = false;

-- 9. pending_approvals_view
DROP VIEW IF EXISTS public.pending_approvals_view;
CREATE VIEW public.pending_approvals_view WITH (security_invoker = true) AS
SELECT ast.id, ast.entity_type, ast.entity_id, ast.status, ast.current_level, ast.total_levels, ast.created_at, aw.workflow_name
FROM approval_status ast LEFT JOIN approval_workflows aw ON ast.workflow_id = aw.id
WHERE ast.status = 'pending' ORDER BY ast.created_at;
