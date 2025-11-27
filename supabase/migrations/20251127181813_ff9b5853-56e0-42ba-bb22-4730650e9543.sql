-- تنظيف سجلات system_health_checks القديمة (الاحتفاظ بآخر 7 أيام فقط)
DELETE FROM system_health_checks 
WHERE created_at < NOW() - INTERVAL '7 days';

-- إنشاء دالة تنظيف تلقائية
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION cleanup_old_records() IS 'تنظيف السجلات القديمة تلقائياً - يُستدعى يومياً';

-- تشغيل التنظيف الأولي
SELECT cleanup_old_records();