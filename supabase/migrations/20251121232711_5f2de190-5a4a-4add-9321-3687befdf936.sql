-- إصلاح مسار البحث للدالة
DROP FUNCTION IF EXISTS cleanup_old_error_logs();

CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM system_error_logs
  WHERE created_at < now() - INTERVAL '90 days'
  AND status IN ('resolved', 'ignored');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;