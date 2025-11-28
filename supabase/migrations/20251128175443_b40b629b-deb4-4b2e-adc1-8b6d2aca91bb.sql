-- إضافة عمود source المفقود في جدول system_alerts
ALTER TABLE public.system_alerts 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'system';

-- تحديث القيم الموجودة
UPDATE public.system_alerts 
SET source = 'system' 
WHERE source IS NULL;