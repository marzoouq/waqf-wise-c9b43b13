-- =====================================================
-- المرحلة 1: إنشاء 6 دوال محسّنة للتحقق من الأدوار
-- =====================================================

-- 1. دالة is_admin: للتحقق من دور المسؤول فقط
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
$$;

-- 2. دالة is_admin_or_nazer: للتحقق من دور المسؤول أو الناظر (تحديث الموجودة)
CREATE OR REPLACE FUNCTION public.is_admin_or_nazer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role)
  )
$$;

-- 3. دالة is_financial_staff: للموظفين الماليين (admin, nazer, accountant)
CREATE OR REPLACE FUNCTION public.is_financial_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role)
  )
$$;

-- 4. دالة has_staff_access: لجميع الموظفين (5 أدوار) - تحديث الموجودة
CREATE OR REPLACE FUNCTION public.has_staff_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'cashier'::app_role, 'archivist'::app_role)
  )
$$;

-- 5. دالة has_full_read_access: للموظفين والورثة - تحديث الموجودة
CREATE OR REPLACE FUNCTION public.has_full_read_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'cashier'::app_role, 'archivist'::app_role, 'waqf_heir'::app_role)
  )
$$;

-- 6. دالة is_beneficiary: للمستفيد فقط
CREATE OR REPLACE FUNCTION public.is_beneficiary()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'beneficiary'::app_role
  )
$$;

-- إضافة تعليقات للدوال
COMMENT ON FUNCTION public.is_admin() IS 'يتحقق إذا كان المستخدم الحالي مسؤولاً';
COMMENT ON FUNCTION public.is_admin_or_nazer() IS 'يتحقق إذا كان المستخدم الحالي مسؤولاً أو ناظراً';
COMMENT ON FUNCTION public.is_financial_staff() IS 'يتحقق إذا كان المستخدم موظفاً مالياً (مسؤول/ناظر/محاسب)';
COMMENT ON FUNCTION public.has_staff_access() IS 'يتحقق إذا كان المستخدم أي نوع من الموظفين';
COMMENT ON FUNCTION public.has_full_read_access() IS 'يتحقق إذا كان المستخدم له صلاحية قراءة كاملة (موظفين + ورثة)';
COMMENT ON FUNCTION public.is_beneficiary() IS 'يتحقق إذا كان المستخدم مستفيداً';