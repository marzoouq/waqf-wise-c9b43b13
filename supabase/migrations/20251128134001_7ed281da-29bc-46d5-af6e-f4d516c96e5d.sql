-- تحديث التنبيهات الحرجة
UPDATE system_alerts 
SET status = 'resolved', resolved_at = now()
WHERE status = 'active' AND severity = 'critical';