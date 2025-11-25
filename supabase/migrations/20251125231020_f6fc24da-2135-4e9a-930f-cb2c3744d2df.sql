-- =====================================================
-- المرحلة 2: عزل المستفيدين وتشديد RLS
-- =====================================================

-- 1️⃣ إنشاء دالة is_staff_only() للتمييز بين الموظفين والمستفيدين
CREATE OR REPLACE FUNCTION public.is_staff_only()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
$$;

-- 2️⃣ إصلاح سياسات approval_workflows
DROP POLICY IF EXISTS "Allow authenticated insert on approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "Allow authenticated select on approval_workflows" ON approval_workflows;
DROP POLICY IF EXISTS "Allow authenticated update on approval_workflows" ON approval_workflows;

CREATE POLICY "staff_can_read_approval_workflows"
ON approval_workflows FOR SELECT
USING (public.is_staff_only());

CREATE POLICY "admins_can_insert_approval_workflows"
ON approval_workflows FOR INSERT
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "admins_can_update_approval_workflows"
ON approval_workflows FOR UPDATE
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "admins_can_delete_approval_workflows"
ON approval_workflows FOR DELETE
USING (public.is_admin_or_nazer());

-- 3️⃣ إصلاح سياسات approval_steps
DROP POLICY IF EXISTS "Allow authenticated insert on approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "Allow authenticated select on approval_steps" ON approval_steps;
DROP POLICY IF EXISTS "Allow authenticated update on approval_steps" ON approval_steps;

CREATE POLICY "staff_can_read_approval_steps"
ON approval_steps FOR SELECT
USING (public.is_staff_only());

CREATE POLICY "admins_can_insert_approval_steps"
ON approval_steps FOR INSERT
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "admins_can_update_approval_steps"
ON approval_steps FOR UPDATE
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 4️⃣ إصلاح سياسات approval_status
DROP POLICY IF EXISTS "Allow authenticated insert on approval_status" ON approval_status;
DROP POLICY IF EXISTS "Allow authenticated select on approval_status" ON approval_status;
DROP POLICY IF EXISTS "Allow authenticated update on approval_status" ON approval_status;

CREATE POLICY "staff_can_read_approval_status"
ON approval_status FOR SELECT
USING (public.is_staff_only());

CREATE POLICY "admins_can_insert_approval_status"
ON approval_status FOR INSERT
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "admins_can_update_approval_status"
ON approval_status FOR UPDATE
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 5️⃣ إصلاح سياسات bank_matching_rules
DROP POLICY IF EXISTS "Allow authenticated select on bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "Allow authenticated insert on bank_matching_rules" ON bank_matching_rules;
DROP POLICY IF EXISTS "Allow authenticated update on bank_matching_rules" ON bank_matching_rules;

CREATE POLICY "financial_staff_can_read_bank_matching_rules"
ON bank_matching_rules FOR SELECT
USING (public.is_financial_staff());

CREATE POLICY "admins_can_insert_bank_matching_rules"
ON bank_matching_rules FOR INSERT
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "admins_can_update_bank_matching_rules"
ON bank_matching_rules FOR UPDATE
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 6️⃣ إصلاح سياسات bank_reconciliation_matches
DROP POLICY IF EXISTS "Allow authenticated select on bank_reconciliation_matches" ON bank_reconciliation_matches;
DROP POLICY IF EXISTS "Allow authenticated insert on bank_reconciliation_matches" ON bank_reconciliation_matches;
DROP POLICY IF EXISTS "Allow authenticated update on bank_reconciliation_matches" ON bank_reconciliation_matches;

CREATE POLICY "financial_staff_can_read_bank_reconciliation_matches"
ON bank_reconciliation_matches FOR SELECT
USING (public.is_financial_staff());

CREATE POLICY "financial_staff_can_insert_bank_reconciliation_matches"
ON bank_reconciliation_matches FOR INSERT
WITH CHECK (public.is_financial_staff());

CREATE POLICY "financial_staff_can_update_bank_reconciliation_matches"
ON bank_reconciliation_matches FOR UPDATE
USING (public.is_financial_staff())
WITH CHECK (public.is_financial_staff());

-- 7️⃣ إصلاح سياسات auto_journal_log
DROP POLICY IF EXISTS "Allow authenticated select on auto_journal_log" ON auto_journal_log;

CREATE POLICY "financial_staff_can_read_auto_journal_log"
ON auto_journal_log FOR SELECT
USING (public.is_financial_staff());

-- 8️⃣ إصلاح سياسات auto_journal_templates
DROP POLICY IF EXISTS "Allow authenticated select on auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "Allow authenticated insert on auto_journal_templates" ON auto_journal_templates;
DROP POLICY IF EXISTS "Allow authenticated update on auto_journal_templates" ON auto_journal_templates;

CREATE POLICY "financial_staff_can_read_auto_journal_templates"
ON auto_journal_templates FOR SELECT
USING (public.is_financial_staff());

CREATE POLICY "admins_can_insert_auto_journal_templates"
ON auto_journal_templates FOR INSERT
WITH CHECK (public.is_admin_or_nazer());

CREATE POLICY "admins_can_update_auto_journal_templates"
ON auto_journal_templates FOR UPDATE
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 9️⃣ إصلاح سياسات budgets
DROP POLICY IF EXISTS "Allow authenticated select on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow authenticated insert on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow authenticated update on budgets" ON budgets;

CREATE POLICY "staff_can_read_budgets"
ON budgets FOR SELECT
USING (public.is_staff_only());

CREATE POLICY "financial_staff_can_insert_budgets"
ON budgets FOR INSERT
WITH CHECK (public.is_financial_staff());

CREATE POLICY "financial_staff_can_update_budgets"
ON budgets FOR UPDATE
USING (public.is_financial_staff())
WITH CHECK (public.is_financial_staff());

-- 🔟 إصلاح سياسات bank_transactions
DROP POLICY IF EXISTS "Allow authenticated update on bank_transactions" ON bank_transactions;

CREATE POLICY "financial_staff_can_update_bank_transactions"
ON bank_transactions FOR UPDATE
USING (public.is_financial_staff())
WITH CHECK (public.is_financial_staff());