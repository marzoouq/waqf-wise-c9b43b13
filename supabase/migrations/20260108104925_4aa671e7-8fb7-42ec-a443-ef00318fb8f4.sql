-- إضافة عمود updated_at لجدول system_alerts
ALTER TABLE public.system_alerts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_system_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ربط الـ trigger بالجدول
DROP TRIGGER IF EXISTS system_alerts_updated_at ON public.system_alerts;
CREATE TRIGGER system_alerts_updated_at
  BEFORE UPDATE ON public.system_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_alerts_updated_at();