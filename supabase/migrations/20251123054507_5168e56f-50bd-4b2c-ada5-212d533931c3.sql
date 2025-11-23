-- إصلاح current_user_roles view المُنشأ سابقاً
-- تحويله من SECURITY DEFINER إلى SECURITY INVOKER

-- حذف الـ view القديم
DROP VIEW IF EXISTS public.current_user_roles;

-- إعادة إنشائه بدون SECURITY DEFINER (افتراضي SECURITY INVOKER)
CREATE VIEW public.current_user_roles AS
SELECT role 
FROM public.user_roles 
WHERE user_id = auth.uid();

COMMENT ON VIEW public.current_user_roles IS 'View مساعد لفحص أدوار المستخدم الحالي - SECURITY INVOKER (يستخدم صلاحيات المستخدم المستعلم)';

-- ملاحظة: SECURITY DEFINER views الأخرى (إن وجدت) يجب مراجعتها يدوياً
-- للتأكد من أنها تحتوي على WHERE clauses مناسبة أو تحويلها إلى SECURITY INVOKER
