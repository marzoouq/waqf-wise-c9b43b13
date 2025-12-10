-- إضافة سياسة الحذف للناظر والمحاسب
DROP POLICY IF EXISTS "Staff can delete disclosures" ON annual_disclosures;

CREATE POLICY "Staff can delete disclosures"
ON annual_disclosures FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
);