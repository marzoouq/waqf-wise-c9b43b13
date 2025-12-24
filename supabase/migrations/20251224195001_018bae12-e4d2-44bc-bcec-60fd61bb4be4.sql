-- =============================================
-- المرحلة 1: إنشاء دوال الكاش المحسّنة
-- =============================================

-- 1.1 دالة لتخزين أدوار المستخدم في الجلسة
CREATE OR REPLACE FUNCTION public.cache_user_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _is_admin boolean;
  _is_nazer boolean;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN;
  END IF;
  
  SELECT 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'::app_role),
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'nazer'::app_role)
  INTO _is_admin, _is_nazer;
  
  PERFORM set_config('app.is_admin', COALESCE(_is_admin, false)::text, true);
  PERFORM set_config('app.is_nazer', COALESCE(_is_nazer, false)::text, true);
END;
$$;

-- 1.2 تحديث is_admin() لاستخدام الكاش
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE PARALLEL SAFE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.is_admin', true), '')::boolean,
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  )
$$;

-- 1.3 تحديث is_admin_or_nazer() لاستخدام الكاش
CREATE OR REPLACE FUNCTION public.is_admin_or_nazer()
RETURNS boolean
LANGUAGE sql
STABLE PARALLEL SAFE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.is_admin', true), '')::boolean,
    false
  ) OR COALESCE(
    NULLIF(current_setting('app.is_nazer', true), '')::boolean,
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin'::app_role, 'nazer'::app_role)
    )
  )
$$;

-- 1.4 تحديث has_role() لاستخدام الكاش
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN _user_id = auth.uid() AND _role = 'admin'::app_role THEN
      COALESCE(NULLIF(current_setting('app.is_admin', true), '')::boolean, 
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role))
    WHEN _user_id = auth.uid() AND _role = 'nazer'::app_role THEN
      COALESCE(NULLIF(current_setting('app.is_nazer', true), '')::boolean,
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role))
    ELSE
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
  END
$$;

-- =============================================
-- المرحلة 2: حذف الفهارس المكررة
-- =============================================

DROP INDEX IF EXISTS idx_user_roles_user_role;
DROP INDEX IF EXISTS idx_user_roles_role_only;