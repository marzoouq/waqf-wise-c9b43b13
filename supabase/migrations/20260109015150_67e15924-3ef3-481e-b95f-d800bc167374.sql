
-- إعادة إنشاء دالة البحث عن التوزيعات المكررة بالأعمدة الصحيحة
CREATE OR REPLACE FUNCTION public.find_duplicate_distributions()
RETURNS TABLE(
    beneficiary_id uuid, 
    beneficiary_name text, 
    month_year text, 
    duplicate_count bigint, 
    total_amount numeric
)
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
