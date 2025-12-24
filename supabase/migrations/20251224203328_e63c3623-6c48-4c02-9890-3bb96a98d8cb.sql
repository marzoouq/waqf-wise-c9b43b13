-- إنشاء دالة مراقبة الاتصالات الخاملة
CREATE OR REPLACE FUNCTION public.get_idle_connections()
RETURNS TABLE(
  pid integer,
  state text,
  idle_hours numeric,
  application_name text,
  client_addr text,
  query_start timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pid::integer,
    state::text,
    ROUND(EXTRACT(EPOCH FROM (now() - state_change))/3600, 2) as idle_hours,
    COALESCE(application_name, 'unknown')::text,
    COALESCE(client_addr::text, 'local') as client_addr,
    query_start
  FROM pg_stat_activity
  WHERE state = 'idle' 
  AND state_change < current_timestamp - interval '30 minutes'
  ORDER BY state_change ASC;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.get_idle_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_idle_connections() TO service_role;