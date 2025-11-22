-- إضافة عمود metadata المفقود في جدول system_alerts
ALTER TABLE public.system_alerts 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN public.system_alerts.metadata IS 'بيانات إضافية عن التنبيه بصيغة JSON';

-- إنشاء فهرس لتحسين الأداء عند البحث في metadata
CREATE INDEX IF NOT EXISTS idx_system_alerts_metadata 
ON public.system_alerts USING gin (metadata);

-- تحديث السجلات الموجودة لتحويل البيانات إذا كانت موجودة
UPDATE public.system_alerts 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;