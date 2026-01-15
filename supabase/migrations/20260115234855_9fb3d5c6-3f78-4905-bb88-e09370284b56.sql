-- حذف سياسات RLS المكررة (الاحتفاظ بالأولى من كل مجموعة)

-- sensitive_data_access_log - الاحتفاظ بـ auth_insert_access_log
DROP POLICY IF EXISTS "authenticated_insert_access_logs" ON public.sensitive_data_access_log;
DROP POLICY IF EXISTS "user_insert_own_sensitive_data_access_log" ON public.sensitive_data_access_log;

-- saved_reports - الاحتفاظ بـ user_insert_reports
DROP POLICY IF EXISTS "users_insert_own_reports" ON public.saved_reports;
DROP POLICY IF EXISTS "owner_insert_saved_reports" ON public.saved_reports;

-- system_alerts - الاحتفاظ بـ service_insert_alerts
DROP POLICY IF EXISTS "staff_insert_alerts" ON public.system_alerts;
DROP POLICY IF EXISTS "staff_insert_system_alerts" ON public.system_alerts;

-- system_error_logs - الاحتفاظ بـ service_insert_errors
DROP POLICY IF EXISTS "auth_insert_own_errors" ON public.system_error_logs;
DROP POLICY IF EXISTS "user_insert_own_system_error_logs" ON public.system_error_logs;

-- system_health_checks - الاحتفاظ بـ service_insert_health
DROP POLICY IF EXISTS "staff_insert_health" ON public.system_health_checks;
DROP POLICY IF EXISTS "staff_insert_system_health_checks" ON public.system_health_checks;

-- user_roles_audit - الاحتفاظ بـ admin_insert_audit
DROP POLICY IF EXISTS "system_insert_roles_audit" ON public.user_roles_audit;
DROP POLICY IF EXISTS "trigger_only_insert_user_roles_audit" ON public.user_roles_audit;

-- payment_reminders - الاحتفاظ بـ finance_staff_create_reminders
DROP POLICY IF EXISTS "service_create_reminders" ON public.payment_reminders;

-- pos_transactions - الاحتفاظ بـ cashier_insert_pos_transactions
DROP POLICY IF EXISTS "pos_transactions_insert_optimized" ON public.pos_transactions;

-- report_execution_log - الاحتفاظ بـ staff_insert_execution_log
DROP POLICY IF EXISTS "staff_insert_report_log" ON public.report_execution_log;

-- backup_logs - الاحتفاظ بـ admin_select_backup_logs
DROP POLICY IF EXISTS "admin_view_backup_logs" ON public.backup_logs;

-- request_comments - الاحتفاظ بـ user_insert_comments
DROP POLICY IF EXISTS "users_insert_own_comments" ON public.request_comments;

-- search_history - الاحتفاظ بـ Users can add to search history
DROP POLICY IF EXISTS "Users can insert their own search history" ON public.search_history;

-- support_messages - الاحتفاظ بـ users_create_own_messages
DROP POLICY IF EXISTS "Authenticated users can create support messages" ON public.support_messages;

-- request_attachments - الاحتفاظ بـ user_insert_attachments
DROP POLICY IF EXISTS "users_insert_own_attachments" ON public.request_attachments;

-- cashier_shifts - الاحتفاظ بـ cashier_shifts_insert_optimized
DROP POLICY IF EXISTS "cashier_insert_cashier_shifts" ON public.cashier_shifts;

-- eligibility_assessments - الاحتفاظ بـ staff_insert_assessments
DROP POLICY IF EXISTS "staff_insert_eligibility_assessments" ON public.eligibility_assessments;

-- kpi_values - الاحتفاظ بـ staff_insert_kpi
DROP POLICY IF EXISTS "staff_insert_kpi_values" ON public.kpi_values;

-- notification_logs - الاحتفاظ بـ staff_insert_notif_logs
DROP POLICY IF EXISTS "staff_insert_notification_logs" ON public.notification_logs;

-- notifications - الاحتفاظ بـ system_notifications
DROP POLICY IF EXISTS "system_create_notifications" ON public.notifications;