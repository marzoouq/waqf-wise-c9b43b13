-- Fix security issue: Recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS public.recent_activities;

CREATE VIEW public.recent_activities 
WITH (security_invoker = true) AS
SELECT 
  id,
  COALESCE(description, action_type || ' في جدول ' || table_name) as action,
  COALESCE(user_email, 'النظام') as user_name,
  created_at as timestamp,
  created_at
FROM public.audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 100;

COMMENT ON VIEW public.recent_activities IS 'عرض للأنشطة الحديثة مأخوذة من سجل التدقيق مع صلاحيات المستخدم الحالي';

-- Grant appropriate permissions
GRANT SELECT ON public.recent_activities TO authenticated;
GRANT SELECT ON public.recent_activities TO service_role;