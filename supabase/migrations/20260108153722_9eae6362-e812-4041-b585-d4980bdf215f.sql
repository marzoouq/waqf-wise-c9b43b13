-- =====================================================
-- المرحلة 1: دوال الإصلاح الذاتي وفحص البيانات
-- =====================================================

-- 1. تنظيف التكرارات الحالية في التوزيعات
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY beneficiary_id, DATE(created_at - INTERVAL '1 day' * EXTRACT(DAY FROM created_at - '1 day'::interval))
    ORDER BY created_at
  ) as rn
  FROM heir_distributions
  WHERE status != 'cancelled'
)
UPDATE heir_distributions 
SET status = 'cancelled', 
    notes = COALESCE(notes, '') || ' [ملغاة تلقائياً - توزيعة مكررة]'
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 2. دالة فحص وإصلاح RLS التلقائي
CREATE OR REPLACE FUNCTION auto_repair_missing_rls()
RETURNS TABLE(table_name text, action_taken text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_table text;
BEGIN
    FOR target_table IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = false
        AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);
        table_name := target_table;
        action_taken := 'ENABLED_RLS';
        RETURN NEXT;
    END LOOP;
END;
$$;

-- 3. دالة فحص التوازن المحاسبي
CREATE OR REPLACE FUNCTION check_accounting_balance()
RETURNS TABLE(
    entry_id uuid,
    entry_date date,
    total_debit numeric,
    total_credit numeric,
    difference numeric,
    is_balanced boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        je.id as entry_id,
        je.entry_date,
        COALESCE(SUM(jel.debit_amount), 0) as total_debit,
        COALESCE(SUM(jel.credit_amount), 0) as total_credit,
        ABS(COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)) as difference,
        ABS(COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)) < 0.01 as is_balanced
    FROM journal_entries je
    LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    GROUP BY je.id, je.entry_date
    HAVING ABS(COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)) >= 0.01;
END;
$$;

-- 4. دالة اكتشاف السجلات اليتيمة
CREATE OR REPLACE FUNCTION find_orphan_records()
RETURNS TABLE(
    table_name text,
    orphan_count bigint,
    sample_ids text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'heir_distributions'::text as table_name,
        COUNT(*)::bigint as orphan_count,
        string_agg(hd.id::text, ', ' ORDER BY hd.created_at DESC) as sample_ids
    FROM heir_distributions hd
    LEFT JOIN beneficiaries b ON hd.beneficiary_id = b.id
    WHERE b.id IS NULL
    HAVING COUNT(*) > 0;

    RETURN QUERY
    SELECT 
        'payments_without_invoices'::text,
        COUNT(*)::bigint,
        string_agg(p.id::text, ', ' ORDER BY p.created_at DESC)
    FROM payments p
    LEFT JOIN invoices i ON p.invoice_id = i.id
    WHERE p.invoice_id IS NOT NULL AND i.id IS NULL
    HAVING COUNT(*) > 0;
END;
$$;

-- 5. دالة فحص التوزيعات المكررة
CREATE OR REPLACE FUNCTION find_duplicate_distributions()
RETURNS TABLE(
    beneficiary_id uuid,
    beneficiary_name text,
    month_year text,
    duplicate_count bigint,
    total_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hd.beneficiary_id,
        b.full_name as beneficiary_name,
        TO_CHAR(hd.created_at, 'YYYY-MM') as month_year,
        COUNT(*)::bigint as duplicate_count,
        SUM(hd.amount) as total_amount
    FROM heir_distributions hd
    LEFT JOIN beneficiaries b ON hd.beneficiary_id = b.id
    WHERE hd.status != 'cancelled'
    GROUP BY hd.beneficiary_id, b.full_name, TO_CHAR(hd.created_at, 'YYYY-MM')
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC;
END;
$$;

-- 6. دالة إصلاح الموافقات المعلقة
CREATE OR REPLACE FUNCTION fix_stuck_approvals(max_age_days integer DEFAULT 30)
RETURNS TABLE(
    approval_id uuid,
    entity_type text,
    entity_id uuid,
    days_pending integer,
    action_taken text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH stuck AS (
        SELECT 
            a_s.id,
            a_s.entity_type,
            a_s.entity_id,
            EXTRACT(DAY FROM NOW() - a_s.started_at)::integer as days_pending
        FROM approval_status a_s
        WHERE a_s.status = 'pending'
        AND a_s.started_at < NOW() - (max_age_days || ' days')::interval
    )
    UPDATE approval_status
    SET status = 'expired',
        completed_at = NOW()
    FROM stuck
    WHERE approval_status.id = stuck.id
    RETURNING 
        stuck.id as approval_id,
        stuck.entity_type,
        stuck.entity_id,
        stuck.days_pending,
        'MARKED_EXPIRED'::text as action_taken;
END;
$$;

-- 7. دالة تنظيف الجلسات المنتهية
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE(
    cleaned_count bigint,
    cleanup_time timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count bigint;
BEGIN
    DELETE FROM beneficiary_sessions
    WHERE last_activity < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    cleaned_count := deleted_count;
    cleanup_time := NOW();
    RETURN NEXT;
END;
$$;

-- 8. Trigger لمنع التوزيعات المكررة
CREATE OR REPLACE FUNCTION prevent_duplicate_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    existing_count integer;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM heir_distributions
    WHERE beneficiary_id = NEW.beneficiary_id
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NEW.created_at)
    AND status != 'cancelled'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF existing_count > 0 THEN
        RAISE EXCEPTION 'توجد توزيعة سابقة لهذا المستفيد في نفس الشهر';
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_duplicate_distribution ON heir_distributions;
CREATE TRIGGER check_duplicate_distribution
    BEFORE INSERT ON heir_distributions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_distribution();