-- إضافة عمود executed_by_user_id لتحسين سلسلة الحفظ الجنائية
-- هذا يضمن تسجيل هوية المنفذ حتى عند استخدام SERVICE_ROLE_KEY

-- إضافة العمود في جدول heir_distributions
ALTER TABLE public.heir_distributions 
ADD COLUMN IF NOT EXISTS executed_by_user_id UUID REFERENCES auth.users(id);

-- إضافة العمود في جدول payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS executed_by_user_id UUID REFERENCES auth.users(id);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_heir_distributions_executed_by 
ON public.heir_distributions(executed_by_user_id);

CREATE INDEX IF NOT EXISTS idx_payments_executed_by 
ON public.payments(executed_by_user_id);

-- تعليق توضيحي للعمود
COMMENT ON COLUMN public.heir_distributions.executed_by_user_id IS 'معرف المستخدم الذي نفذ عملية التوزيع - للتدقيق الجنائي';
COMMENT ON COLUMN public.payments.executed_by_user_id IS 'معرف المستخدم الذي أنشأ الدفعة - للتدقيق الجنائي';