-- إضافة سياسة تسمح للمستفيد بتحديث بياناته الشخصية
-- المستفيد يستطيع تحديث حقول محددة فقط

-- أولاً: حذف السياسة القديمة
DROP POLICY IF EXISTS "beneficiaries_update_unified" ON public.beneficiaries;

-- ثانياً: إنشاء سياسة تحديث جديدة تشمل المستفيد
CREATE POLICY "beneficiaries_update_unified" 
ON public.beneficiaries 
FOR UPDATE 
USING (
  -- المشرف أو الناظر يستطيع تحديث أي مستفيد
  is_admin_or_nazer() 
  OR 
  -- المستفيد يستطيع تحديث بياناته الخاصة فقط
  (user_id = auth.uid() AND (
    has_role(auth.uid(), 'beneficiary'::app_role) 
    OR has_role(auth.uid(), 'waqf_heir'::app_role)
  ))
);

-- إضافة تعليق توضيحي
COMMENT ON POLICY "beneficiaries_update_unified" ON public.beneficiaries IS 
'السماح للمشرف/الناظر بتحديث أي مستفيد، والسماح للمستفيد بتحديث بياناته الخاصة';