-- تحويل unified_transactions_view من SECURITY DEFINER إلى SECURITY INVOKER
-- هذا يجعل الـ View أكثر أماناً بتطبيق RLS policies على المستخدم الحالي بدلاً من منشئ الـ View

DROP VIEW IF EXISTS unified_transactions_view;

CREATE VIEW unified_transactions_view
WITH (security_invoker = true)
AS
SELECT 
  'payment'::text AS source,
  CASE
    WHEN payments.payment_type = 'قبض'::text THEN 'سند قبض'::text
    WHEN payments.payment_type = 'صرف'::text THEN 'سند صرف'::text
    ELSE 'سند عام'::text
  END AS source_name_ar,
  'Payment'::text AS source_name_en,
  payments.id,
  payments.payment_date AS transaction_date,
  payments.amount,
  payments.payer_name AS party_name,
  payments.payment_type AS transaction_type,
  payments.payment_method,
  payments.description,
  payments.status,
  payments.journal_entry_id,
  payments.reference_number,
  payments.created_at,
  NULL::uuid AS beneficiary_id,
  NULL::text AS contract_number
FROM payments

UNION ALL

SELECT 
  'rental'::text AS source,
  'إيجار'::text AS source_name_ar,
  'Rental'::text AS source_name_en,
  rp.id,
  COALESCE(rp.payment_date, rp.due_date) AS transaction_date,
  rp.amount_paid AS amount,
  c.tenant_name AS party_name,
  'قبض'::text AS transaction_type,
  rp.payment_method,
  'دفعة إيجار - ' || p.name || ' - ' || c.contract_number AS description,
  rp.status,
  rp.journal_entry_id,
  rp.payment_number AS reference_number,
  rp.created_at,
  NULL::uuid AS beneficiary_id,
  c.contract_number
FROM rental_payments rp
LEFT JOIN contracts c ON c.id = rp.contract_id
LEFT JOIN properties p ON p.id = c.property_id
WHERE rp.status = 'مدفوع'::text

UNION ALL

SELECT 
  'distribution'::text AS source,
  'توزيع غلة'::text AS source_name_ar,
  'Distribution'::text AS source_name_en,
  distributions.id,
  distributions.distribution_date AS transaction_date,
  distributions.total_amount AS amount,
  'توزيع ' || distributions.month AS party_name,
  'صرف'::text AS transaction_type,
  'تحويل بنكي'::text AS payment_method,
  'توزيع غلة شهر ' || distributions.month AS description,
  distributions.status,
  distributions.journal_entry_id,
  distributions.id::text AS reference_number,
  distributions.created_at,
  NULL::uuid AS beneficiary_id,
  NULL::text AS contract_number
FROM distributions
WHERE distributions.status = 'معتمد'::text

ORDER BY transaction_date DESC, created_at DESC;