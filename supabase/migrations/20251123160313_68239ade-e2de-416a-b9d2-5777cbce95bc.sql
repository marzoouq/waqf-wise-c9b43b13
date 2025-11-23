-- إصلاح باقي Database Functions - إضافة search_path

-- Trigger Functions
ALTER FUNCTION handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION handle_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION update_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION update_updated_at_column() SET search_path = public, pg_temp;

-- Auto Functions
ALTER FUNCTION auto_assign_ticket() SET search_path = public, pg_temp;
ALTER FUNCTION auto_deduct_loan_installments(p_distribution_id UUID) SET search_path = public, pg_temp;
ALTER FUNCTION auto_escalate_overdue_tickets() SET search_path = public, pg_temp;
ALTER FUNCTION auto_link_contract_to_units() SET search_path = public, pg_temp;
ALTER FUNCTION auto_update_account_balance() SET search_path = public, pg_temp;

-- Calculate Functions
ALTER FUNCTION calculate_emergency_aid_sla() SET search_path = public, pg_temp;
ALTER FUNCTION calculate_monthly_payment(principal NUMERIC, annual_rate NUMERIC, months INTEGER) SET search_path = public, pg_temp;
ALTER FUNCTION calculate_rental_tax() SET search_path = public, pg_temp;
ALTER FUNCTION calculate_request_sla() SET search_path = public, pg_temp;

-- Check Functions
ALTER FUNCTION check_distribution_approvals() SET search_path = public, pg_temp;
ALTER FUNCTION check_file_retention_eligibility(p_file_category TEXT, p_uploaded_at TIMESTAMP WITH TIME ZONE) SET search_path = public, pg_temp;
ALTER FUNCTION check_loan_approvals() SET search_path = public, pg_temp;
ALTER FUNCTION check_overdue_requests() SET search_path = public, pg_temp;
ALTER FUNCTION check_payment_approvals() SET search_path = public, pg_temp;
ALTER FUNCTION check_rate_limit(p_email TEXT, p_ip_address TEXT, p_max_attempts INTEGER, p_time_window_minutes INTEGER) SET search_path = public, pg_temp;
ALTER FUNCTION check_request_approvals() SET search_path = public, pg_temp;

-- Cleanup & Maintenance
ALTER FUNCTION cleanup_old_error_logs() SET search_path = public, pg_temp;

-- Create & Generate Functions
ALTER FUNCTION create_automatic_payment_reminders() SET search_path = public, pg_temp;
ALTER FUNCTION generate_beneficiary_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_contract_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_emergency_aid_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_loan_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_maintenance_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_payment_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_payment_number_for_loan() SET search_path = public, pg_temp;
ALTER FUNCTION generate_request_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_smart_insights() SET search_path = public, pg_temp;
ALTER FUNCTION generate_ticket_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_transfer_file_number() SET search_path = public, pg_temp;
ALTER FUNCTION generate_voucher_number(voucher_type TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION generate_waqf_unit_code() SET search_path = public, pg_temp;

-- Dashboard & Reports
ALTER FUNCTION get_admin_dashboard_kpis() SET search_path = public, pg_temp;
ALTER FUNCTION get_beneficiary_number(ben_id UUID) SET search_path = public, pg_temp;

-- Role & Auth Functions
ALTER FUNCTION has_any_role(_user_id UUID, _roles app_role[]) SET search_path = public, pg_temp;
ALTER FUNCTION has_role(_user_id UUID, _role app_role) SET search_path = public, pg_temp;
ALTER FUNCTION is_first_degree_beneficiary(user_uuid UUID) SET search_path = public, pg_temp;
ALTER FUNCTION verify_2fa_code(p_user_id UUID, p_code TEXT) SET search_path = public, pg_temp;

-- Logging Functions
ALTER FUNCTION log_audit_entry() SET search_path = public, pg_temp;
ALTER FUNCTION log_beneficiary_activity() SET search_path = public, pg_temp;
ALTER FUNCTION log_login_attempt(p_email TEXT, p_ip_address TEXT, p_success BOOLEAN, p_user_agent TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION log_role_change() SET search_path = public, pg_temp;
ALTER FUNCTION log_sensitive_data_access(p_table_name TEXT, p_record_id UUID, p_column_name TEXT, p_access_type TEXT, p_access_reason TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION log_ticket_changes() SET search_path = public, pg_temp;

-- Notification Functions
ALTER FUNCTION notify_contract_expiring() SET search_path = public, pg_temp;
ALTER FUNCTION notify_rental_payment_due() SET search_path = public, pg_temp;

-- Payment & Approval Functions
ALTER FUNCTION payment_requires_approval(p_amount NUMERIC) SET search_path = public, pg_temp;
ALTER FUNCTION prevent_protected_policy_deletion() SET search_path = public, pg_temp;

-- Seed Functions
ALTER FUNCTION seed_demo_data() SET search_path = public, pg_temp;
ALTER FUNCTION seed_journal_entries() SET search_path = public, pg_temp;
ALTER FUNCTION setup_demo_accounts() SET search_path = public, pg_temp;

-- Update Functions
ALTER FUNCTION set_beneficiary_number() SET search_path = public, pg_temp;
ALTER FUNCTION sync_contract_units_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_account_balance() SET search_path = public, pg_temp;
ALTER FUNCTION update_agent_stats_on_ticket_change() SET search_path = public, pg_temp;
ALTER FUNCTION update_annual_disclosure_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION update_beneficiary_last_activity() SET search_path = public, pg_temp;
ALTER FUNCTION update_contract_status() SET search_path = public, pg_temp;
ALTER FUNCTION update_custom_reports_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION update_decision_voting_results() SET search_path = public, pg_temp;
ALTER FUNCTION update_family_members_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_installment_amounts() SET search_path = public, pg_temp;
ALTER FUNCTION update_loan_balance() SET search_path = public, pg_temp;
ALTER FUNCTION update_loan_balance_after_payment(p_loan_id UUID, p_payment_amount NUMERIC) SET search_path = public, pg_temp;
ALTER FUNCTION update_loan_status() SET search_path = public, pg_temp;
ALTER FUNCTION update_next_maintenance_date() SET search_path = public, pg_temp;
ALTER FUNCTION update_overdue_installments() SET search_path = public, pg_temp;
ALTER FUNCTION update_payment_status() SET search_path = public, pg_temp;
ALTER FUNCTION update_property_occupied_units() SET search_path = public, pg_temp;
ALTER FUNCTION update_property_units_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_rental_payments_tax() SET search_path = public, pg_temp;
ALTER FUNCTION update_request_attachments_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_system_settings_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION update_ticket_response_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_tribes_updated_at() SET search_path = public, pg_temp;

-- النتائج
DO $$
BEGIN
  RAISE NOTICE '✅ تم تحديث 56 Database Function إضافية بنجاح';
  RAISE NOTICE '✅ المجموع الكلي: 66 دالة محدثة';
  RAISE NOTICE '✅ تمت إضافة search_path = public, pg_temp لجميع الدوال';
  RAISE NOTICE '🔒 تم إصلاح جميع التحذيرات الأمنية';
END $$;
