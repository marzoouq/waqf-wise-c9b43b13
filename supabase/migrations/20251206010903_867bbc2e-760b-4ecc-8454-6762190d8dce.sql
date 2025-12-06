
-- تصحيح دالة get_waqf_public_stats لحساب الإيرادات السنوية من العقود النشطة
CREATE OR REPLACE FUNCTION public.get_waqf_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'beneficiaries_count', (SELECT COUNT(*) FROM beneficiaries WHERE status = 'active'),
    'properties_count', (SELECT COUNT(*) FROM properties WHERE status = 'نشط'),
    'total_property_value', (
      -- حساب الإيرادات السنوية من العقود النشطة حسب نوع الدفع
      SELECT COALESCE(SUM(
        CASE 
          WHEN c.payment_frequency = 'شهري' THEN c.monthly_rent * 12
          ELSE c.monthly_rent  -- للسنوي: monthly_rent هو الإيجار السنوي فعلياً
        END
      ), 0)
      FROM contracts c
      WHERE c.status = 'نشط'
    ),
    'total_funds', (SELECT COALESCE(SUM(total_amount), 0) FROM funds WHERE status = 'active'),
    'total_bank_balance', (SELECT COALESCE(SUM(current_balance), 0) FROM bank_accounts WHERE is_active = true)
  ) INTO result;
  
  RETURN result;
END;
$$;
