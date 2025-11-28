
-- إنشاء جدول قاعدة المعرفة
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  author_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
DROP POLICY IF EXISTS "knowledge_articles_read_all" ON public.knowledge_articles;
CREATE POLICY "knowledge_articles_read_all" ON public.knowledge_articles FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "knowledge_articles_write_admin" ON public.knowledge_articles;
CREATE POLICY "knowledge_articles_write_admin" ON public.knowledge_articles FOR ALL USING (true);

-- إضافة مقالات
INSERT INTO public.knowledge_articles (title, content, category, tags) VALUES
('كيفية تقديم طلب فزعة', 'خطوات تقديم طلب الفزعة الطارئة', 'requests', ARRAY['فزعة', 'طلب']),
('شرح نظام التوزيعات', 'يتم توزيع غلة الوقف وفق شروط الواقف', 'distributions', ARRAY['توزيعات', 'غلة']),
('الأسئلة الشائعة', 'س: كيف أحدث بياناتي؟ ج: تواصل مع إدارة الوقف', 'faq', ARRAY['أسئلة', 'مساعدة']),
('دليل استخدام النظام', 'مرحباً بك في نظام إدارة الوقف', 'guides', ARRAY['دليل', 'تعليمات']);
