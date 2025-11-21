
-- إصلاح أمني: تحديث search_path لجميع الدوال إلى 'public', 'pg_temp'
-- هذا يمنع هجمات Search Path Injection

-- 1. assign_user_role
ALTER FUNCTION public.assign_user_role(text, app_role) SET search_path TO 'public', 'pg_temp';

-- 2. calculate_account_balance
ALTER FUNCTION public.calculate_account_balance(uuid) SET search_path TO 'public', 'pg_temp';

-- 3. calculate_loan_schedule
ALTER FUNCTION public.calculate_loan_schedule(uuid, numeric, numeric, integer, date) SET search_path TO 'public', 'pg_temp';

-- 4. calculate_monthly_payment
ALTER FUNCTION public.calculate_monthly_payment(numeric, numeric, integer) SET search_path TO 'public', 'pg_temp';

-- 5. calculate_request_sla
ALTER FUNCTION public.calculate_request_sla() SET search_path TO 'public', 'pg_temp';

-- 6. check_distribution_approvals
ALTER FUNCTION public.check_distribution_approvals() SET search_path TO 'public', 'pg_temp';

-- 7. check_loan_approvals
ALTER FUNCTION public.check_loan_approvals() SET search_path TO 'public', 'pg_temp';

-- 8. check_payment_approvals
ALTER FUNCTION public.check_payment_approvals() SET search_path TO 'public', 'pg_temp';

-- 9. check_rate_limit
ALTER FUNCTION public.check_rate_limit(text, text, integer, integer) SET search_path TO 'public', 'pg_temp';

-- 10. check_request_approvals
ALTER FUNCTION public.check_request_approvals() SET search_path TO 'public', 'pg_temp';

-- 11. create_auto_journal_entry
ALTER FUNCTION public.create_auto_journal_entry(text, uuid, numeric, text, date) SET search_path TO 'public', 'pg_temp';

-- 12. create_notification
ALTER FUNCTION public.create_notification(uuid, text, text, text, text, uuid, text) SET search_path TO 'public', 'pg_temp';

-- 13. generate_beneficiary_number
ALTER FUNCTION public.generate_beneficiary_number() SET search_path TO 'public', 'pg_temp';

-- 14. generate_contract_number
ALTER FUNCTION public.generate_contract_number() SET search_path TO 'public', 'pg_temp';

-- 15. generate_loan_number
ALTER FUNCTION public.generate_loan_number() SET search_path TO 'public', 'pg_temp';

-- 16. generate_maintenance_number
ALTER FUNCTION public.generate_maintenance_number() SET search_path TO 'public', 'pg_temp';

-- 17. generate_payment_number
ALTER FUNCTION public.generate_payment_number() SET search_path TO 'public', 'pg_temp';

-- 18. generate_payment_number_for_loan
ALTER FUNCTION public.generate_payment_number_for_loan() SET search_path TO 'public', 'pg_temp';

-- 19. generate_request_number
ALTER FUNCTION public.generate_request_number() SET search_path TO 'public', 'pg_temp';

-- 20. generate_ticket_number
ALTER FUNCTION public.generate_ticket_number() SET search_path TO 'public', 'pg_temp';

-- 21. generate_waqf_unit_code
ALTER FUNCTION public.generate_waqf_unit_code() SET search_path TO 'public', 'pg_temp';

-- 22. get_beneficiary_number
ALTER FUNCTION public.get_beneficiary_number(uuid) SET search_path TO 'public', 'pg_temp';

-- 23. log_audit_entry
ALTER FUNCTION public.log_audit_entry() SET search_path TO 'public', 'pg_temp';

-- 24. log_beneficiary_activity
ALTER FUNCTION public.log_beneficiary_activity() SET search_path TO 'public', 'pg_temp';

-- 25. log_login_attempt
ALTER FUNCTION public.log_login_attempt(text, text, boolean, text) SET search_path TO 'public', 'pg_temp';

-- 26. log_ticket_changes
ALTER FUNCTION public.log_ticket_changes() SET search_path TO 'public', 'pg_temp';

-- 27. payment_requires_approval
ALTER FUNCTION public.payment_requires_approval(numeric) SET search_path TO 'public', 'pg_temp';

-- 28. set_beneficiary_number
ALTER FUNCTION public.set_beneficiary_number() SET search_path TO 'public', 'pg_temp';

-- 29. update_account_balance
ALTER FUNCTION public.update_account_balance() SET search_path TO 'public', 'pg_temp';

-- 30. update_family_members_count
ALTER FUNCTION public.update_family_members_count() SET search_path TO 'public', 'pg_temp';

-- 31. update_payment_status
ALTER FUNCTION public.update_payment_status() SET search_path TO 'public', 'pg_temp';

-- 32. verify_2fa_code
ALTER FUNCTION public.verify_2fa_code(uuid, text) SET search_path TO 'public', 'pg_temp';

-- 33. الدوال المتبقية التي تحتاج تحديث
ALTER FUNCTION public.auto_escalate_overdue_tickets() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.calculate_disclosure_balances(uuid, date, date) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.check_overdue_requests() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.generate_annual_disclosure(integer, text) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.generate_smart_insights() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.notify_contract_expiring() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.notify_rental_payment_due() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.setup_demo_accounts() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_agent_stats_on_ticket_change() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_annual_disclosure_timestamp() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_beneficiary_last_activity() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_custom_reports_timestamp() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_decision_voting_results() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_loan_status() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_overdue_installments() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_property_units_count() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_system_settings_timestamp() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_ticket_response_count() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_tribes_updated_at() SET search_path TO 'public', 'pg_temp';
