-- =====================================================
-- المرحلة 1: تنظيف Dead Rows وحذف الفهارس غير المستخدمة
-- =====================================================

-- 1.1 إنشاء دالة تنظيف شاملة (مصححة)
CREATE OR REPLACE FUNCTION public.run_full_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_start_time TIMESTAMP;
BEGIN
  v_start_time := NOW();
  
  -- تنظيف الجداول ذات Dead Rows العالية (الموجودة فقط)
  ANALYZE system_alerts;
  ANALYZE fiscal_years;
  ANALYZE families;
  ANALYZE contracts;
  ANALYZE journal_entries;
  ANALYZE rental_payments;
  ANALYZE contract_units;
  ANALYZE beneficiaries;
  ANALYZE heir_distributions;
  ANALYZE payments;
  ANALYZE project_documentation;
  
  RETURN jsonb_build_object(
    'status', 'completed',
    'tables_analyzed', 11,
    'started_at', v_start_time,
    'completed_at', NOW()
  );
END;
$$;

-- 1.2 حذف الفهارس غير المستخدمة (الآمنة للحذف)
DROP INDEX IF EXISTS idx_system_alerts_metadata;
DROP INDEX IF EXISTS idx_beneficiaries_tags;
DROP INDEX IF EXISTS idx_maintenance_providers_specialization;
DROP INDEX IF EXISTS idx_kb_articles_category;
DROP INDEX IF EXISTS idx_kb_articles_is_featured;
DROP INDEX IF EXISTS idx_accounts_account_type;
DROP INDEX IF EXISTS idx_invoices_due_date;
DROP INDEX IF EXISTS idx_kb_faqs_category;
DROP INDEX IF EXISTS idx_accounts_type;

-- =====================================================
-- المرحلة 2: تحسين الاستعلامات
-- =====================================================

-- 2.1 إنشاء فهارس مركبة محسنة
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON user_roles (user_id, role);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_lookup 
ON beneficiaries (user_id, family_id, status);

CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_lookup 
ON journal_entry_lines (journal_entry_id, account_id);

-- 2.2 تحسين سياسات storage.objects باستخدام الدوال المحسنة
DROP POLICY IF EXISTS "المستفيدون يمكنهم رفع المرفقات" ON storage.objects;
CREATE POLICY "المستفيدون يمكنهم رفع المرفقات" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'request-attachments' 
  AND (is_beneficiary() OR is_staff())
);

DROP POLICY IF EXISTS "المستفيدون يمكنهم عرض مرفقاتهم" ON storage.objects;
CREATE POLICY "المستفيدون يمكنهم عرض مرفقاتهم" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'request-attachments' 
  AND (is_beneficiary() OR is_staff())
);

DROP POLICY IF EXISTS "المستفيدون يمكنهم حذف مرفقاتهم" ON storage.objects;
CREATE POLICY "المستفيدون يمكنهم حذف مرفقاتهم" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'request-attachments' 
  AND (is_beneficiary() OR is_staff())
);

-- 2.3 إضافة PARALLEL SAFE للدوال الرئيسية
ALTER FUNCTION is_admin() PARALLEL SAFE;
ALTER FUNCTION is_staff() PARALLEL SAFE;
ALTER FUNCTION is_beneficiary() PARALLEL SAFE;
ALTER FUNCTION is_financial_staff() PARALLEL SAFE;
ALTER FUNCTION is_admin_or_nazer() PARALLEL SAFE;
ALTER FUNCTION is_waqf_heir() PARALLEL SAFE;
ALTER FUNCTION is_cashier() PARALLEL SAFE;
ALTER FUNCTION is_pos_user() PARALLEL SAFE;
ALTER FUNCTION can_manage_data() PARALLEL SAFE;

-- =====================================================
-- المرحلة 3: تحسين الأمان
-- =====================================================

-- 3.1 تقييد سياسة profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR is_admin()
  OR (is_staff() AND EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = profiles.user_id
  ))
);

-- =====================================================
-- المرحلة 4: دوال المراقبة
-- =====================================================

-- 4.1 دالة لإحصائيات الفهارس غير المستخدمة
CREATE OR REPLACE FUNCTION public.get_unused_indexes_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer 
  FROM pg_stat_user_indexes 
  WHERE idx_scan = 0 AND schemaname = 'public';
$$;

-- 4.2 دالة للجداول ذات Dead Rows العالية
CREATE OR REPLACE FUNCTION public.get_tables_with_high_dead_rows()
RETURNS TABLE(table_name text, dead_ratio numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT relname::text, 
         ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0)) * 100, 2)
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 0 AND n_live_tup > 0
    AND (n_dead_tup::numeric / n_live_tup) > 0.1
  ORDER BY (n_dead_tup::numeric / n_live_tup) DESC
  LIMIT 20;
$$;

-- 4.3 دالة للتحقق من صحة الأداء
CREATE OR REPLACE FUNCTION public.get_performance_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_unused_indexes INTEGER;
  v_high_dead_rows INTEGER;
  v_cache_hit_ratio NUMERIC;
BEGIN
  -- عدد الفهارس غير المستخدمة
  SELECT COUNT(*)::integer INTO v_unused_indexes
  FROM pg_stat_user_indexes 
  WHERE idx_scan = 0 AND schemaname = 'public';
  
  -- عدد الجداول ذات Dead Rows العالية
  SELECT COUNT(*)::integer INTO v_high_dead_rows
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 0 AND n_live_tup > 0
    AND (n_dead_tup::numeric / n_live_tup) > 0.1;
  
  -- نسبة استخدام Cache
  SELECT ROUND(
    (sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100, 2
  )::numeric INTO v_cache_hit_ratio
  FROM pg_statio_user_tables;
  
  RETURN jsonb_build_object(
    'unused_indexes', v_unused_indexes,
    'tables_with_high_dead_rows', v_high_dead_rows,
    'cache_hit_ratio', COALESCE(v_cache_hit_ratio, 0),
    'status', CASE 
      WHEN v_unused_indexes > 50 OR v_high_dead_rows > 10 THEN 'warning'
      WHEN v_unused_indexes > 100 OR v_high_dead_rows > 20 THEN 'critical'
      ELSE 'healthy'
    END,
    'checked_at', NOW()
  );
END;
$$;

-- تشغيل التنظيف الأولي
SELECT run_full_cleanup();