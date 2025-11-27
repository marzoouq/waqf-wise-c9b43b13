
-- ============================================
-- المرحلة 3: تنظيف قاعدة البيانات وإنشاء Job تلقائي
-- ============================================

-- 1. تنظيف system_health_checks (الاحتفاظ بآخر 7 أيام فقط)
DELETE FROM system_health_checks 
WHERE created_at < NOW() - INTERVAL '7 days';

-- 2. تنظيف system_alerts القديمة المحلولة
DELETE FROM system_alerts 
WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status IN ('resolved', 'acknowledged');

-- 3. الحفاظ على آخر 100 تنبيه نشط فقط (باستخدام ROW_NUMBER)
DELETE FROM system_alerts
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM system_alerts
    WHERE status = 'active'
  ) ranked
  WHERE rn > 100
);

-- 4. تنظيف system_error_logs المحلولة القديمة (أكثر من 30 يوم)
DELETE FROM system_error_logs
WHERE created_at < NOW() - INTERVAL '30 days'
  AND status IN ('resolved', 'ignored');

-- 5. إنشاء أو تحديث دالة التنظيف الشاملة
CREATE OR REPLACE FUNCTION public.cleanup_old_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- تنظيف system_health_checks (الاحتفاظ بآخر 7 أيام)
  DELETE FROM system_health_checks 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- تنظيف system_error_logs القديمة (الاحتفاظ بآخر 30 يوم)
  DELETE FROM system_error_logs 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND status = 'resolved';
  
  -- تنظيف audit_logs القديمة جداً (الاحتفاظ بآخر 90 يوم)
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- تنظيف notifications المقروءة القديمة (الاحتفاظ بآخر 30 يوم)
  DELETE FROM notifications 
  WHERE is_read = true 
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- تنظيف system_alerts القديمة المحلولة
  DELETE FROM system_alerts 
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND status IN ('resolved', 'acknowledged');
  
  -- الحفاظ على آخر 100 تنبيه نشط فقط
  DELETE FROM system_alerts
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
      FROM system_alerts
      WHERE status = 'active'
    ) ranked
    WHERE rn > 100
  );
END;
$$;

-- 6. إنشاء جدول لتتبع عمليات التنظيف
CREATE TABLE IF NOT EXISTS public.cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleanup_type TEXT NOT NULL,
  records_deleted INTEGER DEFAULT 0,
  tables_cleaned TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. إنشاء دالة تنظيف مع تسجيل
CREATE OR REPLACE FUNCTION public.run_scheduled_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_log_id UUID;
  v_deleted_health INTEGER := 0;
  v_deleted_errors INTEGER := 0;
  v_deleted_alerts INTEGER := 0;
  v_deleted_audit INTEGER := 0;
  v_deleted_notifications INTEGER := 0;
  v_total_deleted INTEGER := 0;
BEGIN
  -- إنشاء سجل للعملية
  INSERT INTO cleanup_logs (cleanup_type, status)
  VALUES ('scheduled', 'running')
  RETURNING id INTO v_log_id;

  -- تنظيف system_health_checks
  WITH deleted AS (
    DELETE FROM system_health_checks 
    WHERE created_at < NOW() - INTERVAL '7 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_health FROM deleted;

  -- تنظيف system_error_logs
  WITH deleted AS (
    DELETE FROM system_error_logs 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status = 'resolved'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_errors FROM deleted;

  -- تنظيف system_alerts
  WITH deleted AS (
    DELETE FROM system_alerts 
    WHERE created_at < NOW() - INTERVAL '24 hours'
      AND status IN ('resolved', 'acknowledged')
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_alerts FROM deleted;

  -- تنظيف audit_logs
  WITH deleted AS (
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_audit FROM deleted;

  -- تنظيف notifications
  WITH deleted AS (
    DELETE FROM notifications 
    WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '30 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_notifications FROM deleted;

  v_total_deleted := v_deleted_health + v_deleted_errors + v_deleted_alerts + v_deleted_audit + v_deleted_notifications;

  -- تحديث سجل العملية
  UPDATE cleanup_logs
  SET 
    completed_at = NOW(),
    status = 'completed',
    records_deleted = v_total_deleted,
    tables_cleaned = ARRAY['system_health_checks', 'system_error_logs', 'system_alerts', 'audit_logs', 'notifications']
  WHERE id = v_log_id;

  RETURN jsonb_build_object(
    'success', true,
    'total_deleted', v_total_deleted,
    'details', jsonb_build_object(
      'health_checks', v_deleted_health,
      'error_logs', v_deleted_errors,
      'alerts', v_deleted_alerts,
      'audit_logs', v_deleted_audit,
      'notifications', v_deleted_notifications
    )
  );
EXCEPTION WHEN OTHERS THEN
  UPDATE cleanup_logs
  SET 
    completed_at = NOW(),
    status = 'failed',
    error_message = SQLERRM
  WHERE id = v_log_id;
  
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 8. إضافة فهارس لتحسين أداء التنظيف
CREATE INDEX IF NOT EXISTS idx_system_health_checks_created_at 
ON system_health_checks(created_at);

CREATE INDEX IF NOT EXISTS idx_system_alerts_status_created 
ON system_alerts(status, created_at);

CREATE INDEX IF NOT EXISTS idx_system_error_logs_status_created 
ON system_error_logs(status, created_at);

-- 9. تفعيل RLS على جدول cleanup_logs
ALTER TABLE cleanup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cleanup logs"
ON cleanup_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer')
  )
);

-- 10. تسجيل عملية التنظيف الأولية
INSERT INTO cleanup_logs (cleanup_type, status, completed_at, tables_cleaned)
VALUES ('initial_migration', 'completed', NOW(), 
  ARRAY['system_health_checks', 'system_alerts', 'system_error_logs']);

COMMENT ON FUNCTION run_scheduled_cleanup() IS 'دالة التنظيف المجدول - يمكن استدعاؤها من Edge Function أو Cron Job';
