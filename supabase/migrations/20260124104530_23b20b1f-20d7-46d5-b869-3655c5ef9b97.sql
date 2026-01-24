-- إصلاح سياسة SELECT للمستفيدين لتشمل دور beneficiary
DROP POLICY IF EXISTS beneficiaries_select_unified ON public.beneficiaries;

CREATE POLICY beneficiaries_select_unified ON public.beneficiaries
FOR SELECT
USING (
  is_staff_only()  -- الموظفين (admin, nazer, accountant, cashier, archivist)
  OR has_role(auth.uid(), 'beneficiary'::app_role)  -- ✅ إضافة دور المستفيد
  OR has_role(auth.uid(), 'waqf_heir'::app_role)  -- وريث الوقف
  OR (user_id = auth.uid())  -- المستفيد يرى بياناته فقط
);