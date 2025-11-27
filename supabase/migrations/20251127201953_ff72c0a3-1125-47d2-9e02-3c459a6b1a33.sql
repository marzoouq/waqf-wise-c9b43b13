
-- إضافة الجداول الناقصة فقط

-- 1. لوحات التحكم
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_name VARCHAR(100) NOT NULL,
  dashboard_name_ar VARCHAR(100),
  description TEXT,
  layout_config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Widgets لوحة التحكم
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE,
  widget_name VARCHAR(100) NOT NULL,
  widget_name_ar VARCHAR(100),
  widget_type VARCHAR(50) NOT NULL,
  data_source VARCHAR(100),
  config JSONB DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  is_visible BOOLEAN DEFAULT true,
  refresh_interval INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. قيم مؤشرات الأداء
CREATE TABLE IF NOT EXISTS public.kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
  value DECIMAL(15,2) NOT NULL,
  previous_value DECIMAL(15,2),
  change_percentage DECIMAL(10,2),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  period_start DATE,
  period_end DATE,
  metadata JSONB DEFAULT '{}'
);

-- 4. سجل تنفيذ التقارير
CREATE TABLE IF NOT EXISTS public.report_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_report_id UUID REFERENCES public.scheduled_reports(id) ON DELETE SET NULL,
  report_template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  execution_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  file_path TEXT,
  file_size INTEGER,
  row_count INTEGER,
  error_message TEXT,
  executed_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- 5. التقارير المحفوظة
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  report_name VARCHAR(100) NOT NULL,
  report_template_id UUID REFERENCES public.report_templates(id) ON DELETE CASCADE,
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]',
  sort_config JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS للجداول الجديدة
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Allow read dashboards" ON public.dashboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert dashboards" ON public.dashboards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update dashboards" ON public.dashboards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete dashboards" ON public.dashboards FOR DELETE TO authenticated USING (is_system = false);

CREATE POLICY "Allow read widgets" ON public.dashboard_widgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert widgets" ON public.dashboard_widgets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update widgets" ON public.dashboard_widgets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete widgets" ON public.dashboard_widgets FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read kpi_values" ON public.kpi_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert kpi_values" ON public.kpi_values FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read execution_log" ON public.report_execution_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert execution_log" ON public.report_execution_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read saved_reports" ON public.saved_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert saved_reports" ON public.saved_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update saved_reports" ON public.saved_reports FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete saved_reports" ON public.saved_reports FOR DELETE TO authenticated USING (true);

-- إنشاء لوحة تحكم افتراضية
INSERT INTO public.dashboards (dashboard_name, dashboard_name_ar, description, is_default, is_system) 
VALUES ('Main Dashboard', 'لوحة التحكم الرئيسية', 'لوحة التحكم الافتراضية للناظر', true, true)
ON CONFLICT DO NOTHING;

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi_id ON public.kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_recorded_at ON public.kpi_values(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_report_execution_log_status ON public.report_execution_log(status, started_at DESC);
