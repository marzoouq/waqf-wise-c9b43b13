-- إضافة عمود السماح بتعديل الملف الشخصي
ALTER TABLE public.beneficiary_visibility_settings 
ADD COLUMN IF NOT EXISTS allow_profile_edit boolean DEFAULT true;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN public.beneficiary_visibility_settings.allow_profile_edit IS 'السماح للمستفيد بتعديل ملفه الشخصي';