-- =====================================================
-- إضافة RLS لحماية بيانات الاتصال في landing_page_settings
-- =====================================================

-- تفعيل RLS على الجدول
ALTER TABLE IF EXISTS public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إذا وجدت
DROP POLICY IF EXISTS "Public can view landing page settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "Anyone can view landing page settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "Public can view non-sensitive landing settings" ON public.landing_page_settings;

-- سياسة القراءة للمستخدمين المصرح لهم فقط
CREATE POLICY "Authenticated users can view landing settings"
ON public.landing_page_settings
FOR SELECT
TO authenticated
USING (true);

-- سياسة التحديث للمسؤولين فقط
CREATE POLICY "Only admins can update landing page settings"
ON public.landing_page_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);

-- سياسة الإدراج للمسؤولين فقط  
CREATE POLICY "Only admins can insert landing page settings"
ON public.landing_page_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);

-- منح الصلاحيات للوظائف الموجودة
GRANT EXECUTE ON FUNCTION public.get_collection_percentage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_collected(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_expected_contract_revenue() TO authenticated;