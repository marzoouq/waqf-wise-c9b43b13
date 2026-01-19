-- إصلاح التحذيرات الأمنية المكتشفة

-- 1. تقييد سياسة chatbot_quick_replies للموظفين فقط
DROP POLICY IF EXISTS "Anyone authenticated can view active quick replies" ON chatbot_quick_replies;

CREATE POLICY "Staff can view active quick replies"
ON chatbot_quick_replies
FOR SELECT
USING (
  is_active = true 
  AND (
    is_admin_or_nazer() 
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'nazer', 'accountant', 'archivist')
    )
  )
);

-- 2. تقييد سياسة landing_page_settings للمصادقين فقط للإعدادات العامة
DROP POLICY IF EXISTS "anon_view_public_settings_only" ON landing_page_settings;

-- سياسة للمستخدمين المصادقين فقط (للإعدادات العامة الآمنة)
CREATE POLICY "authenticated_view_public_settings"
ON landing_page_settings
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND setting_key = ANY(ARRAY[
    'hero_title', 
    'hero_subtitle', 
    'footer_description',
    'social_twitter',
    'social_linkedin',
    'social_facebook',
    'faq_items',
    'privacy_policy',
    'terms_of_service'
  ])
);

-- سياسة للموظفين لرؤية جميع الإعدادات
DROP POLICY IF EXISTS "staff_manage_landing_settings" ON landing_page_settings;

CREATE POLICY "staff_manage_all_landing_settings"
ON landing_page_settings
FOR ALL
USING (is_admin_or_nazer())
WITH CHECK (is_admin_or_nazer());