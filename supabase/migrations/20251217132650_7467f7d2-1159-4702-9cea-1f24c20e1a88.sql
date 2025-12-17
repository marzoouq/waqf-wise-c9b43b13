-- إعادة إنشاء Views مع security_invoker = true

-- 1. beneficiary_account_statement
DROP VIEW IF EXISTS beneficiary_account_statement;
CREATE VIEW beneficiary_account_statement WITH (security_invoker = true) AS
SELECT id AS beneficiary_id,
    full_name,
    national_id,
    COALESCE(total_received, 0::numeric) AS total_received,
    COALESCE(account_balance, 0::numeric) AS account_balance,
    COALESCE(pending_amount, 0::numeric) AS pending_amount
FROM beneficiaries b;

-- 2. general_ledger
DROP VIEW IF EXISTS general_ledger;
CREATE VIEW general_ledger WITH (security_invoker = true) AS
SELECT a.id AS account_id,
    a.code,
    a.name_ar,
    a.account_type,
    a.account_nature,
    COALESCE(sum(jel.debit_amount), 0::numeric) AS total_debit,
    COALESCE(sum(jel.credit_amount), 0::numeric) AS total_credit,
    COALESCE(a.current_balance, 0::numeric) AS current_balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
GROUP BY a.id;

-- 3. distribution_statistics
DROP VIEW IF EXISTS distribution_statistics;
CREATE VIEW distribution_statistics WITH (security_invoker = true) AS
SELECT d.id,
    d.distribution_date,
    d.total_amount,
    d.status,
    count(DISTINCT dd.id) AS beneficiaries_count,
    COALESCE(sum(dd.allocated_amount), 0::numeric) AS total_distributed
FROM distributions d
LEFT JOIN distribution_details dd ON dd.distribution_id = d.id
GROUP BY d.id, d.distribution_date, d.total_amount, d.status;

-- 4. payment_vouchers_with_details
DROP VIEW IF EXISTS payment_vouchers_with_details;
CREATE VIEW payment_vouchers_with_details WITH (security_invoker = true) AS
SELECT pv.id,
    pv.voucher_number,
    pv.voucher_type,
    pv.distribution_id,
    pv.journal_entry_id,
    pv.amount,
    pv.beneficiary_id,
    pv.description,
    pv.payment_method,
    pv.bank_account_id,
    pv.reference_number,
    pv.status,
    pv.approved_by,
    pv.approved_at,
    pv.paid_by,
    pv.paid_at,
    pv.notes,
    pv.attachments,
    pv.metadata,
    pv.created_by,
    pv.created_at,
    pv.updated_at,
    pv.payment_id,
    d.id AS distribution_id_ref,
    d.distribution_date,
    btf.file_number AS bank_transfer_file_number,
    btf.status AS bank_transfer_status
FROM payment_vouchers pv
LEFT JOIN distributions d ON d.id = pv.distribution_id
LEFT JOIN bank_transfer_files btf ON btf.distribution_id = d.id;

-- 5. unified_transactions_view
DROP VIEW IF EXISTS unified_transactions_view;
CREATE VIEW unified_transactions_view WITH (security_invoker = true) AS
SELECT 'payment'::text AS source,
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
    payments.status::text,
    payments.journal_entry_id,
    payments.reference_number,
    payments.created_at,
    NULL::uuid AS beneficiary_id,
    NULL::text AS contract_number
FROM payments
UNION ALL
SELECT 'rental'::text AS source,
    'إيجار'::text AS source_name_ar,
    'Rental'::text AS source_name_en,
    rp.id,
    COALESCE(rp.payment_date, rp.due_date) AS transaction_date,
    rp.amount_paid AS amount,
    c.tenant_name AS party_name,
    'قبض'::text AS transaction_type,
    rp.payment_method,
    (('دفعة إيجار - '::text || p.name) || ' - '::text) || c.contract_number AS description,
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
SELECT 'distribution'::text AS source,
    'توزيع غلة'::text AS source_name_ar,
    'Distribution'::text AS source_name_en,
    distributions.id,
    distributions.distribution_date AS transaction_date,
    distributions.total_amount AS amount,
    'توزيع '::text || distributions.month AS party_name,
    'صرف'::text AS transaction_type,
    'تحويل بنكي'::text AS payment_method,
    'توزيع غلة شهر '::text || distributions.month AS description,
    distributions.status::text,
    distributions.journal_entry_id,
    distributions.id::text AS reference_number,
    distributions.created_at,
    NULL::uuid AS beneficiary_id,
    NULL::text AS contract_number
FROM distributions
WHERE distributions.status = 'معتمد'::text
ORDER BY 5 DESC, 14 DESC;