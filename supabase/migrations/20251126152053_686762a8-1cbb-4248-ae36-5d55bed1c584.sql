-- إصلاح Security Definer Views
-- تحويل جميع الـ Views إلى SECURITY INVOKER

-- 1. إعادة إنشاء beneficiary_account_statement view
DROP VIEW IF EXISTS public.beneficiary_account_statement CASCADE;

CREATE VIEW public.beneficiary_account_statement
WITH (security_invoker = true)
AS
SELECT 
  b.id AS beneficiary_id,
  b.full_name,
  b.national_id,
  COALESCE(b.account_balance, 0) AS account_balance,
  COALESCE(b.total_received, 0) AS total_received,
  json_agg(
    json_build_object(
      'id', p.id,
      'amount', p.amount,
      'payment_date', p.payment_date,
      'description', p.description,
      'payment_method', p.payment_method,
      'reference_number', p.reference_number,
      'status', p.status
    ) ORDER BY p.payment_date DESC
  ) FILTER (WHERE p.id IS NOT NULL) AS payments,
  count(p.id) AS total_payments
FROM beneficiaries b
LEFT JOIN payments p ON p.beneficiary_id = b.id
GROUP BY b.id, b.full_name, b.national_id, b.account_balance, b.total_received;

-- 2. إعادة إنشاء beneficiary_statistics view
DROP VIEW IF EXISTS public.beneficiary_statistics CASCADE;

CREATE VIEW public.beneficiary_statistics
WITH (security_invoker = true)
AS
SELECT 
  b.id,
  b.full_name,
  b.beneficiary_number,
  b.category,
  b.status,
  count(DISTINCT br.id) AS total_requests,
  count(DISTINCT ba.id) AS total_attachments,
  COALESCE(sum(dd.allocated_amount), 0) AS total_distributions
FROM beneficiaries b
LEFT JOIN beneficiary_requests br ON br.beneficiary_id = b.id
LEFT JOIN beneficiary_attachments ba ON ba.beneficiary_id = b.id
LEFT JOIN distribution_details dd ON dd.beneficiary_id = b.id
GROUP BY b.id, b.full_name, b.beneficiary_number, b.category, b.status;

-- 3. إعادة إنشاء distribution_statistics view
DROP VIEW IF EXISTS public.distribution_statistics CASCADE;

CREATE VIEW public.distribution_statistics
WITH (security_invoker = true)
AS
SELECT 
  d.id,
  d.distribution_date,
  d.total_amount,
  d.status,
  count(DISTINCT dd.id) AS beneficiaries_count,
  COALESCE(sum(dd.allocated_amount), 0) AS total_distributed
FROM distributions d
LEFT JOIN distribution_details dd ON dd.distribution_id = d.id
GROUP BY d.id, d.distribution_date, d.total_amount, d.status;

-- 4. إعادة إنشاء payment_vouchers_with_details view
DROP VIEW IF EXISTS public.payment_vouchers_with_details CASCADE;

CREATE VIEW public.payment_vouchers_with_details
WITH (security_invoker = true)
AS
SELECT 
  pv.*,
  d.id AS distribution_id_ref,
  d.distribution_date,
  btf.file_number AS bank_transfer_file_number,
  btf.status AS bank_transfer_status
FROM payment_vouchers pv
LEFT JOIN distributions d ON d.id = pv.distribution_id
LEFT JOIN bank_transfer_files btf ON btf.distribution_id = d.id;

COMMENT ON VIEW public.beneficiary_account_statement IS 'View with SECURITY INVOKER - uses querying user permissions';
COMMENT ON VIEW public.beneficiary_statistics IS 'View with SECURITY INVOKER - uses querying user permissions';
COMMENT ON VIEW public.distribution_statistics IS 'View with SECURITY INVOKER - uses querying user permissions';
COMMENT ON VIEW public.payment_vouchers_with_details IS 'View with SECURITY INVOKER - uses querying user permissions';