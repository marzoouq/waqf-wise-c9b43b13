-- =====================================================
-- إصلاح أمان waqf_branding و landing_page_settings
-- =====================================================

-- المرحلة 1: حذف السياسات المفتوحة لـ waqf_branding
DROP POLICY IF EXISTS "authenticated_can_view_waqf_branding" ON waqf_branding;
DROP POLICY IF EXISTS "public_can_view_basic_branding" ON waqf_branding;

-- المرحلة 2: إنشاء سياسة SELECT للموظفين + المستفيدين من الدرجة الأولى
CREATE POLICY "staff_and_first_class_view_waqf_branding"
ON waqf_branding
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'archivist', 'cashier')
  )
  OR
  public.is_first_class_beneficiary()
);

-- المرحلة 3: إضافة سياسة UPDATE للـ admin و nazer فقط
CREATE POLICY "staff_update_waqf_branding"
ON waqf_branding
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);

-- المرحلة 4: تحديث View العامة لتشمل nazer_name
DROP VIEW IF EXISTS waqf_branding_public;

CREATE VIEW waqf_branding_public
WITH (security_invoker = true)
AS SELECT 
    id,
    nazer_name,
    waqf_logo_url,
    show_logo_in_pdf,
    created_at,
    updated_at
FROM waqf_branding;

-- منح صلاحية القراءة على الـ View
GRANT SELECT ON waqf_branding_public TO anon, authenticated;

-- المرحلة 5: حذف السياسات المتضاربة لـ landing_page_settings
DROP POLICY IF EXISTS "Authenticated users can view landing settings" ON landing_page_settings;
DROP POLICY IF EXISTS "Landing settings are viewable by everyone" ON landing_page_settings;
DROP POLICY IF EXISTS "staff_or_heir_view_landing_settings" ON landing_page_settings;
DROP POLICY IF EXISTS "staff_read_all_settings" ON landing_page_settings;