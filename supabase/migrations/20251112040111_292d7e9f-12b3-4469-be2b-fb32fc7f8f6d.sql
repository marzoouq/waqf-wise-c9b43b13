-- إضافة حقول جديدة لجدول المستفيدين
ALTER TABLE public.beneficiaries
ADD COLUMN IF NOT EXISTS number_of_sons integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_daughters integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_wives integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS housing_type text;