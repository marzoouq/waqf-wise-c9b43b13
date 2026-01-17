-- =====================================================
-- تصحيح Views لتكون SECURITY INVOKER
-- =====================================================

-- إعادة إنشاء unified_revenue مع SECURITY INVOKER
DROP VIEW IF EXISTS public.unified_revenue CASCADE;
CREATE VIEW public.unified_revenue 
WITH (security_invoker = true) AS
SELECT 
  'rental_payment' as source_type,
  rp.id as source_id,
  COALESCE(rp.amount_paid, rp.amount_due) as amount,
  rp.payment_date as transaction_date,
  c.property_id,
  p.name as property_name,
  pu.unit_number,
  c.tenant_name as payer_name,
  rp.payment_method,
  rp.status,
  rp.created_at,
  'إيراد إيجار' as category,
  CASE WHEN rp.status = 'paid' THEN 'collected' ELSE 'expected' END as revenue_type
FROM rental_payments rp
LEFT JOIN contracts c ON rp.contract_id = c.id
LEFT JOIN properties p ON c.property_id = p.id
LEFT JOIN property_units pu ON c.unit_id = pu.id
WHERE rp.status IN ('paid', 'pending', 'partial')

UNION ALL

SELECT 
  'pos_transaction' as source_type,
  pt.id as source_id,
  pt.amount as amount,
  pt.created_at as transaction_date,
  NULL::uuid as property_id,
  NULL as property_name,
  NULL as unit_number,
  pt.payer_name as payer_name,
  pt.payment_method,
  CASE WHEN pt.voided THEN 'voided' ELSE 'completed' END as status,
  pt.created_at,
  'تحصيل نقدي' as category,
  'collected' as revenue_type
FROM pos_transactions pt
WHERE pt.voided = false AND pt.transaction_type = 'income';

-- إعادة إنشاء financial_summary مع SECURITY INVOKER
DROP VIEW IF EXISTS public.financial_summary;
CREATE VIEW public.financial_summary
WITH (security_invoker = true) AS
SELECT 
  fy.id as fiscal_year_id,
  fy.name as fiscal_year_name,
  fy.start_date,
  fy.end_date,
  fy.is_active,
  fy.is_closed,
  CASE 
    WHEN fy.is_closed THEN 'مغلقة'
    WHEN fy.is_active THEN 'نشطة'
    ELSE 'غير نشطة'
  END as fiscal_year_status,
  COALESCE(rental_stats.total_collected, 0) as total_rental_collected,
  COALESCE(rental_stats.transaction_count, 0) as rental_transaction_count,
  COALESCE(pos_stats.total_collected, 0) as total_pos_collected,
  COALESCE(pos_stats.transaction_count, 0) as pos_transaction_count,
  COALESCE(rental_stats.total_collected, 0) + COALESCE(pos_stats.total_collected, 0) as total_collected,
  COALESCE(contract_stats.total_expected, 0) as total_expected_revenue,
  CASE 
    WHEN COALESCE(contract_stats.total_expected, 0) > 0 
    THEN ROUND(
      ((COALESCE(rental_stats.total_collected, 0) + COALESCE(pos_stats.total_collected, 0)) 
       / contract_stats.total_expected * 100)::numeric, 2
    )
    ELSE 0 
  END as collection_percentage,
  GREATEST(
    COALESCE(contract_stats.total_expected, 0) - 
    (COALESCE(rental_stats.total_collected, 0) + COALESCE(pos_stats.total_collected, 0)),
    0
  ) as pending_amount
FROM fiscal_years fy
CROSS JOIN (
  SELECT 
    SUM(CASE WHEN rp.status = 'paid' THEN COALESCE(rp.amount_paid, 0) ELSE 0 END) as total_collected,
    COUNT(CASE WHEN rp.status = 'paid' THEN 1 END) as transaction_count
  FROM rental_payments rp
) rental_stats
CROSS JOIN (
  SELECT 
    SUM(CASE WHEN NOT voided AND transaction_type = 'income' THEN amount ELSE 0 END) as total_collected,
    COUNT(CASE WHEN NOT voided AND transaction_type = 'income' THEN 1 END) as transaction_count
  FROM pos_transactions
) pos_stats
CROSS JOIN (
  SELECT SUM(monthly_rent * 12) as total_expected FROM contracts WHERE status = 'active'
) contract_stats;

-- تصحيح Functions لتحديد search_path
CREATE OR REPLACE FUNCTION public.get_total_collected(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM public.unified_revenue
  WHERE revenue_type = 'collected'
    AND (p_start_date IS NULL OR transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR transaction_date <= p_end_date);
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_expected_contract_revenue()
RETURNS NUMERIC AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(monthly_rent * 12), 0)
  INTO v_total
  FROM public.contracts
  WHERE status = 'active';
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_collection_percentage()
RETURNS NUMERIC AS $$
DECLARE
  v_collected NUMERIC;
  v_expected NUMERIC;
BEGIN
  v_collected := public.get_total_collected();
  v_expected := public.get_expected_contract_revenue();
  IF v_expected > 0 THEN
    RETURN ROUND((v_collected / v_expected * 100)::numeric, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_property_collection_summary(p_property_id UUID)
RETURNS TABLE (
  total_collected NUMERIC,
  total_expected NUMERIC,
  collection_percentage NUMERIC,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN ur.revenue_type = 'collected' THEN ur.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN ur.revenue_type = 'expected' THEN ur.amount ELSE 0 END), 0),
    CASE 
      WHEN SUM(CASE WHEN ur.revenue_type = 'expected' THEN ur.amount ELSE 0 END) > 0 
      THEN ROUND((SUM(CASE WHEN ur.revenue_type = 'collected' THEN ur.amount ELSE 0 END) / 
                  SUM(CASE WHEN ur.revenue_type = 'expected' THEN ur.amount ELSE 0 END) * 100)::numeric, 2)
      ELSE 0 
    END,
    COUNT(*)::BIGINT
  FROM public.unified_revenue ur
  WHERE ur.property_id = p_property_id OR p_property_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إعادة منح الصلاحيات
GRANT SELECT ON public.unified_revenue TO authenticated;
GRANT SELECT ON public.financial_summary TO authenticated;