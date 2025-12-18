-- دوال مراقبة أداء قاعدة البيانات
-- Database Performance Monitoring Functions

-- دالة جلب إحصائيات Sequential Scans
CREATE OR REPLACE FUNCTION public.get_table_scan_stats()
RETURNS TABLE (
  table_name text,
  seq_scan bigint,
  idx_scan bigint,
  seq_pct numeric,
  dead_rows bigint,
  live_rows bigint
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    schemaname || '.' || relname as table_name,
    COALESCE(seq_scan, 0) as seq_scan,
    COALESCE(idx_scan, 0) as idx_scan,
    CASE 
      WHEN COALESCE(seq_scan, 0) + COALESCE(idx_scan, 0) = 0 THEN 0
      ELSE ROUND((COALESCE(seq_scan, 0)::numeric / (COALESCE(seq_scan, 0) + COALESCE(idx_scan, 0))) * 100, 2)
    END as seq_pct,
    COALESCE(n_dead_tup, 0) as dead_rows,
    COALESCE(n_live_tup, 0) as live_rows
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY seq_scan DESC NULLS LAST
  LIMIT 50;
$$;

-- دالة جلب نسبة Cache Hit
CREATE OR REPLACE FUNCTION public.get_cache_hit_ratio()
RETURNS TABLE (cache_hit_ratio numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(
      CASE 
        WHEN blks_hit + blks_read = 0 THEN 100
        ELSE (blks_hit::numeric / (blks_hit + blks_read)) * 100
      END, 
      4
    ) as cache_hit_ratio
  FROM pg_stat_database
  WHERE datname = current_database();
$$;

-- دالة جلب إحصائيات الاتصالات
CREATE OR REPLACE FUNCTION public.get_connection_stats()
RETURNS TABLE (
  state text,
  count bigint,
  max_idle_seconds numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(state, 'unknown') as state,
    COUNT(*) as count,
    COALESCE(MAX(EXTRACT(EPOCH FROM (now() - state_change))), 0) as max_idle_seconds
  FROM pg_stat_activity
  WHERE datname = current_database()
  GROUP BY state;
$$;

-- دالة جلب حجم قاعدة البيانات
CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS TABLE (size_mb numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 2) as size_mb;
$$;