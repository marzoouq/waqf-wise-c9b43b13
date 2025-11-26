
-- إصلاح المشاكل الأمنية: إزالة تعريض auth.users والـ SECURITY DEFINER من Views

-- 1. حذف الـ Views القديمة غير الآمنة
DROP VIEW IF EXISTS public.users_with_roles CASCADE;
DROP VIEW IF EXISTS public.active_user_sessions CASCADE;

-- 2. إنشاء جدول profiles_extended لتخزين بيانات المستخدمين بشكل آمن
-- بدلاً من الـ View الذي يكشف auth.users
CREATE TABLE IF NOT EXISTS public.users_profiles_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  user_created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  roles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. إنشاء Function آمن لتحديث cache المستخدمين
CREATE OR REPLACE FUNCTION public.refresh_user_profile_cache(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
  v_created_at TIMESTAMPTZ;
  v_last_sign_in TIMESTAMPTZ;
  v_full_name TEXT;
  v_phone TEXT;
  v_position TEXT;
  v_is_active BOOLEAN;
  v_last_login TIMESTAMPTZ;
  v_roles JSONB;
BEGIN
  -- جلب بيانات المستخدم من auth.users بشكل آمن
  SELECT email, created_at, last_sign_in_at
  INTO v_email, v_created_at, v_last_sign_in
  FROM auth.users
  WHERE id = p_user_id;

  -- جلب بيانات Profile
  SELECT full_name, phone, position, is_active, last_login_at
  INTO v_full_name, v_phone, v_position, v_is_active, v_last_login
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- جلب الأدوار
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('role', role, 'assigned_at', created_at)
    ),
    '[]'::jsonb
  )
  INTO v_roles
  FROM public.user_roles
  WHERE user_id = p_user_id;

  -- تحديث أو إدراج في الـ cache
  INSERT INTO public.users_profiles_cache (
    user_id, email, full_name, phone, position, is_active,
    last_login_at, user_created_at, last_sign_in_at, roles
  ) VALUES (
    p_user_id, v_email, v_full_name, v_phone, v_position,
    v_is_active, v_last_login, v_created_at, v_last_sign_in, v_roles
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    position = EXCLUDED.position,
    is_active = EXCLUDED.is_active,
    last_login_at = EXCLUDED.last_login_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    roles = EXCLUDED.roles,
    updated_at = now();
END;
$$;

-- 4. Trigger لتحديث الـ cache تلقائياً
CREATE OR REPLACE FUNCTION public.trigger_refresh_user_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_user_profile_cache(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- تطبيق Triggers على الجداول ذات الصلة
DROP TRIGGER IF EXISTS refresh_cache_on_profile_change ON public.profiles;
CREATE TRIGGER refresh_cache_on_profile_change
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_refresh_user_cache();

DROP TRIGGER IF EXISTS refresh_cache_on_role_change ON public.user_roles;
CREATE TRIGGER refresh_cache_on_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_refresh_user_cache();

-- 5. RLS للـ cache الجديد
ALTER TABLE public.users_profiles_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile cache"
ON public.users_profiles_cache FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profile caches"
ON public.users_profiles_cache FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

-- 6. إنشاء View آمن للجلسات النشطة (بدون auth.users)
CREATE VIEW public.safe_active_sessions WITH (security_invoker=true) AS
SELECT 
  s.id,
  s.user_id,
  c.email,
  c.full_name,
  s.ip_address,
  s.user_agent,
  s.device_info,
  s.started_at as created_at,
  s.last_activity_at,
  EXTRACT(EPOCH FROM (now() - s.last_activity_at))/60 as idle_minutes
FROM public.user_sessions s
LEFT JOIN public.users_profiles_cache c ON c.user_id = s.user_id
WHERE s.is_active = true
ORDER BY s.last_activity_at DESC;

-- 7. RLS للـ View الجديد
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

-- 8. منح الصلاحيات
GRANT SELECT ON public.users_profiles_cache TO authenticated;
GRANT SELECT ON public.safe_active_sessions TO authenticated;

-- 9. تحديث الـ cache الأولي لجميع المستخدمين الحاليين
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT user_id FROM public.profiles LOOP
    PERFORM public.refresh_user_profile_cache(rec.user_id);
  END LOOP;
END;
$$;

-- 10. تعليق توضيحي
COMMENT ON TABLE public.users_profiles_cache IS 'Cache آمن لبيانات المستخدمين بدون تعريض auth.users';
COMMENT ON VIEW public.safe_active_sessions IS 'View آمن للجلسات النشطة بدون SECURITY DEFINER';
