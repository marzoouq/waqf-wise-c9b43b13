-- إضافة عمود sla_hours لجدول request_types لتحديد مدة معالجة كل نوع طلب
ALTER TABLE public.request_types 
ADD COLUMN IF NOT EXISTS sla_hours INTEGER DEFAULT 48;

-- تحديث القيم الافتراضية لأنواع الطلبات المختلفة
UPDATE public.request_types 
SET sla_hours = 24 
WHERE name_en = 'Emergency Aid';

UPDATE public.request_types 
SET sla_hours = 72 
WHERE name_en IN ('Loan', 'Data Update', 'Add Newborn');

UPDATE public.request_types 
SET sla_hours = 48 
WHERE name_en IN ('General Inquiry', 'Complaint', 'Other');

-- إضافة تعليق توضيحي
COMMENT ON COLUMN public.request_types.sla_hours IS 'عدد الساعات المسموح بها لمعالجة هذا النوع من الطلبات (SLA - Service Level Agreement)';