-- Create a view for recent_activities from audit_logs
CREATE OR REPLACE VIEW public.recent_activities AS
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

COMMENT ON VIEW public.recent_activities IS 'عرض للأنشطة الحديثة مأخوذة من سجل التدقيق';