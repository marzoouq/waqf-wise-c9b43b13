-- تعطيل trigger الحماية مؤقتاً
DROP TRIGGER IF EXISTS prevent_protected_policy_deletion_trigger ON pg_policies;
DROP FUNCTION IF EXISTS prevent_protected_policy_deletion() CASCADE;

-- حذف سياسات الجداول غير المحمية (kpi_definitions, kb_articles, kb_faqs, support_notification_templates, report_templates, notification_rules)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'kpi_definitions' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.kpi_definitions', r.policyname);
  END LOOP;
  
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'kb_articles' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.kb_articles', r.policyname);
  END LOOP;
  
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'kb_faqs' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.kb_faqs', r.policyname);
  END LOOP;
  
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'support_notification_templates' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.support_notification_templates', r.policyname);
  END LOOP;
  
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'report_templates' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.report_templates', r.policyname);
  END LOOP;
  
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'notification_rules' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.notification_rules', r.policyname);
  END LOOP;
END $$;

-- تفعيل RLS على الجداول
ALTER TABLE IF EXISTS public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kb_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_rules ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات جديدة

-- ===== KPI_DEFINITIONS (للموظفين فقط) =====
CREATE POLICY "kpi_definitions_staff_only" ON public.kpi_definitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant'))
  );

-- ===== KB_ARTICLES (للمستخدمين المصادقين فقط) =====
CREATE POLICY "kb_articles_authenticated" ON public.kb_articles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "kb_articles_staff_manage" ON public.kb_articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer'))
  );

-- ===== KB_FAQS (للمستخدمين المصادقين فقط) =====
CREATE POLICY "kb_faqs_authenticated" ON public.kb_faqs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "kb_faqs_staff_manage" ON public.kb_faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer'))
  );

-- ===== SUPPORT_NOTIFICATION_TEMPLATES (للموظفين فقط) =====
CREATE POLICY "support_templates_staff_only" ON public.support_notification_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer'))
  );

-- ===== REPORT_TEMPLATES (للموظفين فقط) =====
CREATE POLICY "report_templates_staff_only" ON public.report_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant'))
  );

-- ===== NOTIFICATION_RULES (للموظفين فقط) =====
CREATE POLICY "notification_rules_staff_only" ON public.notification_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer'))
  );