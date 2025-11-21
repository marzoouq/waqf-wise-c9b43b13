
-- ==========================================
-- نظام الإشعارات والتنبيهات المتقدم
-- ==========================================

-- 1. جدول تفضيلات الإشعارات لكل مستخدم
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  
  -- قنوات الإشعار
  enable_in_app BOOLEAN DEFAULT true,
  enable_email BOOLEAN DEFAULT true,
  enable_sms BOOLEAN DEFAULT false,
  enable_push BOOLEAN DEFAULT true,
  
  -- أنواع الأخطاء التي يريد الإشعار عنها
  notify_critical BOOLEAN DEFAULT true,
  notify_high BOOLEAN DEFAULT true,
  notify_medium BOOLEAN DEFAULT false,
  notify_low BOOLEAN DEFAULT false,
  
  -- ساعات العمل (لتجنب الإشعارات خارج أوقات العمل)
  work_hours_start TIME DEFAULT '08:00:00',
  work_hours_end TIME DEFAULT '17:00:00',
  work_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=الأحد, 7=السبت
  
  -- التصعيد التلقائي
  auto_escalate_after_minutes INTEGER DEFAULT 30,
  escalate_to_user_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. جدول قواعد الإشعارات (متى يتم إرسال إشعار)
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  
  -- شروط تفعيل القاعدة
  error_type_pattern TEXT, -- نمط regex لنوع الخطأ
  min_severity TEXT, -- أقل مستوى خطورة (low, medium, high, critical)
  occurrence_threshold INTEGER DEFAULT 1, -- عدد مرات التكرار
  time_window_minutes INTEGER DEFAULT 60, -- خلال كم دقيقة
  
  -- الإجراءات
  notify_roles TEXT[] DEFAULT ARRAY['support'], -- الأدوار التي يجب إشعارها
  auto_escalate BOOLEAN DEFAULT false,
  escalation_delay_minutes INTEGER DEFAULT 30,
  
  -- محاولات الإصلاح التلقائي
  auto_fix_attempts INTEGER DEFAULT 3,
  auto_fix_strategy TEXT, -- 'retry', 'restart', 'fallback', 'ignore'
  
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- أولوية تطبيق القاعدة
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. جدول سجل التصعيد التلقائي
CREATE TABLE IF NOT EXISTS alert_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES system_alerts(id) ON DELETE CASCADE,
  error_log_id UUID REFERENCES system_error_logs(id) ON DELETE CASCADE,
  
  escalated_from_user_id UUID,
  escalated_to_user_id UUID NOT NULL,
  escalation_level INTEGER DEFAULT 1, -- مستوى التصعيد
  escalation_reason TEXT,
  
  status TEXT DEFAULT 'pending', -- pending, acknowledged, resolved, dismissed
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. جدول محاولات الإصلاح التلقائي
CREATE TABLE IF NOT EXISTS auto_fix_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_log_id UUID REFERENCES system_error_logs(id) ON DELETE CASCADE,
  alert_rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  
  fix_strategy TEXT NOT NULL, -- 'retry', 'restart', 'fallback', 'circuit_breaker'
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  
  status TEXT DEFAULT 'pending', -- pending, in_progress, success, failed
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  result TEXT, -- نتيجة محاولة الإصلاح
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. جدول مراقبة صحة النظام
CREATE TABLE IF NOT EXISTS system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, -- 'database', 'api', 'performance', 'storage'
  check_name TEXT NOT NULL,
  
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  response_time_ms INTEGER,
  
  details JSONB,
  error_message TEXT,
  
  checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. جدول مقاييس الأداء
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'page_load', 'api_response', 'database_query'
  metric_name TEXT NOT NULL,
  
  value NUMERIC NOT NULL,
  unit TEXT, -- 'ms', 'seconds', 'mb', 'count'
  
  url TEXT,
  user_id UUID,
  session_id TEXT,
  
  metadata JSONB,
  
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- الفهارس لتحسين الأداء
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_role ON notification_preferences(role);

CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alert_rules_priority ON alert_rules(priority DESC);

CREATE INDEX IF NOT EXISTS idx_escalations_alert ON alert_escalations(alert_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON alert_escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_to_user ON alert_escalations(escalated_to_user_id);

CREATE INDEX IF NOT EXISTS idx_auto_fix_error ON auto_fix_attempts(error_log_id);
CREATE INDEX IF NOT EXISTS idx_auto_fix_status ON auto_fix_attempts(status);

CREATE INDEX IF NOT EXISTS idx_health_checks_type ON system_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON system_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_health_checks_time ON system_health_checks(checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_time ON performance_metrics(recorded_at DESC);

-- ==========================================
-- RLS Policies
-- ==========================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_fix_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- المستخدمون يمكنهم رؤية وتعديل تفضيلاتهم فقط
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- الجميع يمكنهم قراءة قواعد الإشعارات النشطة
CREATE POLICY "Everyone can view active alert rules"
  ON alert_rules FOR SELECT
  USING (is_active = true);

-- المستخدمون يمكنهم رؤية التصعيدات الموجهة لهم
CREATE POLICY "Users can view escalations directed to them"
  ON alert_escalations FOR SELECT
  USING (auth.uid() = escalated_to_user_id);

CREATE POLICY "Users can acknowledge their escalations"
  ON alert_escalations FOR UPDATE
  USING (auth.uid() = escalated_to_user_id);

-- الجميع يمكنهم رؤية محاولات الإصلاح التلقائي
CREATE POLICY "Everyone can view auto-fix attempts"
  ON auto_fix_attempts FOR SELECT
  USING (true);

-- الجميع يمكنهم رؤية فحوصات الصحة
CREATE POLICY "Everyone can view system health checks"
  ON system_health_checks FOR SELECT
  USING (true);

-- الجميع يمكنهم رؤية مقاييس الأداء
CREATE POLICY "Everyone can view performance metrics"
  ON performance_metrics FOR SELECT
  USING (true);

-- ==========================================
-- إدخال بيانات افتراضية
-- ==========================================

-- قواعد إشعار افتراضية
INSERT INTO alert_rules (rule_name, description, error_type_pattern, min_severity, notify_roles, auto_escalate, priority) VALUES
('Critical Errors Alert', 'إشعار فوري عن جميع الأخطاء الحرجة', '.*', 'critical', ARRAY['admin', 'support'], true, 100),
('Database Connection Failures', 'مراقبة فشل الاتصال بقاعدة البيانات', 'database.*|health_check.*', 'high', ARRAY['admin', 'support'], true, 90),
('Recurring Network Errors', 'كشف الأخطاء الشبكية المتكررة', 'network_error', 'medium', ARRAY['support'], true, 80),
('Performance Degradation', 'تنبيه عند تدهور الأداء', 'performance.*|layout_shift', 'low', ARRAY['admin'], false, 50)
ON CONFLICT DO NOTHING;