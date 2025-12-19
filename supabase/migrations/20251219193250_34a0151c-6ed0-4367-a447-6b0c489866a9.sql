-- =====================================================
-- إنشاء دوال RPC لصحة قاعدة البيانات
-- Database Health RPC Functions
-- =====================================================

-- دالة لاسترجاع الفهارس المكررة
CREATE OR REPLACE FUNCTION public.get_duplicate_indexes()
RETURNS TABLE(
  table_name text,
  index1 text,
  index2 text,
  column_definition text,
  index1_size text,
  index2_size text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH index_info AS (
    SELECT 
      i.tablename::text as tbl,
      i.indexname::text as idx,
      i.indexdef::text as def,
      pg_size_pretty(pg_relation_size(quote_ident(i.schemaname) || '.' || quote_ident(i.indexname))) as idx_size,
      -- Extract column list from index definition
      regexp_replace(i.indexdef, '^.*\((.*)\)$', '\1') as cols
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
  )
  SELECT 
    a.tbl as table_name,
    a.idx as index1,
    b.idx as index2,
    a.cols as column_definition,
    a.idx_size as index1_size,
    b.idx_size as index2_size
  FROM index_info a
  JOIN index_info b ON a.tbl = b.tbl 
    AND a.cols = b.cols 
    AND a.idx < b.idx
  ORDER BY a.tbl, a.idx;
END;
$$;

-- دالة لاسترجاع سياسات RLS المكررة
CREATE OR REPLACE FUNCTION public.get_duplicate_rls_policies()
RETURNS TABLE(
  table_name text,
  policy1 text,
  policy2 text,
  command text,
  policy1_qual text,
  policy2_qual text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.tablename::text as table_name,
    a.policyname::text as policy1,
    b.policyname::text as policy2,
    a.cmd::text as command,
    a.qual::text as policy1_qual,
    b.qual::text as policy2_qual
  FROM pg_policies a
  JOIN pg_policies b ON a.tablename = b.tablename 
    AND a.cmd = b.cmd
    AND a.qual = b.qual
    AND a.policyname < b.policyname
    AND a.schemaname = 'public'
    AND b.schemaname = 'public'
  ORDER BY a.tablename, a.policyname;
END;
$$;

-- دالة لاسترجاع نسبة الصفوف الميتة لكل جدول
CREATE OR REPLACE FUNCTION public.get_dead_rows_percentage()
RETURNS TABLE(
  table_name text,
  live_rows bigint,
  dead_rows bigint,
  dead_pct numeric,
  last_vacuum timestamptz,
  last_autovacuum timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.relname::text as table_name,
    s.n_live_tup as live_rows,
    s.n_dead_tup as dead_rows,
    CASE 
      WHEN s.n_live_tup + s.n_dead_tup > 0 
      THEN ROUND((s.n_dead_tup::numeric / (s.n_live_tup + s.n_dead_tup)::numeric) * 100, 2)
      ELSE 0 
    END as dead_pct,
    s.last_vacuum,
    s.last_autovacuum
  FROM pg_stat_user_tables s
  WHERE s.schemaname = 'public'
    AND s.n_dead_tup > 0
  ORDER BY s.n_dead_tup DESC;
END;
$$;

-- دالة لاسترجاع أخطاء الاستعلامات الأخيرة (من system_errors)
CREATE OR REPLACE FUNCTION public.get_recent_query_errors(p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  error_type text,
  error_message text,
  severity text,
  created_at timestamptz,
  error_stack text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  FROM system_errors e
  WHERE e.error_type ILIKE '%database%' 
    OR e.error_type ILIKE '%query%'
    OR e.error_type ILIKE '%sql%'
    OR e.error_message ILIKE '%column%does not exist%'
    OR e.error_message ILIKE '%relation%does not exist%'
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$;

-- دالة لاسترجاع ملخص صحة قاعدة البيانات
CREATE OR REPLACE FUNCTION public.get_database_health_summary()
RETURNS TABLE(
  total_tables integer,
  total_indexes integer,
  duplicate_indexes integer,
  duplicate_policies integer,
  tables_with_dead_rows integer,
  total_dead_rows bigint,
  db_size_mb numeric,
  cache_hit_ratio numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cache_ratio numeric;
BEGIN
  -- Get cache hit ratio
  SELECT 
    ROUND(
      100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0),
      2
    )
  INTO v_cache_ratio
  FROM pg_statio_user_tables;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM pg_stat_user_tables WHERE schemaname = 'public') as total_tables,
    (SELECT COUNT(*)::integer FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*)::integer FROM (
      SELECT 1 FROM public.get_duplicate_indexes() LIMIT 100
    ) di) as duplicate_indexes,
    (SELECT COUNT(*)::integer FROM (
      SELECT 1 FROM public.get_duplicate_rls_policies() LIMIT 100
    ) dp) as duplicate_policies,
    (SELECT COUNT(*)::integer FROM pg_stat_user_tables WHERE n_dead_tup > 0 AND schemaname = 'public') as tables_with_dead_rows,
    (SELECT COALESCE(SUM(n_dead_tup), 0)::bigint FROM pg_stat_user_tables WHERE schemaname = 'public') as total_dead_rows,
    (SELECT ROUND(pg_database_size(current_database()) / (1024.0 * 1024.0), 2)) as db_size_mb,
    COALESCE(v_cache_ratio, 0) as cache_hit_ratio;
END;
$$;

-- =====================================================
-- تنظيف الفهارس المكررة
-- Clean up duplicate indexes
-- =====================================================

-- حذف الفهارس المكررة في accounts
DROP INDEX IF EXISTS idx_acc_code;
DROP INDEX IF EXISTS idx_acc_active;
DROP INDEX IF EXISTS idx_acc_parent;
DROP INDEX IF EXISTS idx_acc_type;

-- حذف الفهارس المكررة في beneficiaries
DROP INDEX IF EXISTS idx_ben_status;
DROP INDEX IF EXISTS idx_ben_category;
DROP INDEX IF EXISTS idx_ben_national_id;
DROP INDEX IF EXISTS idx_ben_family;
DROP INDEX IF EXISTS idx_ben_phone;

-- حذف الفهارس المكررة في journal_entries
DROP INDEX IF EXISTS idx_je_status;
DROP INDEX IF EXISTS idx_je_date;
DROP INDEX IF EXISTS idx_je_fiscal;

-- حذف الفهارس المكررة في journal_entry_lines  
DROP INDEX IF EXISTS idx_jel_account;
DROP INDEX IF EXISTS idx_jel_entry;

-- حذف الفهارس المكررة في audit_logs
DROP INDEX IF EXISTS idx_audit_logs_user;
DROP INDEX IF EXISTS idx_audit_logs_table;
DROP INDEX IF EXISTS idx_audit_logs_action;

-- حذف الفهارس المكررة في properties
DROP INDEX IF EXISTS idx_prop_status;
DROP INDEX IF EXISTS idx_prop_type;

-- حذف الفهارس المكررة في contracts
DROP INDEX IF EXISTS idx_contract_status;
DROP INDEX IF EXISTS idx_contract_tenant;
DROP INDEX IF EXISTS idx_contract_unit;

-- حذف الفهارس المكررة في payment_vouchers
DROP INDEX IF EXISTS idx_pv_status;
DROP INDEX IF EXISTS idx_pv_beneficiary;

-- حذف الفهارس المكررة في distributions
DROP INDEX IF EXISTS idx_dist_status;
DROP INDEX IF EXISTS idx_dist_fiscal;

-- حذف الفهارس المكررة في invoices
DROP INDEX IF EXISTS idx_inv_status;
DROP INDEX IF EXISTS idx_inv_tenant;

-- =====================================================
-- دمج سياسات RLS المكررة
-- Merge duplicate RLS policies
-- =====================================================

-- audit_logs: الإبقاء على سياسة واحدة فقط
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "admin_only_view_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "admin_select_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم عرض سجلات التدقيق" ON audit_logs;

-- approval_history: الإبقاء على سياسة واحدة فقط
DROP POLICY IF EXISTS "المسؤولون يمكنهم رؤية سجل الموافقات" ON approval_history;
DROP POLICY IF EXISTS "admin_view_approval_history" ON approval_history;

-- waqf_distribution_settings: تنظيف المكرر
DROP POLICY IF EXISTS "المسؤولون يمكنهم رؤية إعدادات التوزيع" ON waqf_distribution_settings;
DROP POLICY IF EXISTS "admin_view_distribution_settings" ON waqf_distribution_settings;

-- pos_transactions: تنظيف المكرر
DROP POLICY IF EXISTS "الموظفون يمكنهم رؤية معاملات نقطة البيع" ON pos_transactions;

-- support_tickets: تنظيف المكرر
DROP POLICY IF EXISTS "الموظفون يمكنهم رؤية تذاكر الدعم" ON support_tickets;

-- bank_statements: تنظيف المكرر
DROP POLICY IF EXISTS "المحاسبون يمكنهم رؤية كشوف البنك" ON bank_statements;

-- صلاحيات للدوال الجديدة
GRANT EXECUTE ON FUNCTION public.get_duplicate_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_duplicate_rls_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dead_rows_percentage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_query_errors(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_database_health_summary() TO authenticated;