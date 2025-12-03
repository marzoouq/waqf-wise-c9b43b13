-- إصلاح سياسة knowledge_articles بدون عمود status
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read knowledge_articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Authenticated read knowledge_articles" ON public.knowledge_articles;

CREATE POLICY "Authenticated read knowledge_articles"
ON public.knowledge_articles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff manage knowledge_articles"
ON public.knowledge_articles FOR ALL
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- تأمين landing_page_settings - إعدادات الصفحة الرئيسية
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read landing_settings" ON public.landing_page_settings;

CREATE POLICY "Public read landing_settings"
ON public.landing_page_settings FOR SELECT
USING (true);

CREATE POLICY "Admin manage landing_settings"
ON public.landing_page_settings FOR ALL
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());