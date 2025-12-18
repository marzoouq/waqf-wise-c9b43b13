
-- Batch 12 retry: Without internal_messages recipient_id issue

-- identity_verifications
DROP POLICY IF EXISTS "staff_manage_identity_verifications" ON public.identity_verifications;
CREATE POLICY "staff_identity_verifications" ON public.identity_verifications
FOR ALL TO authenticated
USING (has_staff_access());

-- internal_messages - staff only
DROP POLICY IF EXISTS "internal_messages_participants_or_staff" ON public.internal_messages;
CREATE POLICY "internal_messages_access" ON public.internal_messages
FOR ALL TO authenticated
USING (has_staff_access() OR sender_id = auth.uid());

-- kb_articles
DROP POLICY IF EXISTS "kb_articles_staff_manage" ON public.kb_articles;
CREATE POLICY "staff_kb_articles" ON public.kb_articles
FOR ALL TO authenticated
USING (has_staff_access());

-- kb_faqs
DROP POLICY IF EXISTS "kb_faqs_staff_manage" ON public.kb_faqs;
CREATE POLICY "staff_kb_faqs" ON public.kb_faqs
FOR ALL TO authenticated
USING (has_staff_access());

-- knowledge_articles
DROP POLICY IF EXISTS "knowledge_articles_staff_manage" ON public.knowledge_articles;
CREATE POLICY "staff_knowledge_articles" ON public.knowledge_articles
FOR ALL TO authenticated
USING (has_staff_access());

-- kpi_definitions
DROP POLICY IF EXISTS "kpi_definitions_staff_only" ON public.kpi_definitions;
CREATE POLICY "staff_kpi_definitions" ON public.kpi_definitions
FOR ALL TO authenticated
USING (has_staff_access());
