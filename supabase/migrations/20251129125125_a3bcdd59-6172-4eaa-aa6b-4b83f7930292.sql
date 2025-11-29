-- ============================================
-- إصلاح شامل لسياسات RLS المتساهلة (نسخة مصححة)
-- ============================================

-- ===========================================
-- 1. الجداول المالية (الأولوية القصوى)
-- ===========================================

-- bank_statements
DROP POLICY IF EXISTS "Staff can update bank statements" ON bank_statements;
CREATE POLICY "financial_staff_update_bank_statements"
ON bank_statements FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- budgets
DROP POLICY IF EXISTS "Admins can manage budgets" ON budgets;
CREATE POLICY "financial_staff_manage_budgets"
ON budgets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- cash_flows
DROP POLICY IF EXISTS "Staff can update cash flows" ON cash_flows;
DROP POLICY IF EXISTS "Staff can manage cash flows" ON cash_flows;
CREATE POLICY "financial_staff_manage_cash_flows"
ON cash_flows FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- funds
DROP POLICY IF EXISTS "Staff can update funds" ON funds;
CREATE POLICY "financial_staff_update_funds"
ON funds FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- journal_entry_lines
DROP POLICY IF EXISTS "Staff can update journal entry lines" ON journal_entry_lines;
CREATE POLICY "accountants_update_journal_lines"
ON journal_entry_lines FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- loan_installments
DROP POLICY IF EXISTS "Staff can manage loan installments" ON loan_installments;
CREATE POLICY "financial_staff_manage_loan_installments"
ON loan_installments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- rental_payments
DROP POLICY IF EXISTS "Staff can update rental payments" ON rental_payments;
CREATE POLICY "financial_staff_update_rental_payments"
ON rental_payments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- ===========================================
-- 2. جداول إعدادات النظام
-- ===========================================

-- organization_settings
DROP POLICY IF EXISTS "Staff can update organization settings" ON organization_settings;
CREATE POLICY "admin_nazer_update_org_settings"
ON organization_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- dashboard_widgets (ربط عبر dashboard_id -> dashboards.created_by)
DROP POLICY IF EXISTS "Users can update their widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "Users can delete their widgets" ON dashboard_widgets;
CREATE POLICY "users_manage_own_widgets"
ON dashboard_widgets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dashboards d
    WHERE d.id = dashboard_widgets.dashboard_id
    AND d.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dashboards d
    WHERE d.id = dashboard_widgets.dashboard_id
    AND d.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- dashboards (created_by)
DROP POLICY IF EXISTS "Users can update dashboards" ON dashboards;
CREATE POLICY "users_update_own_dashboards"
ON dashboards FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- scheduled_reports (created_by)
DROP POLICY IF EXISTS "Staff can manage scheduled reports" ON scheduled_reports;
CREATE POLICY "users_manage_own_scheduled_reports"
ON scheduled_reports FOR ALL
TO authenticated
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- notification_rules
DROP POLICY IF EXISTS "Staff can manage notification rules" ON notification_rules;
CREATE POLICY "admin_manage_notification_rules"
ON notification_rules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- eligibility_criteria
DROP POLICY IF EXISTS "Staff can manage eligibility criteria" ON eligibility_criteria;
CREATE POLICY "admin_nazer_manage_eligibility"
ON eligibility_criteria FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- ===========================================
-- 3. جداول إدارة البيانات
-- ===========================================

-- beneficiary_tags
DROP POLICY IF EXISTS "Staff can manage beneficiary tags" ON beneficiary_tags;
CREATE POLICY "staff_manage_beneficiary_tags"
ON beneficiary_tags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
);

-- contract_units
DROP POLICY IF EXISTS "Staff can update contract units" ON contract_units;
DROP POLICY IF EXISTS "Staff can delete contract units" ON contract_units;
CREATE POLICY "staff_manage_contract_units"
ON contract_units FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- family_relationships
DROP POLICY IF EXISTS "Staff can manage family relationships" ON family_relationships;
CREATE POLICY "staff_manage_family_relationships"
ON family_relationships FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'archivist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'archivist')
  )
);

-- identity_verifications
DROP POLICY IF EXISTS "Staff can manage identity verifications" ON identity_verifications;
CREATE POLICY "staff_manage_identity_verifications"
ON identity_verifications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'archivist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'archivist')
  )
);

-- emergency_aid_requests
DROP POLICY IF EXISTS "Staff can update emergency aid requests" ON emergency_aid_requests;
DROP POLICY IF EXISTS "Staff can delete emergency aid requests" ON emergency_aid_requests;
CREATE POLICY "staff_manage_emergency_aid"
ON emergency_aid_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

CREATE POLICY "admin_delete_emergency_aid"
ON emergency_aid_requests FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- tasks (assigned_to, created_by)
DROP POLICY IF EXISTS "Staff can update tasks" ON tasks;
CREATE POLICY "users_manage_own_tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid() 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- saved_reports (user_id)
DROP POLICY IF EXISTS "Users can update their saved reports" ON saved_reports;
DROP POLICY IF EXISTS "Users can delete their saved reports" ON saved_reports;
CREATE POLICY "users_manage_own_saved_reports"
ON saved_reports FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- notification_logs (user_id)
DROP POLICY IF EXISTS "Staff can manage notification logs" ON notification_logs;
CREATE POLICY "users_read_own_notification_logs"
ON notification_logs FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

CREATE POLICY "system_insert_notification_logs"
ON notification_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- document_ocr_content
DROP POLICY IF EXISTS "Staff can manage document OCR content" ON document_ocr_content;
CREATE POLICY "staff_manage_ocr_content"
ON document_ocr_content FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'archivist')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'archivist')
  )
);

-- document_versions
DROP POLICY IF EXISTS "Staff can update document versions" ON document_versions;
CREATE POLICY "archivist_manage_document_versions"
ON document_versions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'archivist')
  )
);

-- knowledge_articles
DROP POLICY IF EXISTS "Staff can manage knowledge articles" ON knowledge_articles;
CREATE POLICY "admin_manage_knowledge_articles"
ON knowledge_articles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);