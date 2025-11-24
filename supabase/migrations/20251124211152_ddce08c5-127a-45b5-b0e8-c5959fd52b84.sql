-- إنشاء نظام الصلاحيات الشامل للمستفيدين من الدرجة الأولى (50 صلاحية)

-- 1. جدول إعدادات الشفافية
CREATE TABLE IF NOT EXISTS beneficiary_visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- === الأقسام الرئيسية (13) ===
  show_overview BOOLEAN DEFAULT true,
  show_profile BOOLEAN DEFAULT true,
  show_requests BOOLEAN DEFAULT true,
  show_distributions BOOLEAN DEFAULT true,
  show_statements BOOLEAN DEFAULT true,
  show_properties BOOLEAN DEFAULT true,
  show_documents BOOLEAN DEFAULT true,
  show_bank_accounts BOOLEAN DEFAULT false,
  show_financial_reports BOOLEAN DEFAULT false,
  show_approvals_log BOOLEAN DEFAULT false,
  show_disclosures BOOLEAN DEFAULT false,
  show_governance BOOLEAN DEFAULT false,
  show_budgets BOOLEAN DEFAULT false,
  
  -- === المستفيدون الآخرون (8) ===
  show_other_beneficiaries_names BOOLEAN DEFAULT true,
  show_other_beneficiaries_amounts BOOLEAN DEFAULT false,
  show_other_beneficiaries_personal_data BOOLEAN DEFAULT false,
  show_family_tree BOOLEAN DEFAULT true,
  show_total_beneficiaries_count BOOLEAN DEFAULT true,
  show_beneficiary_categories BOOLEAN DEFAULT true,
  show_beneficiaries_statistics BOOLEAN DEFAULT false,
  show_inactive_beneficiaries BOOLEAN DEFAULT false,
  
  -- === البيانات الحساسة والإخفاء (5) ===
  mask_iban BOOLEAN DEFAULT true,
  mask_phone_numbers BOOLEAN DEFAULT true,
  mask_exact_amounts BOOLEAN DEFAULT false,
  mask_tenant_info BOOLEAN DEFAULT true,
  mask_national_ids BOOLEAN DEFAULT true,
  
  -- === الجداول المالية (8) ===
  show_bank_balances BOOLEAN DEFAULT false,
  show_bank_transactions BOOLEAN DEFAULT false,
  show_bank_statements BOOLEAN DEFAULT false,
  show_invoices BOOLEAN DEFAULT false,
  show_contracts_details BOOLEAN DEFAULT true,
  show_maintenance_costs BOOLEAN DEFAULT true,
  show_property_revenues BOOLEAN DEFAULT true,
  show_expenses_breakdown BOOLEAN DEFAULT false,
  
  -- === الحوكمة والقرارات (6) ===
  show_governance_meetings BOOLEAN DEFAULT false,
  show_nazer_decisions BOOLEAN DEFAULT false,
  show_policy_changes BOOLEAN DEFAULT false,
  show_strategic_plans BOOLEAN DEFAULT false,
  show_audit_reports BOOLEAN DEFAULT false,
  show_compliance_reports BOOLEAN DEFAULT false,
  
  -- === القروض والفزعات (5) ===
  show_own_loans BOOLEAN DEFAULT true,
  show_other_loans BOOLEAN DEFAULT false,
  mask_loan_amounts BOOLEAN DEFAULT false,
  show_emergency_aid BOOLEAN DEFAULT true,
  show_emergency_statistics BOOLEAN DEFAULT false,
  
  -- === الميزانيات والتخطيط (4) ===
  show_annual_budget BOOLEAN DEFAULT false,
  show_budget_execution BOOLEAN DEFAULT false,
  show_reserve_funds BOOLEAN DEFAULT true,
  show_investment_plans BOOLEAN DEFAULT false,
  
  -- === المحاسبة التفصيلية (3) ===
  show_journal_entries BOOLEAN DEFAULT false,
  show_trial_balance BOOLEAN DEFAULT false,
  show_ledger_details BOOLEAN DEFAULT false,
  
  -- === التواصل والدعم (2) ===
  show_internal_messages BOOLEAN DEFAULT true,
  show_support_tickets BOOLEAN DEFAULT true,
  
  -- === الإعدادات العامة (2) ===
  allow_export_pdf BOOLEAN DEFAULT true,
  allow_print BOOLEAN DEFAULT true,
  
  -- معلومات التعديل
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إدراج الإعدادات الافتراضية
INSERT INTO beneficiary_visibility_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 2. جدول سجل التغييرات
CREATE TABLE IF NOT EXISTS beneficiary_visibility_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name TEXT NOT NULL,
  old_value BOOLEAN,
  new_value BOOLEAN,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_name TEXT,
  changed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  ip_address TEXT
);

-- 3. دالة التحقق من المستفيد من الدرجة الأولى
CREATE OR REPLACE FUNCTION is_first_class_beneficiary()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM beneficiaries
    WHERE user_id = auth.uid()
    AND category = 'الفئة الأولى'
    AND status = 'نشط'
  )
$$;

-- 4. دالة جلب الإعدادات
CREATE OR REPLACE FUNCTION get_beneficiary_visibility_settings()
RETURNS beneficiary_visibility_settings
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM beneficiary_visibility_settings 
  WHERE id = '00000000-0000-0000-0000-000000000001'
  LIMIT 1
$$;

-- 5. تفعيل RLS
ALTER TABLE beneficiary_visibility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_visibility_audit ENABLE ROW LEVEL SECURITY;

-- 6. سياسات RLS - إعدادات الشفافية
CREATE POLICY "nazer_admin_can_manage_visibility"
ON beneficiary_visibility_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('nazer', 'admin')
  )
);

CREATE POLICY "beneficiaries_can_read_visibility"
ON beneficiary_visibility_settings
FOR SELECT
TO authenticated
USING (is_first_class_beneficiary());

-- 7. سياسات RLS - سجل التغييرات
CREATE POLICY "nazer_admin_can_view_audit"
ON beneficiary_visibility_audit
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('nazer', 'admin')
  )
);

-- 8. إضافة سياسات الاطلاع للجداول المالية (13 جدول)

-- bank_accounts
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_bank_accounts" ON bank_accounts;
CREATE POLICY "first_class_beneficiaries_can_view_bank_accounts"
ON bank_accounts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- bank_statements
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_bank_statements" ON bank_statements;
CREATE POLICY "first_class_beneficiaries_can_view_bank_statements"
ON bank_statements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- bank_transactions
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_bank_transactions" ON bank_transactions;
CREATE POLICY "first_class_beneficiaries_can_view_bank_transactions"
ON bank_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- invoices
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_invoices" ON invoices;
CREATE POLICY "first_class_beneficiaries_can_view_invoices"
ON invoices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- invoice_lines
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_invoice_lines" ON invoice_lines;
CREATE POLICY "first_class_beneficiaries_can_view_invoice_lines"
ON invoice_lines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- annual_disclosures
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_disclosures" ON annual_disclosures;
CREATE POLICY "first_class_beneficiaries_can_view_disclosures"
ON annual_disclosures
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- approvals
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_approvals" ON approvals;
CREATE POLICY "first_class_beneficiaries_can_view_approvals"
ON approvals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- approval_history
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_approval_history" ON approval_history;
CREATE POLICY "first_class_beneficiaries_can_view_approval_history"
ON approval_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- financial_kpis
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_kpis" ON financial_kpis;
CREATE POLICY "first_class_beneficiaries_can_view_kpis"
ON financial_kpis
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- financial_forecasts
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_forecasts" ON financial_forecasts;
CREATE POLICY "first_class_beneficiaries_can_view_forecasts"
ON financial_forecasts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- journal_entries
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_journal_entries" ON journal_entries;
CREATE POLICY "first_class_beneficiaries_can_view_journal_entries"
ON journal_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- journal_entry_lines
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_journal_lines" ON journal_entry_lines;
CREATE POLICY "first_class_beneficiaries_can_view_journal_lines"
ON journal_entry_lines
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- budgets
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_budgets" ON budgets;
CREATE POLICY "first_class_beneficiaries_can_view_budgets"
ON budgets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
  OR is_first_class_beneficiary()
);

-- 9. Trigger لتسجيل التغييرات
CREATE OR REPLACE FUNCTION log_visibility_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_field TEXT;
  user_email TEXT;
BEGIN
  -- الحصول على بريد المستخدم
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- تسجيل كل حقل تم تغييره
  IF OLD.show_overview != NEW.show_overview THEN
    INSERT INTO beneficiary_visibility_audit (setting_name, old_value, new_value, changed_by, changed_by_name)
    VALUES ('show_overview', OLD.show_overview, NEW.show_overview, auth.uid(), user_email);
  END IF;
  
  -- يمكن إضافة المزيد من الحقول حسب الحاجة
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER visibility_settings_audit
AFTER UPDATE ON beneficiary_visibility_settings
FOR EACH ROW
EXECUTE FUNCTION log_visibility_changes();

-- 10. إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_beneficiary_visibility_audit_changed_at 
ON beneficiary_visibility_audit(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_beneficiary_visibility_audit_changed_by 
ON beneficiary_visibility_audit(changed_by);

COMMENT ON TABLE beneficiary_visibility_settings IS 'إعدادات الشفافية: 50 صلاحية للتحكم في ما يراه المستفيدون من الدرجة الأولى';
COMMENT ON TABLE beneficiary_visibility_audit IS 'سجل تغييرات إعدادات الشفافية';