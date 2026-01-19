
-- ======================================
-- إصلاح سياسات landing_page_settings
-- توحيد السياسات المتضاربة وتحسين الأمان
-- ======================================

-- حذف جميع السياسات الحالية المتضاربة
DROP POLICY IF EXISTS "Admin manage landing_settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "Admins can manage landing settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "Only admins can insert landing page settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "Only admins can update landing page settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "admin_can_delete_landing_settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "admin_can_insert_landing_settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "admin_can_update_landing_settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "public_read_safe_landing_settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "public_read_safe_settings_whitelist" ON public.landing_page_settings;
DROP POLICY IF EXISTS "staff_full_read_landing_settings" ON public.landing_page_settings;

-- ======================================
-- سياسات موحدة وآمنة
-- ======================================

-- 1. الموظفون المصادقون يمكنهم قراءة جميع الإعدادات
CREATE POLICY "authenticated_staff_view_all_settings"
  ON public.landing_page_settings
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'archivist'::app_role, 'cashier'::app_role])
    )
  );

-- 2. الزوار غير المصادقين يمكنهم قراءة فقط الإعدادات العامة الآمنة (whitelist صارمة)
CREATE POLICY "anon_view_public_settings_only"
  ON public.landing_page_settings
  FOR SELECT
  USING (
    auth.uid() IS NULL AND 
    is_active = true AND 
    setting_key = ANY(ARRAY[
      'hero_title', 'hero_subtitle', 'footer_description',
      'social_twitter', 'social_linkedin', 'social_facebook', 'social_instagram',
      'faq_items', 'privacy_policy', 'terms_of_use', 'security_policy'
    ])
  );

-- 3. المستخدمون المصادقون العاديون (مستفيدين/مستأجرين) يقرأون الإعدادات العامة فقط
CREATE POLICY "authenticated_users_view_public_settings"
  ON public.landing_page_settings
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    NOT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = ANY(ARRAY['admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'archivist'::app_role, 'cashier'::app_role])
    ) AND
    is_active = true AND 
    setting_key = ANY(ARRAY[
      'hero_title', 'hero_subtitle', 'footer_description',
      'social_twitter', 'social_linkedin', 'social_facebook', 'social_instagram',
      'faq_items', 'privacy_policy', 'terms_of_use', 'security_policy'
    ])
  );

-- 4. المشرفون فقط يمكنهم إضافة/تعديل/حذف الإعدادات
CREATE POLICY "admin_manage_settings"
  ON public.landing_page_settings
  FOR ALL
  USING (public.is_admin_or_nazer())
  WITH CHECK (public.is_admin_or_nazer());
