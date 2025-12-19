-- حذف الفهارس المكررة المتبقية (27 فهرس)
-- ================================================

-- fiscal_year_closings
DROP INDEX IF EXISTS idx_fiscal_year_closings_fiscal_year;

-- invoices
DROP INDEX IF EXISTS idx_invoices_invoice_number;

-- journal_entry_lines
DROP INDEX IF EXISTS idx_jel_je;
DROP INDEX IF EXISTS idx_journal_entry_lines_entry_account;

-- loan_installments
DROP INDEX IF EXISTS idx_installments_due_date;
DROP INDEX IF EXISTS idx_installments_loan;

-- loans
DROP INDEX IF EXISTS idx_loans_number;

-- payment_vouchers
DROP INDEX IF EXISTS idx_pv_benef;

-- payments
DROP INDEX IF EXISTS idx_payments_payment_number;

-- permissions
DROP INDEX IF EXISTS idx_permissions_name;

-- profiles
DROP INDEX IF EXISTS idx_profiles_user;
DROP INDEX IF EXISTS idx_profiles_user_id;

-- request_comments
DROP INDEX IF EXISTS idx_comments_request;
DROP INDEX IF EXISTS idx_comments_user;

-- support_agent_availability
DROP INDEX IF EXISTS idx_agent_availability_user;

-- support_agent_stats
DROP INDEX IF EXISTS idx_agent_stats_user_date;

-- system_alerts
DROP INDEX IF EXISTS idx_alerts_status;

-- system_settings
DROP INDEX IF EXISTS idx_system_settings_key;

-- tribes
DROP INDEX IF EXISTS idx_tribes_name;

-- user_roles
DROP INDEX IF EXISTS idx_user_roles_lookup;
DROP INDEX IF EXISTS idx_user_roles_user_id_role;
DROP INDEX IF EXISTS idx_user_roles_user_role;

-- waqf_units
DROP INDEX IF EXISTS idx_waqf_units_code;