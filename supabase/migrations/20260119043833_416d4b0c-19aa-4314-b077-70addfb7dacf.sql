
-- =====================================================
-- إصلاح مشاكل الأمان مستوى WARN
-- إضافة security_invoker على الـ Views وتحسين RLS
-- =====================================================

-- 1. إصلاح landing_page_settings - تحسين سياسة القراءة العامة بـ whitelist
DROP POLICY IF EXISTS "public_read_non_sensitive" ON public.landing_page_settings;
DROP POLICY IF EXISTS "public_read_safe_settings_whitelist" ON public.landing_page_settings;

CREATE POLICY "public_read_safe_settings_whitelist"
ON public.landing_page_settings
FOR SELECT
TO anon
USING (
  is_active = true 
  AND setting_key IN (
    'site_name', 'site_description', 'hero_title', 'hero_subtitle',
    'logo_url', 'favicon_url', 'primary_color', 'secondary_color',
    'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url',
    'footer_text', 'privacy_policy_url', 'terms_url'
  )
);

-- 2. إعادة إنشاء الـ Views مع security_invoker = true

-- accounts_hierarchy
DROP VIEW IF EXISTS public.accounts_hierarchy CASCADE;
CREATE VIEW public.accounts_hierarchy
WITH (security_invoker = true)
AS
SELECT a.id, a.code, a.name_ar, a.name_en, a.account_type, a.account_nature,
    a.parent_id, a.is_header, a.is_active, a.current_balance, a.description,
    a.created_at, a.updated_at, p.name_ar AS parent_name, p.code AS parent_code
FROM accounts a
LEFT JOIN accounts p ON a.parent_id = p.id;

-- active_loans_summary
DROP VIEW IF EXISTS public.active_loans_summary CASCADE;
CREATE VIEW public.active_loans_summary
WITH (security_invoker = true)
AS
SELECT l.id, l.loan_number, b.full_name AS beneficiary_name,
    l.loan_amount, l.remaining_balance, l.paid_amount, l.monthly_installment, l.status,
    (SELECT count(*) FROM loan_installments li WHERE li.loan_id = l.id AND li.status = 'معلق') AS pending_installments,
    (SELECT min(li.due_date) FROM loan_installments li WHERE li.loan_id = l.id AND li.status = 'معلق') AS next_due_date
FROM loans l
JOIN beneficiaries b ON l.beneficiary_id = b.id
WHERE l.status = ANY (ARRAY['نشط', 'approved']);

-- beneficiaries_masked
DROP VIEW IF EXISTS public.beneficiaries_masked CASCADE;
CREATE VIEW public.beneficiaries_masked
WITH (security_invoker = true)
AS
SELECT id, beneficiary_number, concat(left(full_name, 3), '***') AS full_name_masked,
    category, status, concat('****', right(national_id, 4)) AS national_id_masked, family_id
FROM beneficiaries;

-- beneficiaries_overview
DROP VIEW IF EXISTS public.beneficiaries_overview CASCADE;
CREATE VIEW public.beneficiaries_overview
WITH (security_invoker = true)
AS
SELECT b.id, b.full_name, b.beneficiary_number, b.category, b.status, b.family_id,
    f.family_name, b.total_received, b.account_balance, b.created_at
FROM beneficiaries b
LEFT JOIN families f ON b.family_id = f.id;

-- beneficiary_statistics
DROP VIEW IF EXISTS public.beneficiary_statistics CASCADE;
CREATE VIEW public.beneficiary_statistics
WITH (security_invoker = true)
AS
SELECT id, full_name, category, status,
    COALESCE(total_received, 0) AS total_received,
    COALESCE(total_payments, 0) AS total_payments,
    COALESCE(account_balance, 0) AS account_balance
FROM beneficiaries;

-- distributions_summary
DROP VIEW IF EXISTS public.distributions_summary CASCADE;
CREATE VIEW public.distributions_summary
WITH (security_invoker = true)
AS
SELECT id, month, distribution_date, total_amount, beneficiaries_count,
    status, distribution_type, waqf_name, created_at
FROM distributions;

-- payment_vouchers_masked (استخدام التعريف الصحيح)
DROP VIEW IF EXISTS public.payment_vouchers_masked CASCADE;
CREATE VIEW public.payment_vouchers_masked
WITH (security_invoker = true)
AS
SELECT pv.id, pv.voucher_number,
    (COALESCE(pv.paid_at, pv.created_at))::date AS voucher_date,
    pv.amount, pv.status, pv.payment_method,
    concat(left(COALESCE(b.full_name, 'غير محدد'), 3), '***') AS payee_name_masked,
    pv.created_at
FROM payment_vouchers pv
LEFT JOIN beneficiaries b ON pv.beneficiary_id = b.id;

-- unmatched_bank_transactions
DROP VIEW IF EXISTS public.unmatched_bank_transactions CASCADE;
CREATE VIEW public.unmatched_bank_transactions
WITH (security_invoker = true)
AS
SELECT bt.id, bt.statement_id, bt.transaction_date, bt.description, bt.amount,
    bt.transaction_type, bt.reference_number, bt.is_matched,
    bs.bank_account_id, ba.bank_name, ba.account_number
FROM bank_transactions bt
JOIN bank_statements bs ON bt.statement_id = bs.id
JOIN bank_accounts ba ON bs.bank_account_id = ba.id
WHERE bt.is_matched = false;

-- audit_logs_summary
DROP VIEW IF EXISTS public.audit_logs_summary CASCADE;
CREATE VIEW public.audit_logs_summary
WITH (security_invoker = true)
AS
SELECT id, user_email, user_role, action_type, table_name, record_id,
    description, severity, created_at,
    CASE action_type
        WHEN 'INSERT' THEN 'إضافة' WHEN 'UPDATE' THEN 'تعديل'
        WHEN 'DELETE' THEN 'حذف' WHEN 'VIEW_ACCESS' THEN 'عرض'
        ELSE action_type
    END AS action_type_ar,
    CASE severity
        WHEN 'info' THEN 'معلومة' WHEN 'warning' THEN 'تحذير'
        WHEN 'error' THEN 'خطأ' WHEN 'critical' THEN 'حرج'
        ELSE severity
    END AS severity_ar
FROM audit_logs
ORDER BY created_at DESC;

-- 3. منح صلاحيات على الـ Views
GRANT SELECT ON public.accounts_hierarchy TO authenticated;
GRANT SELECT ON public.active_loans_summary TO authenticated;
GRANT SELECT ON public.beneficiaries_masked TO authenticated;
GRANT SELECT ON public.beneficiaries_overview TO authenticated;
GRANT SELECT ON public.beneficiary_statistics TO authenticated;
GRANT SELECT ON public.distributions_summary TO authenticated;
GRANT SELECT ON public.payment_vouchers_masked TO authenticated;
GRANT SELECT ON public.unmatched_bank_transactions TO authenticated;
GRANT SELECT ON public.audit_logs_summary TO authenticated;
