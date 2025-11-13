-- =====================================================
-- إنشاء جدول إعدادات النظام (System Settings)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'text',
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "الجميع يمكنهم قراءة إعدادات النظام"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم تحديث الإعدادات"
  ON public.system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON public.system_settings(category);

-- إدراج الإعدادات الافتراضية
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, category, description) VALUES
  -- المالية
  ('payment_approval_threshold', '50000', 'number', 'financial', 'حد الموافقة على المدفوعات (ريال)'),
  ('default_currency', 'SAR', 'text', 'general', 'العملة الافتراضية'),
  ('enable_auto_distribution', 'false', 'boolean', 'financial', 'تفعيل التوزيع التلقائي'),
  ('distribution_day', '1', 'number', 'financial', 'يوم التوزيع الشهري'),
  
  -- الإشعارات
  ('enable_email_notifications', 'true', 'boolean', 'notifications', 'تفعيل الإشعارات عبر البريد'),
  ('enable_sms_notifications', 'false', 'boolean', 'notifications', 'تفعيل الإشعارات عبر SMS'),
  ('notification_language', 'ar', 'text', 'notifications', 'لغة الإشعارات'),
  ('send_daily_reports', 'true', 'boolean', 'notifications', 'إرسال التقارير اليومية'),
  
  -- الأمان
  ('password_min_length', '8', 'number', 'security', 'الحد الأدنى لطول كلمة المرور'),
  ('enable_two_factor', 'false', 'boolean', 'security', 'تفعيل المصادقة الثنائية'),
  ('session_timeout_minutes', '60', 'number', 'security', 'مهلة الجلسة (دقيقة)'),
  ('max_login_attempts', '5', 'number', 'security', 'عدد محاولات تسجيل الدخول'),
  ('enable_ip_tracking', 'true', 'boolean', 'security', 'تتبع عناوين IP'),
  
  -- عامة
  ('app_name', 'نظام إدارة الوقف', 'text', 'general', 'اسم التطبيق'),
  ('timezone', 'Asia/Riyadh', 'text', 'general', 'المنطقة الزمنية'),
  ('date_format', 'dd/MM/yyyy', 'text', 'general', 'تنسيق التاريخ'),
  ('fiscal_year_start', '01/01', 'text', 'general', 'بداية السنة المالية'),
  ('enable_maintenance_mode', 'false', 'boolean', 'general', 'وضع الصيانة'),
  ('backup_frequency', 'daily', 'text', 'general', 'تكرار النسخ الاحتياطي'),
  ('max_file_upload_size', '10', 'number', 'general', 'حجم الملف الأقصى (MB)'),
  ('enable_audit_logs', 'true', 'boolean', 'general', 'تفعيل سجل العمليات')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- إنشاء جدول سجل العمليات (Audit Logs) إذا لم يكن موجوداً
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  description TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "المسؤولون يمكنهم عرض سجل العمليات"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- تحديث الـ Trigger لـ updated_at في system_settings
CREATE OR REPLACE FUNCTION public.update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_system_settings_timestamp ON public.system_settings;
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_settings_timestamp();