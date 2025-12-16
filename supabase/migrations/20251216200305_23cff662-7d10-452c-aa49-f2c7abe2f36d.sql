-- إنشاء دالة لحذف محادثات الشات بوت القديمة (أكثر من 3 أيام)
CREATE OR REPLACE FUNCTION cleanup_old_chatbot_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM chatbot_conversations
  WHERE created_at < NOW() - INTERVAL '3 days';
END;
$$;

-- إنشاء cron job لتشغيل الحذف يومياً (إذا كان pg_cron متاحاً)
-- ملاحظة: سيتم تشغيل الحذف أيضاً عند كل رسالة جديدة

-- تعديل دالة الشات بوت لحذف المحادثات القديمة عند كل استخدام
CREATE OR REPLACE FUNCTION auto_cleanup_chatbot_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- حذف المحادثات الأقدم من 3 أيام للمستخدم الحالي فقط (لتحسين الأداء)
  DELETE FROM chatbot_conversations
  WHERE user_id = NEW.user_id
    AND created_at < NOW() - INTERVAL '3 days';
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتنظيف المحادثات القديمة تلقائياً
DROP TRIGGER IF EXISTS trigger_cleanup_old_chatbot ON chatbot_conversations;
CREATE TRIGGER trigger_cleanup_old_chatbot
AFTER INSERT ON chatbot_conversations
FOR EACH ROW
EXECUTE FUNCTION auto_cleanup_chatbot_on_insert();

-- حذف المحادثات القديمة الحالية
DELETE FROM chatbot_conversations
WHERE created_at < NOW() - INTERVAL '3 days';