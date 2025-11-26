-- إنشاء Views للتقارير

DROP VIEW IF EXISTS public.users_with_roles;
CREATE VIEW public.users_with_roles AS
SELECT 
  u.id, u.email, u.created_at as user_created_at, u.last_sign_in_at,
  p.full_name, p.phone, p.position, p.is_active, p.last_login_at,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object('role', ur.role, 'assigned_at', ur.created_at)
    ) FILTER (WHERE ur.role IS NOT NULL),
    '[]'
  ) as roles
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, 
         p.full_name, p.phone, p.position, p.is_active, p.last_login_at;

DROP VIEW IF EXISTS public.active_user_sessions;
CREATE VIEW public.active_user_sessions AS
SELECT 
  s.id, s.user_id, u.email, p.full_name, s.ip_address, s.user_agent,
  s.device_info, s.started_at as created_at, s.last_activity_at,
  EXTRACT(EPOCH FROM (now() - s.last_activity_at))/60 as idle_minutes
FROM public.user_sessions s
JOIN auth.users u ON u.id = s.user_id
LEFT JOIN public.profiles p ON p.user_id = s.user_id
WHERE s.is_active = true
ORDER BY s.last_activity_at DESC;

GRANT SELECT ON public.users_with_roles TO authenticated;
GRANT SELECT ON public.active_user_sessions TO authenticated;