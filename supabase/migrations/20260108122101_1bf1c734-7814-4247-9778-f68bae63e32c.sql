
-- ============================================
-- إنشاء دالة VACUUM قوية ومتكاملة
-- ============================================

-- 1. إنشاء دالة لتشغيل VACUUM على جدول محدد
CREATE OR REPLACE FUNCTION public.vacuum_table(p_table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_dead_before bigint;
  v_dead_after bigint;
BEGIN
  -- الحصول على عدد الصفوف الميتة قبل التنظيف
  SELECT n_dead_tup INTO v_dead_before
  FROM pg_stat_user_tables 
  WHERE relname = p_table_name;
  
  -- تشغيل ANALYZE (VACUUM لا يمكن تشغيله داخل transaction)
  EXECUTE format('ANALYZE %I', p_table_name);
  
  -- الحصول على عدد الصفوف الميتة بعد التنظيف
  SELECT n_dead_tup INTO v_dead_after
  FROM pg_stat_user_tables 
  WHERE relname = p_table_name;
  
  v_result := jsonb_build_object(
    'table', p_table_name,
    'dead_before', COALESCE(v_dead_before, 0),
    'dead_after', COALESCE(v_dead_after, 0),
    'status', 'analyzed',
    'timestamp', now()
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'table', p_table_name,
      'status', 'error',
      'error', SQLERRM,
      'timestamp', now()
    );
END;
$$;

-- 2. إنشاء دالة لتنظيف جميع الجداول
CREATE OR REPLACE FUNCTION public.vacuum_all_tables()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_table record;
  v_results jsonb := '[]'::jsonb;
  v_result jsonb;
  v_total int := 0;
  v_success int := 0;
  v_errors int := 0;
BEGIN
  -- الحصول على جميع الجداول التي تحتاج تنظيف
  FOR v_table IN 
    SELECT relname as table_name, n_dead_tup as dead_rows
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY n_dead_tup DESC
  LOOP
    v_total := v_total + 1;
    
    BEGIN
      EXECUTE format('ANALYZE %I', v_table.table_name);
      v_result := jsonb_build_object(
        'table', v_table.table_name,
        'dead_rows', v_table.dead_rows,
        'status', 'analyzed'
      );
      v_success := v_success + 1;
    EXCEPTION
      WHEN OTHERS THEN
        v_result := jsonb_build_object(
          'table', v_table.table_name,
          'status', 'error',
          'error', SQLERRM
        );
        v_errors := v_errors + 1;
    END;
    
    v_results := v_results || v_result;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'total', v_total,
    'analyzed', v_success,
    'errors', v_errors,
    'tables', v_results,
    'timestamp', now(),
    'note', 'VACUUM الفعلي يتم تلقائياً بواسطة autovacuum. هذه الدالة تشغل ANALYZE لتحديث الإحصائيات.'
  );
END;
$$;

-- 3. تحديث إعدادات autovacuum للجداول الحرجة
DO $$
DECLARE
  v_tables text[] := ARRAY[
    'system_health_checks', 'cash_flows', 'beneficiary_requests',
    'fiscal_years', 'rental_payments', 'journal_entries',
    'distributions', 'loans', 'tenants', 'properties',
    'invoices', 'contract_units', 'payment_reminders',
    'documents', 'maintenance_requests', 'waqf_units',
    'families', 'support_tickets', 'audit_logs',
    'system_alerts', 'notifications', 'smart_alerts'
  ];
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    BEGIN
      -- تفعيل autovacuum بحدود أقل للجداول الحرجة
      EXECUTE format('ALTER TABLE IF EXISTS %I SET (
        autovacuum_vacuum_threshold = 10,
        autovacuum_vacuum_scale_factor = 0.05,
        autovacuum_analyze_threshold = 10,
        autovacuum_analyze_scale_factor = 0.05
      )', v_table);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not alter table %: %', v_table, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- 4. تحديث دالة analyze_table الموجودة لتكون أكثر فعالية
CREATE OR REPLACE FUNCTION public.analyze_table(p_table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من وجود الجدول
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = p_table_name
  ) THEN
    RAISE EXCEPTION 'Table % does not exist', p_table_name;
  END IF;
  
  -- تشغيل ANALYZE
  EXECUTE format('ANALYZE %I', p_table_name);
END;
$$;

-- 5. إنشاء دالة لمعرفة حالة autovacuum
CREATE OR REPLACE FUNCTION public.get_vacuum_status()
RETURNS TABLE (
  table_name text,
  live_rows bigint,
  dead_rows bigint,
  dead_pct numeric,
  last_vacuum timestamp with time zone,
  last_autovacuum timestamp with time zone,
  last_analyze timestamp with time zone,
  needs_vacuum boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    relname::text as table_name,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    CASE WHEN n_live_tup + n_dead_tup > 0 
      THEN ROUND(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 1)
      ELSE 0 
    END as dead_pct,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    (n_dead_tup > 50 OR (n_live_tup + n_dead_tup > 0 AND 100.0 * n_dead_tup / (n_live_tup + n_dead_tup) > 20)) as needs_vacuum
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY dead_pct DESC, n_dead_tup DESC;
$$;

-- 6. منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.vacuum_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vacuum_all_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vacuum_status() TO authenticated;
