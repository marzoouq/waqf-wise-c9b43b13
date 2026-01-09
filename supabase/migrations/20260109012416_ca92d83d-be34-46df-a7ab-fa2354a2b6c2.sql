-- إصلاح دالة find_duplicate_distributions - تغيير amount إلى share_amount
CREATE OR REPLACE FUNCTION public.find_duplicate_distributions()
 RETURNS TABLE(beneficiary_id uuid, beneficiary_name text, month_year text, duplicate_count bigint, total_amount numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        hd.beneficiary_id,
        b.full_name as beneficiary_name,
        TO_CHAR(hd.created_at, 'YYYY-MM') as month_year,
        COUNT(*)::bigint as duplicate_count,
        SUM(hd.share_amount) as total_amount
    FROM heir_distributions hd
    LEFT JOIN beneficiaries b ON hd.beneficiary_id = b.id
    WHERE hd.status != 'cancelled'
    GROUP BY hd.beneficiary_id, b.full_name, TO_CHAR(hd.created_at, 'YYYY-MM')
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC;
END;
$function$;

-- إصلاح دالة find_orphan_records - إزالة invoice_id الغير موجود
CREATE OR REPLACE FUNCTION public.find_orphan_records()
 RETURNS TABLE(table_name text, orphan_count bigint, sample_ids text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- توزيعات بدون مستفيدين
    RETURN QUERY
    SELECT 
        'heir_distributions'::text as tbl_name,
        COUNT(*)::bigint as orphan_cnt,
        string_agg(hd.id::text, ', ' ORDER BY hd.created_at DESC) as sample
    FROM heir_distributions hd
    LEFT JOIN beneficiaries b ON hd.beneficiary_id = b.id
    WHERE b.id IS NULL
    HAVING COUNT(*) > 0;

    -- مدفوعات بدون عقود صالحة
    RETURN QUERY
    SELECT 
        'payments_without_contracts'::text,
        COUNT(*)::bigint,
        string_agg(p.id::text, ', ' ORDER BY p.created_at DESC)
    FROM payments p
    LEFT JOIN contracts c ON p.contract_id = c.id
    WHERE p.contract_id IS NOT NULL AND c.id IS NULL
    HAVING COUNT(*) > 0;

    -- سندات صرف بدون مستفيدين
    RETURN QUERY
    SELECT 
        'vouchers_without_beneficiaries'::text,
        COUNT(*)::bigint,
        string_agg(pv.id::text, ', ' ORDER BY pv.created_at DESC)
    FROM payment_vouchers pv
    LEFT JOIN beneficiaries b ON pv.beneficiary_id = b.id
    WHERE pv.beneficiary_id IS NOT NULL AND b.id IS NULL
    HAVING COUNT(*) > 0;
END;
$function$;