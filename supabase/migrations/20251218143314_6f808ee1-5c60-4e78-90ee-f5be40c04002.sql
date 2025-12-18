
-- المرحلة 1: تحديث السياسات لاستخدام الدوال المحسنة
-- الدفعة 1: سياسات auto_journal_log, cashier_shifts, pos_transactions
-- ================================================

-- حذف السياسة القديمة وإنشاء جديدة لـ auto_journal_log
DROP POLICY IF EXISTS "system_insert_journal_log" ON auto_journal_log;
CREATE POLICY "auto_journal_log_insert_optimized" ON auto_journal_log
FOR INSERT TO authenticated
WITH CHECK (can_manage_data());

-- حذف السياسة القديمة وإنشاء جديدة لـ cashier_shifts
DROP POLICY IF EXISTS "pos_shifts_insert" ON cashier_shifts;
CREATE POLICY "cashier_shifts_insert_optimized" ON cashier_shifts
FOR INSERT TO authenticated
WITH CHECK (is_pos_user());

-- حذف السياسة القديمة وإنشاء جديدة لـ pos_transactions
DROP POLICY IF EXISTS "pos_trans_insert" ON pos_transactions;
CREATE POLICY "pos_transactions_insert_optimized" ON pos_transactions
FOR INSERT TO authenticated
WITH CHECK (is_pos_user());

-- تحديث سياسات disclosure_beneficiaries
DROP POLICY IF EXISTS "الناظر والمشرف يمكنهم إضافة مستفي" ON disclosure_beneficiaries;
CREATE POLICY "disclosure_beneficiaries_insert_optimized" ON disclosure_beneficiaries
FOR INSERT TO authenticated
WITH CHECK (can_manage_data());

-- تحديث سياسات payment_schedules
DROP POLICY IF EXISTS "الأدوار المالية يمكنها قراءة جدول" ON payment_schedules;
DROP POLICY IF EXISTS "المحاسبون يمكنهم تحديث جدولة المد" ON payment_schedules;
DROP POLICY IF EXISTS "المحاسبون يمكنهم إضافة جدولة المد" ON payment_schedules;

CREATE POLICY "payment_schedules_select_optimized" ON payment_schedules
FOR SELECT TO authenticated
USING (is_financial_staff());

CREATE POLICY "payment_schedules_update_optimized" ON payment_schedules
FOR UPDATE TO authenticated
USING (is_pos_user());

CREATE POLICY "payment_schedules_insert_optimized" ON payment_schedules
FOR INSERT TO authenticated
WITH CHECK (is_admin_or_nazer() OR is_accountant());
