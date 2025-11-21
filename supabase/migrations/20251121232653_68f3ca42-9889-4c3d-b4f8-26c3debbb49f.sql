-- جدول سجلات الأخطاء
CREATE TABLE IF NOT EXISTS system_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  user_id UUID,
  additional_data JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'ignored')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهرسة للأداء
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON system_error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON system_error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON system_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON system_error_logs(error_type);

-- جدول التنبيهات الحرجة
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  related_error_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهرسة للأداء
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON system_alerts(created_at DESC);

-- سياسات RLS
ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للمستخدمين المصادق عليهم فقط
CREATE POLICY "Authenticated users can view error logs" ON system_error_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- السماح للنظام بالإضافة (أي طلب)
CREATE POLICY "Anyone can insert error logs" ON system_error_logs
  FOR INSERT
  WITH CHECK (true);

-- السماح للمستخدمين المصادق عليهم بتحديث السجلات
CREATE POLICY "Authenticated users can update error logs" ON system_error_logs
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- السماح بالقراءة للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can view alerts" ON system_alerts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- السماح للنظام بإنشاء التنبيهات
CREATE POLICY "Anyone can insert alerts" ON system_alerts
  FOR INSERT
  WITH CHECK (true);

-- السماح للمستخدمين المصادق عليهم بتحديث التنبيهات
CREATE POLICY "Authenticated users can update alerts" ON system_alerts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- دالة لحذف السجلات القديمة (أكثر من 90 يوم)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM system_error_logs
  WHERE created_at < now() - INTERVAL '90 days'
  AND status IN ('resolved', 'ignored');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE system_error_logs IS 'سجل شامل لجميع أخطاء النظام مع تفاصيل كاملة';
COMMENT ON TABLE system_alerts IS 'تنبيهات حرجة للأخطاء المتكررة والمشاكل الخطيرة';
COMMENT ON FUNCTION cleanup_old_error_logs IS 'تنظيف السجلات القديمة المحلولة تلقائياً';