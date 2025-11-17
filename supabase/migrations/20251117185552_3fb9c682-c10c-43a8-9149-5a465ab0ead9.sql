-- إصلاح التحذيرات الأمنية في دوال الإفصاح السنوي
-- إضافة search_path لضمان الأمان الكامل

-- التأكد من أن جميع الدوال لديها search_path صحيح
ALTER FUNCTION public.generate_annual_disclosure(INTEGER, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_annual_disclosure_timestamp() SET search_path = public, pg_temp;