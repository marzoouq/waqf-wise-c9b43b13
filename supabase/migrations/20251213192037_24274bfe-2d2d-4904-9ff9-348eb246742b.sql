-- إضافة سياسات RLS للجداول المكشوفة

-- 1. kb_articles - مقالات قاعدة المعرفة
ALTER TABLE IF EXISTS kb_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_kb_articles" ON kb_articles;
CREATE POLICY "authenticated_read_kb_articles" ON kb_articles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "staff_manage_kb_articles" ON kb_articles;
CREATE POLICY "staff_manage_kb_articles" ON kb_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'nazer')
    )
  );

-- 2. kb_faqs - الأسئلة الشائعة
ALTER TABLE IF EXISTS kb_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_kb_faqs" ON kb_faqs;
CREATE POLICY "authenticated_read_kb_faqs" ON kb_faqs
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "staff_manage_kb_faqs" ON kb_faqs;
CREATE POLICY "staff_manage_kb_faqs" ON kb_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'nazer')
    )
  );

-- 3. support_notification_templates - قوالب الإشعارات
ALTER TABLE IF EXISTS support_notification_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_notification_templates" ON support_notification_templates;
CREATE POLICY "authenticated_read_notification_templates" ON support_notification_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "staff_manage_notification_templates" ON support_notification_templates;
CREATE POLICY "staff_manage_notification_templates" ON support_notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'nazer')
    )
  );