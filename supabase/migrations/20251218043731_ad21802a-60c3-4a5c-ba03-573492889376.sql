-- =====================================================
-- الدفعة 2: تحديث سياسات جداول البنوك والمحاسبة
-- =====================================================

-- 1. auto_journal_log - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view auto journal log" ON public.auto_journal_log;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض سجل القيود التلقائية" ON public.auto_journal_log;

CREATE POLICY "staff_select_auto_journal_log" ON public.auto_journal_log
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_auto_journal_log" ON public.auto_journal_log
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_auto_journal_log" ON public.auto_journal_log
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_auto_journal_log" ON public.auto_journal_log
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 2. auto_journal_templates - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view auto journal templates" ON public.auto_journal_templates;
DROP POLICY IF EXISTS "Admin can manage auto journal templates" ON public.auto_journal_templates;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض قوالب القيود التلقائية" ON public.auto_journal_templates;

CREATE POLICY "staff_select_auto_journal_templates" ON public.auto_journal_templates
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "admin_insert_auto_journal_templates" ON public.auto_journal_templates
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_auto_journal_templates" ON public.auto_journal_templates
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_auto_journal_templates" ON public.auto_journal_templates
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 3. backup_logs - تحديث السياسات
DROP POLICY IF EXISTS "Admin can view backup logs" ON public.backup_logs;
DROP POLICY IF EXISTS "المسؤولون يمكنهم عرض سجلات النسخ الاحتياطي" ON public.backup_logs;

CREATE POLICY "admin_select_backup_logs" ON public.backup_logs
FOR SELECT TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_insert_backup_logs" ON public.backup_logs
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_backup_logs" ON public.backup_logs
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_backup_logs" ON public.backup_logs
FOR DELETE TO authenticated USING (is_admin());

-- 4. backup_schedules - تحديث السياسات
DROP POLICY IF EXISTS "Admin can manage backup schedules" ON public.backup_schedules;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إدارة جداول النسخ الاحتياطي" ON public.backup_schedules;

CREATE POLICY "admin_select_backup_schedules" ON public.backup_schedules
FOR SELECT TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_insert_backup_schedules" ON public.backup_schedules
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_backup_schedules" ON public.backup_schedules
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_backup_schedules" ON public.backup_schedules
FOR DELETE TO authenticated USING (is_admin());

-- 5. bank_integrations - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view bank integrations" ON public.bank_integrations;
DROP POLICY IF EXISTS "Admin can manage bank integrations" ON public.bank_integrations;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض تكاملات البنوك" ON public.bank_integrations;

CREATE POLICY "staff_select_bank_integrations" ON public.bank_integrations
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "admin_insert_bank_integrations" ON public.bank_integrations
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_bank_integrations" ON public.bank_integrations
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_bank_integrations" ON public.bank_integrations
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 6. bank_matching_rules - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view bank matching rules" ON public.bank_matching_rules;
DROP POLICY IF EXISTS "Admin can manage bank matching rules" ON public.bank_matching_rules;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض قواعد مطابقة البنوك" ON public.bank_matching_rules;

CREATE POLICY "staff_select_bank_matching_rules" ON public.bank_matching_rules
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "admin_insert_bank_matching_rules" ON public.bank_matching_rules
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_bank_matching_rules" ON public.bank_matching_rules
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_bank_matching_rules" ON public.bank_matching_rules
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 7. bank_reconciliation_matches - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view bank reconciliation matches" ON public.bank_reconciliation_matches;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض مطابقات البنوك" ON public.bank_reconciliation_matches;

CREATE POLICY "staff_select_bank_reconciliation_matches" ON public.bank_reconciliation_matches
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_insert_bank_reconciliation_matches" ON public.bank_reconciliation_matches
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "staff_update_bank_reconciliation_matches" ON public.bank_reconciliation_matches
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_delete_bank_reconciliation_matches" ON public.bank_reconciliation_matches
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 8. bank_statements - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view bank statements" ON public.bank_statements;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض كشوف البنوك" ON public.bank_statements;

CREATE POLICY "staff_select_bank_statements" ON public.bank_statements
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_insert_bank_statements" ON public.bank_statements
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "staff_update_bank_statements" ON public.bank_statements
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_delete_bank_statements" ON public.bank_statements
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 9. bank_transfer_files - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view bank transfer files" ON public.bank_transfer_files;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض ملفات التحويلات البنكية" ON public.bank_transfer_files;

CREATE POLICY "staff_select_bank_transfer_files" ON public.bank_transfer_files
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_insert_bank_transfer_files" ON public.bank_transfer_files
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "staff_update_bank_transfer_files" ON public.bank_transfer_files
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_delete_bank_transfer_files" ON public.bank_transfer_files
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 10. bank_transfer_details - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view bank transfer details" ON public.bank_transfer_details;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض تفاصيل التحويلات" ON public.bank_transfer_details;

CREATE POLICY "staff_select_bank_transfer_details" ON public.bank_transfer_details
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_insert_bank_transfer_details" ON public.bank_transfer_details
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "staff_update_bank_transfer_details" ON public.bank_transfer_details
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "staff_delete_bank_transfer_details" ON public.bank_transfer_details
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 11. cashier_shifts - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view cashier shifts" ON public.cashier_shifts;
DROP POLICY IF EXISTS "Cashier can manage own shifts" ON public.cashier_shifts;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض نوبات الصندوق" ON public.cashier_shifts;

CREATE POLICY "staff_select_cashier_shifts" ON public.cashier_shifts
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "cashier_insert_cashier_shifts" ON public.cashier_shifts
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "cashier_update_cashier_shifts" ON public.cashier_shifts
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "admin_delete_cashier_shifts" ON public.cashier_shifts
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 12. pos_transactions - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view POS transactions" ON public.pos_transactions;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض معاملات نقاط البيع" ON public.pos_transactions;

CREATE POLICY "staff_select_pos_transactions" ON public.pos_transactions
FOR SELECT TO authenticated USING (is_financial_staff());

CREATE POLICY "cashier_insert_pos_transactions" ON public.pos_transactions
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "cashier_update_pos_transactions" ON public.pos_transactions
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "admin_delete_pos_transactions" ON public.pos_transactions
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 13. opening_balances - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view opening balances" ON public.opening_balances;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض الأرصدة الافتتاحية" ON public.opening_balances;

CREATE POLICY "staff_select_opening_balances" ON public.opening_balances
FOR SELECT TO authenticated USING (has_full_read_access());

CREATE POLICY "accountant_insert_opening_balances" ON public.opening_balances
FOR INSERT TO authenticated WITH CHECK (is_financial_staff());

CREATE POLICY "accountant_update_opening_balances" ON public.opening_balances
FOR UPDATE TO authenticated USING (is_financial_staff());

CREATE POLICY "admin_delete_opening_balances" ON public.opening_balances
FOR DELETE TO authenticated USING (is_admin_or_nazer());