
-- ======================================
-- المرحلة الثالثة: نظام الموافقات التلقائية (مبسط)
-- ======================================

-- 1. إنشاء الجداول المطلوبة بشكل صحيح
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_name TEXT NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name TEXT NOT NULL,
  kpi_code TEXT UNIQUE NOT NULL,
  description TEXT,
  calculation_formula TEXT NOT NULL,
  data_source TEXT NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  chart_type TEXT,
  is_active BOOLEAN DEFAULT true,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. تحديث جدول الموافقات
ALTER TABLE distribution_approvals 
ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- 3. إدراج مؤشرات الأداء
INSERT INTO kpi_definitions (kpi_name, kpi_code, description, calculation_formula, data_source, target_value, unit, chart_type, category) VALUES
  ('إجمالي التوزيعات', 'total_distributions', 'عدد التوزيعات المعتمدة', 'COUNT(*)', 'distributions', 100, 'توزيع', 'number', 'financial'),
  ('إجمالي المستفيدين', 'total_beneficiaries', 'عدد المستفيدين النشطين', 'COUNT(*)', 'beneficiaries', 500, 'مستفيد', 'number', 'beneficiaries'),
  ('معدل الموافقة', 'approval_rate', 'نسبة التوزيعات المعتمدة', 'percentage', 'distributions', 90, '%', 'gauge', 'operations')
ON CONFLICT (kpi_code) DO NOTHING;

-- 4. دالة بسيطة لإنشاء موافقات تلقائية
CREATE OR REPLACE FUNCTION auto_create_distribution_approvals()
RETURNS TRIGGER AS $$
BEGIN
  -- مستوى 1: محاسب
  INSERT INTO distribution_approvals (
    distribution_id,
    approval_level,
    approver_role,
    status
  ) VALUES (
    NEW.id,
    1,
    'accountant',
    'pending'
  );

  -- مستوى 2: مدير  
  INSERT INTO distribution_approvals (
    distribution_id,
    approval_level,
    approver_role,
    status
  ) VALUES (
    NEW.id,
    2,
    'admin',
    'pending'
  );

  -- مستوى 3: ناظر
  INSERT INTO distribution_approvals (
    distribution_id,
    approval_level,
    approver_role,
    status
  ) VALUES (
    NEW.id,
    3,
    'nazer',
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Trigger للموافقات التلقائية
DROP TRIGGER IF EXISTS trigger_auto_create_approvals ON distributions;
CREATE TRIGGER trigger_auto_create_approvals
  AFTER INSERT ON distributions
  FOR EACH ROW
  WHEN (NEW.status = 'قيد الإعتماد' OR NEW.status = 'pending')
  EXECUTE FUNCTION auto_create_distribution_approvals();

-- 6. Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_distribution_approvals_dist ON distribution_approvals(distribution_id, status);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_code ON kpi_definitions(kpi_code) WHERE is_active = true;
