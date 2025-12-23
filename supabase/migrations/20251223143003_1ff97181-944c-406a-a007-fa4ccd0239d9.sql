-- =============================================
-- خطة الإصلاح الأمني - المرحلة 1
-- إصلاح 4 مشاكل أمنية مكتشفة
-- =============================================

-- 1. إنشاء دالة has_role إذا لم تكن موجودة (للتحقق من الصلاحيات بأمان)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- 2. إضافة RLS على جدول governance_boards
ALTER TABLE IF EXISTS public.governance_boards ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "staff_can_view_boards" ON public.governance_boards;
DROP POLICY IF EXISTS "admin_can_manage_boards" ON public.governance_boards;

-- إنشاء سياسات جديدة
CREATE POLICY "staff_can_view_boards" ON public.governance_boards
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'nazer') OR
    public.has_role(auth.uid(), 'accountant') OR
    public.has_role(auth.uid(), 'archivist')
  );

CREATE POLICY "admin_can_insert_boards" ON public.governance_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'nazer')
  );

CREATE POLICY "admin_can_update_boards" ON public.governance_boards
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'nazer')
  );

CREATE POLICY "admin_can_delete_boards" ON public.governance_boards
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

-- 3. إضافة RLS على جدول request_types
ALTER TABLE IF EXISTS public.request_types ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "authenticated_can_view_request_types" ON public.request_types;
DROP POLICY IF EXISTS "admin_can_manage_request_types" ON public.request_types;

-- إنشاء سياسات جديدة
CREATE POLICY "authenticated_can_view_request_types" ON public.request_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_can_insert_request_types" ON public.request_types
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "admin_can_update_request_types" ON public.request_types
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "admin_can_delete_request_types" ON public.request_types
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

-- 4. إضافة RLS على جدول landing_page_settings (حماية بيانات الاتصال)
ALTER TABLE IF EXISTS public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "anyone_can_view_landing_settings" ON public.landing_page_settings;
DROP POLICY IF EXISTS "admin_can_manage_landing_settings" ON public.landing_page_settings;

-- السماح للجميع بقراءة الإعدادات العامة (بيانات تسويقية)
CREATE POLICY "anyone_can_view_landing_settings" ON public.landing_page_settings
  FOR SELECT
  USING (true);

-- فقط المسؤولين يمكنهم التعديل
CREATE POLICY "admin_can_insert_landing_settings" ON public.landing_page_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "admin_can_update_landing_settings" ON public.landing_page_settings
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "admin_can_delete_landing_settings" ON public.landing_page_settings
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );