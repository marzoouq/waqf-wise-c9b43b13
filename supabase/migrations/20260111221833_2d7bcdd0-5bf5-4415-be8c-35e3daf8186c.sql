-- =====================================================
-- المرحلة 3: تحسين الأداء - إضافة فهارس وتنظيف
-- =====================================================

-- 1. إضافة فهارس للجداول الكبيرة
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_created 
ON public.audit_logs (user_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beneficiary_activity_log_beneficiary_action 
ON public.beneficiary_activity_log (beneficiary_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id 
ON public.chatbot_conversations (user_id);

CREATE INDEX IF NOT EXISTS idx_custom_reports_created_at 
ON public.custom_reports (created_at DESC);

-- 2. حذف الفهارس المكررة
DROP INDEX IF EXISTS idx_audit_date;
DROP INDEX IF EXISTS idx_activity_log_created;

-- 3. تحديث إحصائيات الجداول
ANALYZE public.audit_logs;
ANALYZE public.beneficiary_activity_log;
ANALYZE public.ai_system_audits;
ANALYZE public.chatbot_conversations;
ANALYZE public.beneficiaries;
ANALYZE public.accounts;
ANALYZE public.journal_entries;
ANALYZE public.journal_entry_lines