-- إصلاح التحذير الأمني: إزالة SECURITY DEFINER من الـ view
-- وإنشاء view بسيط بدون SECURITY DEFINER

DROP VIEW IF EXISTS public.user_profile_with_roles;

-- إنشاء view عادي (بدون SECURITY DEFINER)
CREATE OR REPLACE VIEW public.user_profile_with_roles AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.avatar_url,
  p.is_active,
  p.last_login_at,
  p.created_at,
  p.updated_at,
  p.position,
  p.user_id,
  (
    SELECT json_agg(ur.role)
    FROM public.user_roles ur
    WHERE ur.user_id = p.id
  ) as user_roles
FROM public.profiles p;

-- RLS للـ view
ALTER VIEW public.user_profile_with_roles SET (security_invoker = true);