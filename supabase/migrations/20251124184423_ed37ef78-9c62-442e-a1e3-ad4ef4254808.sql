-- ============================================
-- المرحلة الثالثة: المحاسبة المتكاملة - قاعدة البيانات
-- ============================================

-- ============================================
-- القسم 1: قوالب القيود التلقائية
-- ============================================

CREATE TABLE IF NOT EXISTS auto_journal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  description TEXT,
  debit_accounts JSONB NOT NULL,
  credit_accounts JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auto_journal_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES auto_journal_templates(id) ON DELETE SET NULL,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  trigger_event TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  amount NUMERIC NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB
);

-- ============================================
-- القسم 2: نظام الموافقات المتقدم
-- ============================================

CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  approval_levels JSONB NOT NULL,
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  current_level INTEGER DEFAULT 1,
  total_levels INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_status_id UUID REFERENCES approval_status(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  approver_id UUID,
  approver_role TEXT NOT NULL,
  approver_name TEXT,
  action TEXT,
  notes TEXT,
  actioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- القسم 3: التسوية البنكية المتقدمة
-- ============================================

CREATE TABLE IF NOT EXISTS bank_matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  account_mapping JSONB NOT NULL,
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  match_count INTEGER DEFAULT 0,
  last_matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  matching_rule_id UUID REFERENCES bank_matching_rules(id) ON DELETE SET NULL,
  matched_by UUID,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ============================================
-- القسم 4: الفوترة الإلكترونية ZATCA
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'simplified';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_qr_data TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_hash TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_zatca_compliant BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_submitted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_status TEXT;

CREATE TABLE IF NOT EXISTS zatca_submission_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- القسم 5: التحليلات المالية
-- ============================================

CREATE TABLE IF NOT EXISTS financial_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name TEXT NOT NULL,
  kpi_category TEXT NOT NULL,
  kpi_value NUMERIC NOT NULL,
  kpi_target NUMERIC,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  fiscal_year_id UUID REFERENCES fiscal_years(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_type TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  forecasted_amount NUMERIC NOT NULL,
  actual_amount NUMERIC,
  variance NUMERIC,
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 1),
  model_used TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_name TEXT NOT NULL,
  layout_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- الفهارس
-- ============================================

CREATE INDEX IF NOT EXISTS idx_auto_journal_templates_event ON auto_journal_templates(trigger_event);
CREATE INDEX IF NOT EXISTS idx_auto_journal_log_template ON auto_journal_log(template_id);
CREATE INDEX IF NOT EXISTS idx_auto_journal_log_executed ON auto_journal_log(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_entity ON approval_workflows(entity_type);
CREATE INDEX IF NOT EXISTS idx_approval_status_entity ON approval_status(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_bank_matching_rules_priority ON bank_matching_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliation_matches_transaction ON bank_reconciliation_matches(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_financial_kpis_period ON financial_kpis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_period ON financial_forecasts(period_start, period_end);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE auto_journal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_journal_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE zatca_submission_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON auto_journal_templates FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON auto_journal_log FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON approval_workflows FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON approval_status FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON approval_steps FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON bank_matching_rules FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON bank_reconciliation_matches FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON zatca_submission_log FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON financial_kpis FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON financial_forecasts FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON dashboard_configs FOR ALL USING (true);

-- ============================================
-- البيانات الأولية
-- ============================================

INSERT INTO auto_journal_templates (trigger_event, template_name, description, debit_accounts, credit_accounts) VALUES
('payment_made', 'دفع مستحقات مستفيد', 'قيد تلقائي عند دفع مستحقات المستفيدين', 
 '[{"account_code": "2101", "percentage": 100}]'::jsonb, 
 '[{"account_code": "1101", "percentage": 100}]'::jsonb),
('rental_received', 'استلام إيجار عقار', 'قيد تلقائي عند استلام إيجار من العقارات',
 '[{"account_code": "1101", "percentage": 100}]'::jsonb,
 '[{"account_code": "4101", "percentage": 100}]'::jsonb),
('distribution_approved', 'توزيع غلة الوقف', 'قيد تلقائي عند الموافقة على توزيع الغلة',
 '[{"account_code": "5101", "percentage": 100}]'::jsonb,
 '[{"account_code": "2101", "percentage": 100}]'::jsonb),
('loan_disbursed', 'صرف قرض', 'قيد تلقائي عند صرف قرض لمستفيد',
 '[{"account_code": "1301", "percentage": 100}]'::jsonb,
 '[{"account_code": "1101", "percentage": 100}]'::jsonb),
('loan_payment', 'سداد قسط قرض', 'قيد تلقائي عند سداد قسط من القرض',
 '[{"account_code": "1101", "percentage": 100}]'::jsonb,
 '[{"account_code": "1301", "percentage": 100}]'::jsonb),
('maintenance_paid', 'دفع صيانة', 'قيد تلقائي عند دفع تكاليف الصيانة',
 '[{"account_code": "5201", "percentage": 100}]'::jsonb,
 '[{"account_code": "1101", "percentage": 100}]'::jsonb)
ON CONFLICT (trigger_event) DO NOTHING;

INSERT INTO approval_workflows (workflow_name, entity_type, approval_levels, conditions) VALUES
('موافقة القيود العادية', 'journal_entry', 
 '[{"level": 1, "role": "accountant", "required": false}, {"level": 2, "role": "nazer", "required": true}]'::jsonb,
 '{"max_amount": 10000}'::jsonb),
('موافقة القيود الكبيرة', 'journal_entry',
 '[{"level": 1, "role": "accountant", "required": true}, {"level": 2, "role": "manager", "required": true}, {"level": 3, "role": "nazer", "required": true}]'::jsonb,
 '{"min_amount": 10000}'::jsonb),
('موافقة التوزيعات', 'distribution',
 '[{"level": 1, "role": "accountant", "required": true}, {"level": 2, "role": "manager", "required": true}, {"level": 3, "role": "nazer", "required": true}]'::jsonb,
 '{}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO bank_matching_rules (rule_name, description, conditions, account_mapping, priority) VALUES
('مطابقة دقيقة', 'مطابقة بالمبلغ والتاريخ المتطابقين',
 '{"amount_tolerance": 0, "date_range_days": 3}'::jsonb,
 '{"debit_account": "1101", "credit_account": "auto"}'::jsonb, 100),
('مطابقة بهامش 1%', 'مطابقة بهامش 1% في المبلغ',
 '{"amount_tolerance": 0.01, "date_range_days": 7}'::jsonb,
 '{"debit_account": "1101", "credit_account": "auto"}'::jsonb, 80)
ON CONFLICT DO NOTHING;