-- حذف الدوال القديمة وإعادة إنشائها
DROP FUNCTION IF EXISTS public.cleanup_old_chatbot_conversations();
DROP FUNCTION IF EXISTS public.cleanup_old_read_notifications();

-- تحسين الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beneficiary_activity_created ON beneficiary_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user ON chatbot_conversations(user_id, created_at DESC);

-- إضافة تنظيف تلقائي للمحادثات القديمة
CREATE FUNCTION public.cleanup_old_chatbot_conversations()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM chatbot_conversations 
  WHERE created_at < now() - interval '30 days'
  AND id NOT IN (
    SELECT conversation_id FROM chatbot_messages 
    WHERE created_at > now() - interval '30 days'
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة لتنظيف الإشعارات المقروءة القديمة
CREATE FUNCTION public.cleanup_old_read_notifications()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM notifications 
  WHERE read = true 
  AND created_at < now() - interval '60 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;