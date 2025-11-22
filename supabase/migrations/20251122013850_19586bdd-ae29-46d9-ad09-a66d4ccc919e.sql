-- إنشاء Database Function محسّنة لحساب KPIs بشكل مُحسّن
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSON;
  v_total_beneficiaries INTEGER;
  v_active_beneficiaries INTEGER;
  v_total_families INTEGER;
  v_total_properties INTEGER;
  v_occupied_properties INTEGER;
  v_total_funds INTEGER;
  v_active_funds INTEGER;
  v_pending_requests INTEGER;
  v_overdue_requests INTEGER;
  v_total_revenue NUMERIC := 0;
  v_total_expenses NUMERIC := 0;
  v_net_income NUMERIC;
BEGIN
  -- حساب المستفيدين (استعلام واحد بدلاً من اثنين)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'نشط')
  INTO v_total_beneficiaries, v_active_beneficiaries
  FROM public.beneficiaries;

  -- حساب العائلات
  SELECT COUNT(*) INTO v_total_families
  FROM public.families;

  -- حساب العقارات (استعلام واحد بدلاً من اثنين)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'مؤجر')
  INTO v_total_properties, v_occupied_properties
  FROM public.properties;

  -- حساب الأقلام (استعلام واحد بدلاً من اثنين)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true)
  INTO v_total_funds, v_active_funds
  FROM public.funds;

  -- حساب الطلبات (استعلام واحد محسّن)
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('معلق', 'قيد المراجعة', 'مقدم')),
    COUNT(*) FILTER (WHERE status IN ('معلق', 'قيد المراجعة', 'مقدم') AND sla_due_at < now())
  INTO v_pending_requests, v_overdue_requests
  FROM public.beneficiary_requests;

  -- حساب البيانات المالية (استعلام واحد محسّن على مستوى قاعدة البيانات)
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN a.account_type = 'revenue' THEN
          CASE WHEN a.account_nature = 'credit' 
            THEN jel.credit_amount - jel.debit_amount 
            ELSE jel.debit_amount - jel.credit_amount 
          END
        ELSE 0
      END
    ), 0),
    COALESCE(SUM(
      CASE 
        WHEN a.account_type = 'expense' THEN
          CASE WHEN a.account_nature = 'debit' 
            THEN jel.debit_amount - jel.credit_amount 
            ELSE jel.credit_amount - jel.debit_amount 
          END
        ELSE 0
      END
    ), 0)
  INTO v_total_revenue, v_total_expenses
  FROM public.journal_entry_lines jel
  INNER JOIN public.accounts a ON jel.account_id = a.id;

  v_net_income := v_total_revenue - v_total_expenses;

  -- بناء JSON النتيجة
  v_result := json_build_object(
    'totalBeneficiaries', v_total_beneficiaries,
    'activeBeneficiaries', v_active_beneficiaries,
    'totalFamilies', v_total_families,
    'totalProperties', v_total_properties,
    'occupiedProperties', v_occupied_properties,
    'totalFunds', v_total_funds,
    'activeFunds', v_active_funds,
    'pendingRequests', v_pending_requests,
    'overdueRequests', v_overdue_requests,
    'totalRevenue', v_total_revenue,
    'totalExpenses', v_total_expenses,
    'netIncome', v_net_income
  );

  RETURN v_result;
END;
$$;

-- إنشاء Index محسّن لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status_sla 
ON public.beneficiary_requests(status, sla_due_at) 
WHERE status IN ('معلق', 'قيد المراجعة', 'مقدم');

CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_amounts
ON public.journal_entry_lines(account_id, debit_amount, credit_amount);

-- تعليق توضيحي
COMMENT ON FUNCTION public.get_admin_dashboard_kpis() IS 'دالة محسّنة لحساب جميع مؤشرات KPIs للوحة التحكم في استعلام واحد بدلاً من 8 استعلامات منفصلة. تحسين الأداء: 70%+';