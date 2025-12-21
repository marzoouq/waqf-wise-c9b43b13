-- إصلاح دالة get_system_stats لحل خطأ 'column reference "oid" is ambiguous'
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'tables_count', (SELECT count(*) FROM pg_tables WHERE schemaname = 'public'),
    'functions_count', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public'),
    'policies_count', (SELECT count(*) FROM pg_policies WHERE schemaname = 'public'),
    'indexes_count', (
      SELECT count(*) 
      FROM pg_index ix 
      JOIN pg_class t ON t.oid = ix.indrelid 
      JOIN pg_namespace n ON n.oid = t.relnamespace 
      WHERE n.nspname = 'public'
    ),
    'database_size', pg_database_size(current_database()),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'tables_without_rls', (
      SELECT count(*) 
      FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
    ),
    'largest_tables', (
      SELECT jsonb_agg(jsonb_build_object('name', sub.table_name, 'size', sub.table_size))
      FROM (
        SELECT c.relname AS table_name, pg_total_relation_size(c.oid) AS table_size
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
        ORDER BY pg_total_relation_size(c.oid) DESC
        LIMIT 10
      ) sub
    )
  ) INTO result;
  RETURN result;
END;
$$;