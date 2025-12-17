-- إعادة إنشاء Views المتبقية مع security_invoker = true

-- 1. beneficiary_statistics
DROP VIEW IF EXISTS beneficiary_statistics CASCADE;
CREATE VIEW beneficiary_statistics WITH (security_invoker = true) AS
SELECT id,
    full_name,
    category,
    status,
    COALESCE(total_received, 0::numeric) AS total_received,
    COALESCE(total_payments, 0::numeric) AS total_payments,
    COALESCE(account_balance, 0::numeric) AS account_balance
FROM beneficiaries b;

-- 2. current_user_roles (مع CASCADE)
DROP VIEW IF EXISTS current_user_roles CASCADE;
CREATE VIEW current_user_roles WITH (security_invoker = true) AS
SELECT ur.user_id,
    ur.role,
    ur.created_at,
    p.full_name,
    p.email
FROM user_roles ur
LEFT JOIN profiles p ON p.user_id = ur.user_id
WHERE ur.user_id = auth.uid();

-- 3. trial_balance
DROP VIEW IF EXISTS trial_balance CASCADE;
CREATE VIEW trial_balance WITH (security_invoker = true) AS
SELECT a.code,
    a.name_ar,
    a.account_type,
    a.account_nature,
    COALESCE(sum(jel.debit_amount), 0::numeric) AS total_debit,
    COALESCE(sum(jel.credit_amount), 0::numeric) AS total_credit,
    COALESCE(sum(jel.debit_amount) - sum(jel.credit_amount), 0::numeric) AS balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE a.is_active = true AND a.is_header = false AND (je.status = 'posted'::entry_status OR je.status IS NULL)
GROUP BY a.id, a.code, a.name_ar, a.account_type, a.account_nature
HAVING COALESCE(sum(jel.debit_amount) - sum(jel.credit_amount), 0::numeric) <> 0::numeric
ORDER BY a.code;

-- 4. recent_activities
DROP VIEW IF EXISTS recent_activities CASCADE;
CREATE VIEW recent_activities WITH (security_invoker = true) AS
SELECT id,
    COALESCE(description, (action_type || ' في جدول '::text) || table_name) AS action,
    COALESCE(user_email, 'النظام'::text) AS user_name,
    created_at AS "timestamp",
    created_at
FROM audit_logs
WHERE created_at >= (now() - '30 days'::interval)
ORDER BY created_at DESC
LIMIT 100;

-- 5. messages_with_users
DROP VIEW IF EXISTS messages_with_users CASCADE;
CREATE VIEW messages_with_users WITH (security_invoker = true) AS
SELECT m.id,
    m.sender_id,
    m.receiver_id,
    m.subject,
    m.body,
    m.is_read,
    m.read_at,
    m.parent_message_id,
    m.request_id,
    m.created_at,
    m.updated_at,
    m.priority,
    COALESCE(sender_p.full_name, sender_b.full_name) AS sender_name,
    sender_b.beneficiary_number AS sender_number,
    COALESCE(receiver_p.full_name, receiver_b.full_name) AS receiver_name,
    receiver_b.beneficiary_number AS receiver_number
FROM internal_messages m
LEFT JOIN profiles sender_p ON sender_p.user_id = m.sender_id
LEFT JOIN beneficiaries sender_b ON sender_b.user_id = m.sender_id
LEFT JOIN profiles receiver_p ON receiver_p.user_id = m.receiver_id
LEFT JOIN beneficiaries receiver_b ON receiver_b.user_id = m.receiver_id;

-- 6. payments_with_contract_details
DROP VIEW IF EXISTS payments_with_contract_details CASCADE;
CREATE VIEW payments_with_contract_details WITH (security_invoker = true) AS
SELECT p.id,
    p.payment_type,
    p.payment_number,
    p.payment_date,
    p.amount,
    p.payment_method,
    p.payer_name,
    p.reference_number,
    p.description,
    p.notes,
    p.journal_entry_id,
    p.created_at,
    p.updated_at,
    p.beneficiary_id,
    p.status,
    p.rental_payment_id,
    p.contract_id,
    c.contract_number,
    c.tenant_name,
    c.tenant_phone,
    c.tenant_id_number,
    prop.name AS property_name,
    prop.location AS property_location,
    prop.type AS property_type
FROM payments p
LEFT JOIN contracts c ON p.contract_id = c.id
LEFT JOIN properties prop ON c.property_id = prop.id;

-- 7. user_profile_with_roles
DROP VIEW IF EXISTS user_profile_with_roles CASCADE;
CREATE VIEW user_profile_with_roles WITH (security_invoker = true) AS
SELECT id,
    full_name,
    email,
    phone,
    avatar_url,
    is_active,
    last_login_at,
    created_at,
    updated_at,
    "position",
    user_id,
    (SELECT json_agg(json_build_object('role', ur.role))
     FROM user_roles ur
     WHERE ur.user_id = p.user_id) AS user_roles
FROM profiles p;

-- 8. historical_rental_monthly_summary
DROP VIEW IF EXISTS historical_rental_monthly_summary CASCADE;
CREATE VIEW historical_rental_monthly_summary WITH (security_invoker = true) AS
SELECT fiscal_year_closing_id,
    month_date,
    to_char(month_date::timestamp with time zone, 'YYYY-MM'::text) AS month_year,
    to_char(month_date::timestamp with time zone, 'Month YYYY'::text) AS month_label,
    count(*) AS total_units,
    count(*) FILTER (WHERE payment_status::text = 'paid'::text) AS paid_count,
    count(*) FILTER (WHERE payment_status::text = 'unpaid'::text) AS unpaid_count,
    count(*) FILTER (WHERE payment_status::text = 'vacant'::text) AS vacant_count,
    COALESCE(sum(monthly_payment), 0::numeric) AS total_collected,
    COALESCE(sum(monthly_payment) FILTER (WHERE payment_status::text = 'paid'::text), 0::numeric) AS paid_amount
FROM historical_rental_details
GROUP BY fiscal_year_closing_id, month_date
ORDER BY month_date;

-- إعادة إنشاء RLS policies المحذوفة
CREATE POLICY "Allow nazer and admin to view changelog" ON documentation_changelog
FOR SELECT USING (EXISTS (SELECT 1 FROM current_user_roles WHERE role IN ('nazer', 'admin')));

CREATE POLICY "Allow nazer and admin to insert changelog" ON documentation_changelog
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM current_user_roles WHERE role IN ('nazer', 'admin')));

CREATE POLICY "Allow nazer and admin to insert documentation" ON project_documentation
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM current_user_roles WHERE role IN ('nazer', 'admin')));

CREATE POLICY "Allow nazer and admin to update documentation" ON project_documentation
FOR UPDATE USING (EXISTS (SELECT 1 FROM current_user_roles WHERE role IN ('nazer', 'admin')));