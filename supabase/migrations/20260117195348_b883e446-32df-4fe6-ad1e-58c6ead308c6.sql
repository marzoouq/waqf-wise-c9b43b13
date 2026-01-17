-- =====================================================
-- إضافة فهارس لتحسين أداء جدول audit_logs
-- =====================================================

-- 1. فهرس على created_at للاستعلامات الزمنية
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON public.audit_logs (created_at DESC);

-- 2. فهرس على action_type للبحث حسب النوع
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type 
ON public.audit_logs (action_type);

-- 3. فهرس مركب للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON public.audit_logs (user_id, created_at DESC);

-- 4. فهرس على table_name للبحث حسب الجدول
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name 
ON public.audit_logs (table_name);

-- =====================================================
-- إنشاء دالة أرشفة سجلات التدقيق القديمة
-- =====================================================

CREATE OR REPLACE FUNCTION archive_old_audit_logs(months_old INTEGER DEFAULT 3)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count INTEGER;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - (months_old || ' months')::INTERVAL;
  
  -- نقل السجلات القديمة للأرشيف
  INSERT INTO audit_logs_archive (
    id, action_type, table_name, record_id, user_id, user_email,
    old_values, new_values, description, ip_address, user_agent,
    severity, created_at, archived_at
  )
  SELECT 
    id, action_type, table_name, record_id, user_id, user_email,
    old_values, new_values, description, ip_address, user_agent,
    severity, created_at, NOW()
  FROM audit_logs
  WHERE created_at < cutoff_date
  ON CONFLICT (id) DO NOTHING;
  
  -- حذف السجلات المؤرشفة من الجدول الأصلي
  DELETE FROM audit_logs WHERE created_at < cutoff_date;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- تسجيل عملية الأرشفة
  INSERT INTO audit_logs (action_type, table_name, description, severity)
  VALUES ('ARCHIVE', 'audit_logs', 
    format('تم أرشفة %s سجل أقدم من %s أشهر', archived_count, months_old),
    'INFO');
  
  RETURN archived_count;
END;
$$;

-- =====================================================
-- إضافة فهارس للجداول الكبيرة الأخرى
-- =====================================================

-- فهارس لجدول beneficiary_activity_log
CREATE INDEX IF NOT EXISTS idx_beneficiary_activity_created_at 
ON public.beneficiary_activity_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beneficiary_activity_beneficiary 
ON public.beneficiary_activity_log (beneficiary_id, created_at DESC);

-- فهارس لجدول notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON public.notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read, created_at DESC);

-- فهارس لجدول system_alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at 
ON public.system_alerts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_alerts_status 
ON public.system_alerts (status, created_at DESC);