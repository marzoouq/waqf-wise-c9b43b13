-- 1. حذف الدالة القديمة أولاً
DROP FUNCTION IF EXISTS public.run_scheduled_cleanup();

-- 2. إعادة إنشاء دالة التنظيف الشامل المجدولة مع return type صحيح
CREATE OR REPLACE FUNCTION public.run_scheduled_cleanup()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  health_checks_deleted INTEGER := 0;
  error_logs_deleted INTEGER := 0;
  alerts_deleted INTEGER := 0;
  audit_logs_deleted INTEGER := 0;
  notifications_deleted INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- تنظيف system_health_checks (أقدم من 24 ساعة)
  DELETE FROM system_health_checks WHERE created_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS health_checks_deleted = ROW_COUNT;
  
  -- تنظيف system_error_logs (أقدم من 7 أيام)
  DELETE FROM system_error_logs WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS error_logs_deleted = ROW_COUNT;
  
  -- تنظيف system_alerts المغلقة (أقدم من 30 يوم)
  DELETE FROM system_alerts WHERE status = 'resolved' AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS alerts_deleted = ROW_COUNT;
  
  -- تنظيف audit_logs (أقدم من 90 يوم، فقط severity = 'info')
  DELETE FROM audit_logs WHERE severity = 'info' AND created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS audit_logs_deleted = ROW_COUNT;
  
  -- تنظيف notifications المقروءة (أقدم من 30 يوم)
  DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS notifications_deleted = ROW_COUNT;
  
  total_deleted := health_checks_deleted + error_logs_deleted + alerts_deleted + audit_logs_deleted + notifications_deleted;
  
  RETURN json_build_object(
    'success', true,
    'total_deleted', total_deleted,
    'details', json_build_object(
      'health_checks', health_checks_deleted,
      'error_logs', error_logs_deleted,
      'alerts', alerts_deleted,
      'audit_logs', audit_logs_deleted,
      'notifications', notifications_deleted
    )
  );
END;
$$;

-- 3. منح صلاحيات التنفيذ
GRANT EXECUTE ON FUNCTION public.run_scheduled_cleanup() TO service_role;