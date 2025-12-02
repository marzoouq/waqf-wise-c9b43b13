-- إنشاء function لجلب إحصائيات الوقف العامة بدون RLS
CREATE OR REPLACE FUNCTION get_waqf_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'beneficiaries_count', (SELECT COUNT(*) FROM beneficiaries WHERE status = 'نشط'),
    'properties_count', (SELECT COUNT(*) FROM properties),
    'total_property_value', COALESCE((SELECT SUM(monthly_revenue * 12) FROM properties), 0),
    'total_funds', COALESCE((SELECT SUM(allocated_amount) FROM funds), 0),
    'total_bank_balance', COALESCE((SELECT SUM(current_balance) FROM bank_accounts), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;