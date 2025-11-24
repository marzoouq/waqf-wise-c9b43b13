
-- تحديث هيكل الجداول الناقصة
-- إضافة is_shared لـ custom_dashboards إذا لم يكن موجوداً
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'custom_dashboards' AND column_name = 'is_shared'
  ) THEN
    ALTER TABLE custom_dashboards ADD COLUMN is_shared BOOLEAN DEFAULT false;
  END IF;
END $$;

-- تحديث distribution_approvals لتحديث approval_level للسجلات الموجودة
UPDATE distribution_approvals SET approval_level = 1 WHERE approval_level IS NULL;

-- سياسات RLS بسيطة
DROP POLICY IF EXISTS "allow_all_read_reports" ON report_templates;
DROP POLICY IF EXISTS "allow_all_read_dashboards" ON custom_dashboards;
DROP POLICY IF EXISTS "allow_all_read_kpis" ON kpi_definitions;

CREATE POLICY "public_read_reports" ON report_templates FOR SELECT USING (true);
CREATE POLICY "public_read_dashboards" ON custom_dashboards FOR SELECT USING (true);
CREATE POLICY "public_read_kpis" ON kpi_definitions FOR SELECT USING (true);
