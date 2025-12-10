
-- إضافة سياسة RLS للورثة لقراءة الإفصاحات السنوية المنشورة
DROP POLICY IF EXISTS "Heirs can view published disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "Staff can manage disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "Allow read access to annual_disclosures" ON annual_disclosures;

-- سياسة للورثة: قراءة الإفصاحات المنشورة فقط
CREATE POLICY "Heirs can view published disclosures"
ON annual_disclosures FOR SELECT
TO authenticated
USING (
  status = 'published' AND (
    public.has_role(auth.uid(), 'waqf_heir') OR
    public.has_role(auth.uid(), 'beneficiary')
  )
);

-- سياسة للموظفين: كامل الصلاحيات
CREATE POLICY "Staff full access to disclosures"
ON annual_disclosures FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
);
