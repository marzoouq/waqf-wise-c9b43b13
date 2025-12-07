-- إصلاح دالة get_admin_dashboard_kpis
-- تصحيح حساب العقارات المشغولة من جدول contracts بدلاً من properties

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_beneficiaries INTEGER;
  v_active_beneficiaries INTEGER;
  v_total_families INTEGER;
  v_total_properties INTEGER;
  v_occupied_properties INTEGER;
  v_total_funds INTEGER;
  v_active_funds INTEGER;
  v_pending_requests INTEGER;
  v_overdue_requests INTEGER;
  v_total_revenue NUMERIC;
  v_total_expenses NUMERIC;
  v_net_income NUMERIC;
BEGIN
  -- المستفيدون
  SELECT COUNT(*) INTO v_total_beneficiaries FROM public.beneficiaries;
  SELECT COUNT(*) INTO v_active_beneficiaries FROM public.beneficiaries WHERE status IN ('نشط', 'active');
  
  -- العائلات
  SELECT COUNT(*) INTO v_total_families FROM public.families;
  
  -- العقارات
  SELECT COUNT(*) INTO v_total_properties FROM public.properties;
  
  -- العقارات المشغولة = عدد العقود النشطة (التصحيح الأساسي)
  SELECT COUNT(*) INTO v_occupied_properties 
  FROM public.contracts 
  WHERE status IN ('نشط', 'active');
  
  -- الأقلام
  SELECT COUNT(*) INTO v_total_funds FROM public.funds;
  SELECT COUNT(*) INTO v_active_funds FROM public.funds WHERE is_active = true;
  
  -- الطلبات
  SELECT COUNT(*) INTO v_pending_requests FROM public.beneficiary_requests WHERE status IN ('pending', 'معلق');
  SELECT COUNT(*) INTO v_overdue_requests FROM public.beneficiary_requests WHERE is_overdue = true;
  
  -- الإيرادات من المدفوعات المكتملة
  SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue 
  FROM public.payments 
  WHERE status IN ('مدفوع', 'completed') 
  AND payment_type IN ('payment', 'إيجار');
  
  -- المصروفات من سطور القيود (الدائن)
  SELECT COALESCE(SUM(credit_amount), 0) INTO v_total_expenses 
  FROM public.journal_entry_lines;
  
  v_net_income := v_total_revenue - v_total_expenses;
  
  RETURN json_build_object(
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
END;
$$;