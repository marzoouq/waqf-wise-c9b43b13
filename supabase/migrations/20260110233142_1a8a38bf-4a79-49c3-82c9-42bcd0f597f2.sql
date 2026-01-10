-- ====================================
-- خطة صيانة قاعدة البيانات الشاملة
-- ====================================

-- 1. إزالة الفهرس المكرر (72 KB)
DROP INDEX IF EXISTS idx_activity_log_created;

-- 2. تحسين إعدادات Autovacuum للجداول النشطة
ALTER TABLE notifications SET (
  autovacuum_vacuum_threshold = 100,
  autovacuum_analyze_threshold = 50,
  autovacuum_vacuum_scale_factor = 0.05
);

ALTER TABLE system_alerts SET (
  autovacuum_vacuum_threshold = 100,
  autovacuum_analyze_threshold = 50,
  autovacuum_vacuum_scale_factor = 0.05
);

ALTER TABLE chatbot_conversations SET (
  autovacuum_vacuum_threshold = 50,
  autovacuum_analyze_threshold = 25,
  autovacuum_vacuum_scale_factor = 0.1
);

ALTER TABLE audit_logs_archive SET (
  autovacuum_vacuum_threshold = 200,
  autovacuum_analyze_threshold = 100,
  autovacuum_vacuum_scale_factor = 0.02
);