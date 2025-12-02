-- إصلاح تحذير الأمان: تعيين search_path للدالة
CREATE OR REPLACE FUNCTION smart_cleanup_monitoring_data()
RETURNS TABLE (
  health_checks_deleted INTEGER,
  alerts_merged INTEGER,
  errors_resolved INTEGER,
  alerts_archived INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_health_deleted INTEGER := 0;
  v_alerts_merged INTEGER := 0;
  v_errors_resolved INTEGER := 0;
  v_alerts_archived INTEGER := 0;
BEGIN
  WITH old_checks AS (
    SELECT id FROM system_health_checks 
    WHERE id NOT IN (
      SELECT id FROM system_health_checks 
      ORDER BY created_at DESC LIMIT 100
    )
    OR created_at < NOW() - INTERVAL '3 days'
  )
  DELETE FROM system_health_checks WHERE id IN (SELECT id FROM old_checks);
  GET DIAGNOSTICS v_health_deleted = ROW_COUNT;

  WITH duplicate_alerts AS (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY alert_type, severity 
        ORDER BY created_at DESC
      ) as rn
      FROM system_alerts WHERE status = 'active'
    ) duplicates WHERE rn > 1
  )
  UPDATE system_alerts SET
    status = 'resolved',
    resolved_at = NOW(),
    resolution_notes = 'Auto-merged duplicates by smart cleanup'
  WHERE id IN (SELECT id FROM duplicate_alerts);
  GET DIAGNOSTICS v_alerts_merged = ROW_COUNT;

  UPDATE system_error_logs
  SET status = 'resolved',
      resolved_at = COALESCE(resolved_at, NOW())
  WHERE status IN ('new', 'in_progress')
  AND created_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_errors_resolved = ROW_COUNT;

  UPDATE system_alerts SET status = 'archived'
  WHERE status = 'resolved'
  AND resolved_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS v_alerts_archived = ROW_COUNT;

  DELETE FROM system_alerts
  WHERE status = 'archived'
  AND created_at < NOW() - INTERVAL '30 days';

  DELETE FROM system_error_logs
  WHERE status = 'resolved'
  AND created_at < NOW() - INTERVAL '14 days';

  RETURN QUERY SELECT v_health_deleted, v_alerts_merged, v_errors_resolved, v_alerts_archived;
END;
$$;