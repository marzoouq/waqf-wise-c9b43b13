-- إصلاح View user_profile_with_roles ليستخدم user_id بشكل صحيح
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
    SELECT json_agg(json_build_object('role', ur.role))
    FROM public.user_roles ur
    WHERE ur.user_id = p.user_id
  ) AS user_roles
FROM public.profiles p;