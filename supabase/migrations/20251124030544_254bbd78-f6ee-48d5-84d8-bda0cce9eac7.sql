
-- إضافة الأعمدة الناقصة
ALTER TABLE custom_dashboards ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE distribution_approvals ADD COLUMN IF NOT EXISTS approval_level INTEGER DEFAULT 1;

-- تفعيل RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

-- سياسات RLS مبسطة
CREATE POLICY "allow_all_read_reports" ON report_templates FOR SELECT USING (true);
CREATE POLICY "allow_all_read_dashboards" ON custom_dashboards FOR SELECT USING (true);
CREATE POLICY "allow_all_read_kpis" ON kpi_definitions FOR SELECT USING (true);
