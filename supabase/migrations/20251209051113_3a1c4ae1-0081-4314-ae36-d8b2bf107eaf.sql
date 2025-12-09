-- إضافة صلاحية القراءة لورثة الوقف على جدول documents
CREATE POLICY "waqf_heirs_can_view_documents"
ON public.documents
FOR SELECT
USING (has_role(auth.uid(), 'waqf_heir'::app_role));