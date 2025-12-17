-- المرحلة 1: إضافة عمود priority لجدول notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- إضافة constraint للقيم المسموحة
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_priority_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);