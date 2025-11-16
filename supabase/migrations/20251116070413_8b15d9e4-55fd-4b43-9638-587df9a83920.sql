-- ===============================================
-- المرحلة 1: تحسين نظام الأرشفة والبحث الذكي
-- ===============================================

-- جدول الوسوم الذكية للمستندات
CREATE TABLE IF NOT EXISTS public.document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_type TEXT NOT NULL, -- 'manual', 'auto', 'ai'
  confidence_score DECIMAL(3,2), -- للوسوم التلقائية
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- جدول محتوى OCR المستخرج
CREATE TABLE IF NOT EXISTS public.document_ocr_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  extracted_text TEXT,
  language TEXT DEFAULT 'ar',
  confidence_score DECIMAL(3,2),
  page_number INTEGER,
  extracted_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- جدول سياسات الاحتفاظ
CREATE TABLE IF NOT EXISTS public.retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT false,
  archive_before_delete BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================
-- المرحلة 2: نظام الإشعارات المتقدم
-- ===============================================

-- جدول قوالب الإشعارات
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  subject TEXT,
  body_template TEXT NOT NULL,
  variables JSONB, -- متغيرات القالب
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول سجل الإشعارات المرسلة
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول اشتراكات Push Notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- ===============================================
-- المرحلة 3: نظام التقارير الذكية
-- ===============================================

-- جدول لوحات التحكم المخصصة
CREATE TABLE IF NOT EXISTS public.dashboard_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  dashboard_name TEXT NOT NULL,
  layout_config JSONB NOT NULL, -- تكوين الويدجتس والترتيب
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول مؤشرات الأداء المخصصة
CREATE TABLE IF NOT EXISTS public.custom_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name TEXT NOT NULL,
  kpi_type TEXT NOT NULL, -- 'financial', 'operational', 'beneficiary', 'property'
  calculation_formula JSONB NOT NULL,
  target_value DECIMAL(15,2),
  unit TEXT,
  display_format TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التقارير المجدولة
CREATE TABLE IF NOT EXISTS public.scheduled_report_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_template_id UUID REFERENCES public.custom_report_templates(id),
  schedule_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  cron_expression TEXT,
  recipients JSONB NOT NULL, -- قائمة المستلمين
  delivery_method TEXT DEFAULT 'email', -- 'email', 'storage', 'both'
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================
-- المرحلة 4: نظام النسخ الاحتياطي
-- ===============================================

-- جدول جدولة النسخ الاحتياطي
CREATE TABLE IF NOT EXISTS public.backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT NOT NULL,
  backup_type TEXT NOT NULL, -- 'full', 'incremental', 'differential'
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  retention_days INTEGER DEFAULT 30,
  tables_included TEXT[] NOT NULL,
  include_storage BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_backup_at TIMESTAMPTZ,
  next_backup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================
-- الفهارس لتحسين الأداء
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_document_tags_document ON public.document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_name ON public.document_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_ocr_content_document ON public.document_ocr_content(document_id);
CREATE INDEX IF NOT EXISTS idx_ocr_content_text ON public.document_ocr_content USING gin(to_tsvector('arabic', extracted_text));
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user ON public.dashboard_configurations(user_id);

-- ===============================================
-- Triggers
-- ===============================================

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_retention_policies_updated_at
  BEFORE UPDATE ON public.retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dashboard_configurations_updated_at
  BEFORE UPDATE ON public.dashboard_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_kpis_updated_at
  BEFORE UPDATE ON public.custom_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scheduled_report_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_report_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_backup_schedules_updated_at
  BEFORE UPDATE ON public.backup_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===============================================
-- RLS Policies
-- ===============================================

ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_ocr_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_report_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Policies للوسوم
CREATE POLICY "Users can view document tags" ON public.document_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage document tags" ON public.document_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'archivist')
    )
  );

-- Policies لمحتوى OCR
CREATE POLICY "Users can view OCR content" ON public.document_ocr_content
  FOR SELECT USING (true);

CREATE POLICY "System can manage OCR content" ON public.document_ocr_content
  FOR ALL USING (true);

-- Policies لسياسات الاحتفاظ
CREATE POLICY "Admins can manage retention policies" ON public.retention_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies للإشعارات
CREATE POLICY "Users can view their notification logs" ON public.notification_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage notification logs" ON public.notification_logs
  FOR ALL USING (true);

-- Policies لاشتراكات Push
CREATE POLICY "Users can manage their push subscriptions" ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Policies للوحات التحكم
CREATE POLICY "Users can manage their dashboards" ON public.dashboard_configurations
  FOR ALL USING (user_id = auth.uid() OR is_shared = true);

-- Policies لمؤشرات الأداء
CREATE POLICY "Users can view KPIs" ON public.custom_kpis
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage KPIs" ON public.custom_kpis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
    )
  );

-- Policies للتقارير المجدولة
CREATE POLICY "Users can view their scheduled reports" ON public.scheduled_report_jobs
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
    )
  );

CREATE POLICY "Admins can manage scheduled reports" ON public.scheduled_report_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
    )
  );

-- Policies للنسخ الاحتياطي
CREATE POLICY "Admins can manage backup schedules" ON public.backup_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ===============================================
-- بيانات أولية
-- ===============================================

-- قوالب إشعارات أساسية
INSERT INTO public.notification_templates (template_name, template_type, subject, body_template, variables) VALUES
('new_ticket_notification', 'in_app', 'تذكرة دعم جديدة', 'تم إنشاء تذكرة دعم جديدة: {{ticket_number}} - {{subject}}', '{"ticket_number": "string", "subject": "string"}'::jsonb),
('ticket_assigned', 'in_app', 'تم تعيين تذكرة لك', 'تم تعيين التذكرة {{ticket_number}} لك', '{"ticket_number": "string"}'::jsonb),
('request_approved', 'email', 'تمت الموافقة على طلبك', 'تمت الموافقة على طلبك رقم {{request_number}}. يمكنك متابعة التفاصيل من خلال البوابة.', '{"request_number": "string"}'::jsonb),
('payment_received', 'sms', 'إشعار دفع', 'تم استلام دفعة بمبلغ {{amount}} ريال. رقم السند: {{receipt_number}}', '{"amount": "number", "receipt_number": "string"}'::jsonb)
ON CONFLICT (template_name) DO NOTHING;

-- سياسات احتفاظ افتراضية
INSERT INTO public.retention_policies (policy_name, document_type, retention_days, auto_delete, archive_before_delete) VALUES
('مستندات الهوية', 'identity', 3650, false, true), -- 10 سنوات
('العقود', 'contract', 1825, false, true), -- 5 سنوات
('الفواتير', 'invoice', 1095, false, true), -- 3 سنوات
('المراسلات العامة', 'general', 365, true, false) -- سنة واحدة
ON CONFLICT DO NOTHING;

-- جدولة نسخ احتياطي افتراضية
INSERT INTO public.backup_schedules (schedule_name, backup_type, frequency, retention_days, tables_included, include_storage) VALUES
('نسخ احتياطي يومي كامل', 'full', 'daily', 30, ARRAY['beneficiaries', 'families', 'properties', 'contracts', 'loans', 'payments', 'documents'], true),
('نسخ احتياطي أسبوعي شامل', 'full', 'weekly', 90, ARRAY['*'], true)
ON CONFLICT DO NOTHING;

-- تفعيل Realtime للجداول المهمة
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;