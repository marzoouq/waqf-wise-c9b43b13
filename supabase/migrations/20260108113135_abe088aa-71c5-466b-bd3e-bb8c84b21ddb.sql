
-- تحديث إحصائيات الجداول الكبيرة
ANALYZE public.audit_logs;
ANALYZE public.audit_logs_archive;
ANALYZE public.beneficiary_activity_log;
ANALYZE public.system_alerts;

-- إضافة فهارس مركبة لتحسين الاستعلامات المتكررة
CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_severity_created 
ON public.audit_logs_archive(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beneficiary_activity_action_created 
ON public.beneficiary_activity_log(action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_alerts_type_status 
ON public.system_alerts(alert_type, status) 
WHERE status != 'resolved';
