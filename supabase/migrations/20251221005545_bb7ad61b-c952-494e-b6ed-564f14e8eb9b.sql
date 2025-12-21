-- 1. get_table_info() - جلب معلومات الجداول مع حالة RLS
CREATE OR REPLACE FUNCTION public.get_table_info()
RETURNS TABLE (
  table_name text,
  table_schema text,
  row_count bigint,
  has_rls boolean,
  size_bytes bigint
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.relname::text as table_name,
    n.nspname::text as table_schema,
    c.reltuples::bigint as row_count,
    c.relrowsecurity as has_rls,
    pg_total_relation_size(c.oid)::bigint as size_bytes
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY c.relname;
$$;

-- 2. get_rls_policies() - جلب سياسات RLS
CREATE OR REPLACE FUNCTION public.get_rls_policies()
RETURNS TABLE (
  tablename text,
  policyname text,
  permissive text,
  roles text[],
  cmd text,
  qual text,
  with_check text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    schemaname || '.' || tablename as tablename,
    policyname::text,
    permissive::text,
    roles::text[],
    cmd::text,
    qual::text,
    with_check::text
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
$$;

-- 3. get_indexes() - جلب الفهارس
CREATE OR REPLACE FUNCTION public.get_indexes()
RETURNS TABLE (
  table_name text,
  index_name text,
  index_definition text,
  is_primary boolean,
  is_unique boolean,
  size_bytes bigint
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.relname::text as table_name,
    i.relname::text as index_name,
    pg_get_indexdef(i.oid)::text as index_definition,
    ix.indisprimary as is_primary,
    ix.indisunique as is_unique,
    pg_relation_size(i.oid)::bigint as size_bytes
  FROM pg_index ix
  JOIN pg_class t ON t.oid = ix.indrelid
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
  ORDER BY t.relname, i.relname;
$$;

-- 4. get_system_stats() - إحصائيات النظام الشاملة
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
    'indexes_count', (SELECT count(*) FROM pg_index ix JOIN pg_class t ON t.oid = ix.indrelid JOIN pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'public'),
    'database_size', pg_database_size(current_database()),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'tables_without_rls', (
      SELECT count(*) FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
    ),
    'largest_tables', (
      SELECT jsonb_agg(jsonb_build_object('name', relname, 'size', pg_total_relation_size(oid)))
      FROM (
        SELECT relname, oid 
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
        ORDER BY pg_total_relation_size(c.oid) DESC
        LIMIT 10
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- إضافة تعليقات للتوثيق
COMMENT ON FUNCTION public.get_table_info() IS 'جلب معلومات الجداول العامة مع حالة RLS وحجم الجدول';
COMMENT ON FUNCTION public.get_rls_policies() IS 'جلب جميع سياسات RLS المعرفة في الـ public schema';
COMMENT ON FUNCTION public.get_indexes() IS 'جلب جميع الفهارس مع تعريفاتها وأحجامها';
COMMENT ON FUNCTION public.get_system_stats() IS 'إحصائيات شاملة عن قاعدة البيانات';