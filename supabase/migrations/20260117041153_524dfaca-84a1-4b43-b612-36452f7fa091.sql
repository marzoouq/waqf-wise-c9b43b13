
-- ============================================
-- إصلاح أمان waqf_branding - فصل البيانات الحساسة
-- ============================================

-- 1. إنشاء سياسة للموظفين فقط للوصول الكامل (بما في ذلك التوقيع والختم)
CREATE POLICY "staff_full_access_waqf_branding"
ON waqf_branding FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'archivist')
  )
);

-- 2. إنشاء View آمن للبيانات العامة فقط (بدون التوقيع والختم)
CREATE OR REPLACE VIEW public.waqf_branding_public
WITH (security_invoker = true)
AS SELECT 
  id,
  waqf_logo_url,
  show_logo_in_pdf,
  created_at,
  updated_at
FROM waqf_branding;
-- ملاحظة: تم استبعاد nazer_name, signature_image_url, stamp_image_url, show_stamp_in_pdf

-- 3. منح صلاحيات القراءة للـ View للمستخدمين المجهولين والمصادق عليهم
GRANT SELECT ON public.waqf_branding_public TO anon;
GRANT SELECT ON public.waqf_branding_public TO authenticated;

-- 4. سياسة للسماح بتحديث البراندنج للناظر والأدمن فقط
DROP POLICY IF EXISTS "staff_can_update_waqf_branding" ON waqf_branding;
CREATE POLICY "nazer_admin_can_update_waqf_branding"
ON waqf_branding FOR UPDATE
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
