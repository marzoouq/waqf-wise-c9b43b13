-- إصلاح دالة get_recent_query_errors لاستخدام جدول system_error_logs الصحيح
DROP FUNCTION IF EXISTS get_recent_query_errors(integer);

CREATE OR REPLACE FUNCTION get_recent_query_errors(p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  error_type text,
  error_message text,
  severity text,
  created_at timestamp with time zone,
  error_stack text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.error_type,
    e.error_message,
    e.severity,
    e.created_at,
    e.error_stack
  FROM system_error_logs e
  WHERE e.error_type ILIKE '%database%' 
    OR e.error_type ILIKE '%query%'
    OR e.error_type ILIKE '%sql%'
    OR e.error_message ILIKE '%column%does not exist%'
    OR e.error_message ILIKE '%relation%does not exist%'
    OR e.error_message ILIKE '%permission denied%'
    OR e.error_message ILIKE '%violates%constraint%'
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION get_recent_query_errors(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_query_errors(integer) TO anon;