-- ============================================
-- تحسين فهارس قاعدة البيانات
-- المرحلة 2: إضافة فهارس جديدة وحذف غير المستخدمة
-- ============================================

-- 1. إضافة فهارس جديدة لتحسين الأداء

-- فهرس user_roles (تحسين 85%+ من Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role 
ON user_roles(user_id, role);

-- فهرس families (تحسين 98%+ من Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_families_status 
ON families(status);

-- فهرس funds (تحسين 99%+ من Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_funds_is_active 
ON funds(is_active) WHERE is_active = true;

-- فهرس tasks (تحسين 98%+ من Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_tasks_status_assigned 
ON tasks(status, assigned_to);

-- فهرس beneficiary_requests (تحسين 86%+ من Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status_priority 
ON beneficiary_requests(status, priority);

-- فهرس journal_entry_lines (تحسين 89%+ من Sequential Scans)
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id 
ON journal_entry_lines(journal_entry_id);

-- 2. حذف الفهارس غير المستخدمة

-- فهارس لم تُستخدم منذ إنشائها (توفير مساحة وتحسين أداء الإدراج)
DROP INDEX IF EXISTS idx_audit_logs_user_action_created;
DROP INDEX IF EXISTS idx_beneficiary_activity_log_beneficiary_action;
DROP INDEX IF EXISTS idx_notifications_user_created;
DROP INDEX IF EXISTS idx_beneficiary_activity_action_created;
DROP INDEX IF EXISTS idx_chatbot_conversations_user;
DROP INDEX IF EXISTS idx_audit_logs_archive_severity_created;
DROP INDEX IF EXISTS idx_audit_logs_archive_user_id;