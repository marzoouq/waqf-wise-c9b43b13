-- =====================================================
-- إصلاح سياسات RLS المتساهلة - تقرير الأمان
-- =====================================================

-- 1. جداول الموافقات
-- =====================================================

DROP POLICY IF EXISTS "Enable all for authenticated users" ON approval_workflows;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON approval_steps;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON approval_status;

-- القراءة للمصادق عليهم
CREATE POLICY "authenticated_read_workflows"
ON approval_workflows FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_read_steps"
ON approval_steps FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_read_status"
ON approval_status FOR SELECT
TO authenticated
USING (true);

-- الإدارة للناظر والمشرف
CREATE POLICY "admin_nazer_manage_workflows"
ON approval_workflows FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
);

CREATE POLICY "admin_nazer_manage_steps"
ON approval_steps FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "admin_nazer_manage_status"
ON approval_status FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

-- 2. جداول البيانات المالية
-- =====================================================

DROP POLICY IF EXISTS "Enable all for authenticated users" ON auto_journal_templates;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON auto_journal_log;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON bank_matching_rules;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON bank_reconciliation_matches;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON financial_forecasts;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON financial_kpis;

-- auto_journal_templates
CREATE POLICY "financial_staff_read_journal_templates"
ON auto_journal_templates FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier'))
);

CREATE POLICY "admin_manage_journal_templates"
ON auto_journal_templates FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
);

-- auto_journal_log
CREATE POLICY "financial_staff_read_journal_log"
ON auto_journal_log FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier'))
);

CREATE POLICY "system_insert_journal_log"
ON auto_journal_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

-- bank_matching_rules
CREATE POLICY "accountants_read_matching_rules"
ON bank_matching_rules FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "admin_manage_matching_rules"
ON bank_matching_rules FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
);

-- bank_reconciliation_matches
CREATE POLICY "accountants_read_reconciliation_matches"
ON bank_reconciliation_matches FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "accountants_manage_reconciliation_matches"
ON bank_reconciliation_matches FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

-- financial_forecasts
CREATE POLICY "financial_staff_read_forecasts"
ON financial_forecasts FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "admin_manage_forecasts"
ON financial_forecasts FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
);

-- financial_kpis
CREATE POLICY "financial_staff_read_kpis"
ON financial_kpis FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "admin_manage_kpis"
ON financial_kpis FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
);

-- 3. جداول الإعدادات
-- =====================================================

DROP POLICY IF EXISTS "Enable all for authenticated users" ON dashboard_configs;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON zatca_submission_log;

-- dashboard_configs - كل مستخدم يرى إعداداته فقط (created_by)
CREATE POLICY "users_own_dashboard_configs"
ON dashboard_configs FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- سياسة للإعدادات المشتركة
CREATE POLICY "read_shared_dashboard_configs"
ON dashboard_configs FOR SELECT
TO authenticated
USING (is_shared = true);

-- zatca_submission_log
CREATE POLICY "accountants_read_zatca_log"
ON zatca_submission_log FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "accountants_manage_zatca_log"
ON zatca_submission_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer', 'accountant'))
);

CREATE POLICY "admin_update_zatca_log"
ON zatca_submission_log FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'nazer'))
);