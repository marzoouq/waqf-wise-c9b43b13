
-- Batch 10: disclosure & distribution tables

-- disclosure_documents
DROP POLICY IF EXISTS "Heirs can view disclosure documents" ON public.disclosure_documents;
DROP POLICY IF EXISTS "Staff can manage disclosure documents" ON public.disclosure_documents;
CREATE POLICY "disclosure_docs_access" ON public.disclosure_documents
FOR ALL TO authenticated
USING (is_financial_staff() OR is_heir());

-- distribution_approvals
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة موافقات ا" ON public.distribution_approvals;
CREATE POLICY "distribution_approvals_access" ON public.distribution_approvals
FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

-- distribution_details
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة تفاصيل ال" ON public.distribution_details;
CREATE POLICY "distribution_details_access" ON public.distribution_details
FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

-- document_ocr_content
DROP POLICY IF EXISTS "staff_manage_ocr_content" ON public.document_ocr_content;
CREATE POLICY "staff_ocr_content" ON public.document_ocr_content
FOR ALL TO authenticated
USING (has_staff_access());

-- document_tags
DROP POLICY IF EXISTS "Admins can manage document tags" ON public.document_tags;
CREATE POLICY "admin_document_tags" ON public.document_tags
FOR ALL TO authenticated
USING (is_admin());

-- document_versions
DROP POLICY IF EXISTS "archivist_manage_document_versions" ON public.document_versions;
CREATE POLICY "staff_document_versions" ON public.document_versions
FOR ALL TO authenticated
USING (has_staff_access());

-- documentation_changelog
DROP POLICY IF EXISTS "Allow nazer and admin to view changelog" ON public.documentation_changelog;
CREATE POLICY "admin_changelog" ON public.documentation_changelog
FOR SELECT TO authenticated
USING (is_admin());
