-- إصلاح جدول knowledge_articles - للمستخدمين المصادقين فقط
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'knowledge_articles' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.knowledge_articles', r.policyname);
  END LOOP;
END $$;

ALTER TABLE IF EXISTS public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للمستخدمين المصادقين فقط
CREATE POLICY "knowledge_articles_authenticated_read" ON public.knowledge_articles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- السماح بالإدارة للموظفين
CREATE POLICY "knowledge_articles_staff_manage" ON public.knowledge_articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer'))
  );