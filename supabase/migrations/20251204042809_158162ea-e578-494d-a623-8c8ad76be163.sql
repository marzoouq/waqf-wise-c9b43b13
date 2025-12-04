-- إضافة سياسة لتمكين المستفيدين وورثة الوقف من رؤية بيانات إقفال السنوات المالية
CREATE POLICY "Beneficiaries and heirs can view fiscal year closings"
ON public.fiscal_year_closings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('beneficiary', 'waqf_heir')
  )
);