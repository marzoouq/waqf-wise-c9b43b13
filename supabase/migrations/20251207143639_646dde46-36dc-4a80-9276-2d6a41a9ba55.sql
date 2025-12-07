-- إضافة دالة لإحصائيات POS اليومية
CREATE OR REPLACE FUNCTION get_pos_daily_stats(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_collections NUMERIC,
  total_payments NUMERIC,
  net_amount NUMERIC,
  transactions_count BIGINT,
  cash_amount NUMERIC,
  card_amount NUMERIC,
  transfer_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'تحصيل' THEN pt.amount ELSE 0 END), 0) as total_collections,
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'صرف' THEN pt.amount ELSE 0 END), 0) as total_payments,
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'تحصيل' THEN pt.amount ELSE -pt.amount END), 0) as net_amount,
    COUNT(*)::BIGINT as transactions_count,
    COALESCE(SUM(CASE WHEN pt.payment_method = 'نقدي' THEN pt.amount ELSE 0 END), 0) as cash_amount,
    COALESCE(SUM(CASE WHEN pt.payment_method = 'شبكة' THEN pt.amount ELSE 0 END), 0) as card_amount,
    COALESCE(SUM(CASE WHEN pt.payment_method = 'تحويل' THEN pt.amount ELSE 0 END), 0) as transfer_amount
  FROM pos_transactions pt
  JOIN cashier_shifts cs ON pt.shift_id = cs.id
  WHERE pt.created_at::date = p_date;
END;
$$;

-- دالة لإحصائيات الوردية
CREATE OR REPLACE FUNCTION get_shift_stats(p_shift_id UUID)
RETURNS TABLE (
  total_collections NUMERIC,
  total_payments NUMERIC,
  net_amount NUMERIC,
  transactions_count BIGINT,
  cash_collections NUMERIC,
  card_collections NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'تحصيل' THEN pt.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'صرف' THEN pt.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'تحصيل' THEN pt.amount ELSE -pt.amount END), 0),
    COUNT(*)::BIGINT,
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'تحصيل' AND pt.payment_method = 'نقدي' THEN pt.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'تحصيل' AND pt.payment_method = 'شبكة' THEN pt.amount ELSE 0 END), 0)
  FROM pos_transactions pt
  WHERE pt.shift_id = p_shift_id;
END;
$$;

-- دالة لتقرير الورديات
CREATE OR REPLACE FUNCTION get_shifts_report(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  shift_id UUID,
  shift_number TEXT,
  cashier_name TEXT,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  opening_balance NUMERIC,
  closing_balance NUMERIC,
  total_collections NUMERIC,
  total_payments NUMERIC,
  variance NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.shift_number,
    cs.cashier_name,
    cs.opened_at,
    cs.closed_at,
    cs.opening_balance,
    cs.closing_balance,
    cs.total_collections,
    cs.total_payments,
    cs.variance,
    cs.status
  FROM cashier_shifts cs
  WHERE cs.opened_at::date BETWEEN p_start_date AND p_end_date
  ORDER BY cs.opened_at DESC;
END;
$$;