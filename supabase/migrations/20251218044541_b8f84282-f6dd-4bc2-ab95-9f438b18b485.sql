-- إكمال تحديث السياسات المتبقية (تجاوز الجداول غير الموجودة)

-- file_retention_policies
DROP POLICY IF EXISTS "admin_manage_file_retention" ON file_retention_policies;
CREATE POLICY "admin_manage_file_retention" ON file_retention_policies FOR ALL USING (is_admin_or_nazer());

-- fiscal_year_closings
DROP POLICY IF EXISTS "admin_manage_fiscal_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "heirs_read_fiscal_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "admin_nazer_manage_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "heirs_view_fiscal_closings" ON fiscal_year_closings;
CREATE POLICY "admin_manage_fiscal_closings" ON fiscal_year_closings FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "heirs_read_fiscal_closings" ON fiscal_year_closings FOR SELECT USING (has_full_read_access());

-- heir_distributions
DROP POLICY IF EXISTS "admin_manage_heir_distributions" ON heir_distributions;
DROP POLICY IF EXISTS "heirs_read_heir_distributions" ON heir_distributions;
DROP POLICY IF EXISTS "admin_nazer_manage_heir_distributions" ON heir_distributions;
DROP POLICY IF EXISTS "heirs_view_own_heir_distributions" ON heir_distributions;
CREATE POLICY "admin_manage_heir_distributions" ON heir_distributions FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "heirs_read_heir_distributions" ON heir_distributions FOR SELECT USING (has_full_read_access());

-- historical_invoices
DROP POLICY IF EXISTS "admin_manage_historical_invoices" ON historical_invoices;
DROP POLICY IF EXISTS "heirs_read_historical_invoices" ON historical_invoices;
DROP POLICY IF EXISTS "admin_nazer_manage_historical_invoices" ON historical_invoices;
DROP POLICY IF EXISTS "heirs_view_historical_invoices" ON historical_invoices;
CREATE POLICY "admin_manage_historical_invoices" ON historical_invoices FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "heirs_read_historical_invoices" ON historical_invoices FOR SELECT USING (has_full_read_access());

-- loan_approvals
DROP POLICY IF EXISTS "admin_manage_loan_approvals" ON loan_approvals;
DROP POLICY IF EXISTS "staff_read_loan_approvals" ON loan_approvals;
DROP POLICY IF EXISTS "admin_nazer_manage_loan_approvals" ON loan_approvals;
DROP POLICY IF EXISTS "accountant_view_loan_approvals" ON loan_approvals;
CREATE POLICY "admin_manage_loan_approvals" ON loan_approvals FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "staff_read_loan_approvals" ON loan_approvals FOR SELECT USING (is_financial_staff());

-- loan_installments
DROP POLICY IF EXISTS "staff_manage_loan_installments" ON loan_installments;
CREATE POLICY "staff_manage_loan_installments" ON loan_installments FOR ALL USING (has_staff_access());

-- loan_payments
DROP POLICY IF EXISTS "staff_manage_loan_payments" ON loan_payments;
CREATE POLICY "staff_manage_loan_payments" ON loan_payments FOR ALL USING (has_staff_access());

-- payment_approvals
DROP POLICY IF EXISTS "admin_manage_payment_approvals" ON payment_approvals;
DROP POLICY IF EXISTS "staff_read_payment_approvals" ON payment_approvals;
DROP POLICY IF EXISTS "admin_nazer_manage_payment_approvals" ON payment_approvals;
DROP POLICY IF EXISTS "accountant_view_payment_approvals" ON payment_approvals;
CREATE POLICY "admin_manage_payment_approvals" ON payment_approvals FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "staff_read_payment_approvals" ON payment_approvals FOR SELECT USING (is_financial_staff());

-- pos_transactions
DROP POLICY IF EXISTS "staff_manage_pos_transactions" ON pos_transactions;
DROP POLICY IF EXISTS "cashier_manage_pos_transactions" ON pos_transactions;
DROP POLICY IF EXISTS "admin_view_all_pos_transactions" ON pos_transactions;
CREATE POLICY "staff_manage_pos_transactions" ON pos_transactions FOR ALL USING (has_staff_access());

-- profiles
DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
CREATE POLICY "admin_manage_profiles" ON profiles FOR ALL USING (is_admin());

-- request_types
DROP POLICY IF EXISTS "admin_manage_request_types" ON request_types;
DROP POLICY IF EXISTS "staff_read_request_types" ON request_types;
CREATE POLICY "admin_manage_request_types" ON request_types FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "staff_read_request_types" ON request_types FOR SELECT USING (has_staff_access());

-- request_workflows
DROP POLICY IF EXISTS "admin_manage_request_workflows" ON request_workflows;
DROP POLICY IF EXISTS "staff_read_request_workflows" ON request_workflows;
CREATE POLICY "admin_manage_request_workflows" ON request_workflows FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "staff_read_request_workflows" ON request_workflows FOR SELECT USING (has_staff_access());

-- support_agent_availability
DROP POLICY IF EXISTS "admin_manage_agent_availability" ON support_agent_availability;
CREATE POLICY "admin_manage_agent_availability" ON support_agent_availability FOR ALL USING (is_admin_or_nazer());

-- support_agent_stats
DROP POLICY IF EXISTS "admin_manage_agent_stats" ON support_agent_stats;
CREATE POLICY "admin_manage_agent_stats" ON support_agent_stats FOR ALL USING (is_admin_or_nazer());

-- support_assignment_settings
DROP POLICY IF EXISTS "admin_manage_assignment_settings" ON support_assignment_settings;
CREATE POLICY "admin_manage_assignment_settings" ON support_assignment_settings FOR ALL USING (is_admin_or_nazer());

-- support_ticket_comments
DROP POLICY IF EXISTS "staff_manage_ticket_comments" ON support_ticket_comments;
DROP POLICY IF EXISTS "staff_read_ticket_comments" ON support_ticket_comments;
CREATE POLICY "staff_manage_ticket_comments" ON support_ticket_comments FOR ALL USING (has_staff_access());

-- support_ticket_history
DROP POLICY IF EXISTS "staff_read_ticket_history" ON support_ticket_history;
CREATE POLICY "staff_read_ticket_history" ON support_ticket_history FOR SELECT USING (has_staff_access());

-- support_tickets
DROP POLICY IF EXISTS "staff_manage_support_tickets" ON support_tickets;
DROP POLICY IF EXISTS "admin_manage_all_tickets" ON support_tickets;
DROP POLICY IF EXISTS "staff_read_all_tickets" ON support_tickets;
CREATE POLICY "staff_manage_support_tickets" ON support_tickets FOR ALL USING (has_staff_access());

-- system_error_logs
DROP POLICY IF EXISTS "admin_manage_error_logs" ON system_error_logs;
CREATE POLICY "admin_manage_error_logs" ON system_error_logs FOR ALL USING (is_admin_or_nazer());

-- system_health_checks
DROP POLICY IF EXISTS "admin_manage_health_checks" ON system_health_checks;
CREATE POLICY "admin_manage_health_checks" ON system_health_checks FOR ALL USING (is_admin_or_nazer());

-- tenant_ledger
DROP POLICY IF EXISTS "staff_manage_tenant_ledger" ON tenant_ledger;
CREATE POLICY "staff_manage_tenant_ledger" ON tenant_ledger FOR ALL USING (has_staff_access());

-- waqf_distribution_settings
DROP POLICY IF EXISTS "admin_manage_waqf_settings" ON waqf_distribution_settings;
DROP POLICY IF EXISTS "heirs_read_waqf_settings" ON waqf_distribution_settings;
CREATE POLICY "admin_manage_waqf_settings" ON waqf_distribution_settings FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "heirs_read_waqf_settings" ON waqf_distribution_settings FOR SELECT USING (has_full_read_access());

-- user_permissions
DROP POLICY IF EXISTS "admin_manage_user_permissions" ON user_permissions;
DROP POLICY IF EXISTS "users_read_own_permissions" ON user_permissions;
CREATE POLICY "admin_manage_user_permissions" ON user_permissions FOR ALL USING (is_admin());
CREATE POLICY "users_read_own_permissions" ON user_permissions FOR SELECT USING (auth.uid() = user_id);

-- user_roles - تحديث بحذر
DROP POLICY IF EXISTS "admin_manage_user_roles" ON user_roles;
DROP POLICY IF EXISTS "users_read_own_role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "admin_manage_user_roles" ON user_roles FOR ALL USING (is_admin());
CREATE POLICY "users_read_own_role" ON user_roles FOR SELECT USING (auth.uid() = user_id);