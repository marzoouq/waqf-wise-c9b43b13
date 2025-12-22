
-- حذف الدوال القديمة أولاً
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
DROP FUNCTION IF EXISTS public.get_waqf_summary();

-- إعادة إنشاء دالة get_dashboard_stats مع SECURITY DEFINER وفحص الصلاحيات
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
  total_beneficiaries bigint,
  active_beneficiaries bigint,
  total_properties bigint,
  active_contracts bigint,
  total_bank_balance numeric,
  pending_distributions bigint,
  active_loans bigint,
  pending_approvals bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- فحص الصلاحيات: يجب أن يكون المستخدم موظفاً
  IF NOT public.is_staff_only() THEN
    RAISE EXCEPTION 'غير مصرح لك بالوصول إلى إحصائيات لوحة التحكم';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM beneficiaries)::bigint as total_beneficiaries,
    (SELECT COUNT(*) FROM beneficiaries WHERE status = 'active')::bigint as active_beneficiaries,
    (SELECT COUNT(*) FROM properties WHERE status = 'active')::bigint as total_properties,
    (SELECT COUNT(*) FROM contracts WHERE status = 'active')::bigint as active_contracts,
    (SELECT COALESCE(SUM(current_balance), 0) FROM bank_accounts WHERE is_active = true)::numeric as total_bank_balance,
    (SELECT COUNT(*) FROM distributions WHERE status = 'pending')::bigint as pending_distributions,
    (SELECT COUNT(*) FROM loans WHERE status = 'active')::bigint as active_loans,
    (SELECT COUNT(*) FROM approval_status WHERE status = 'pending')::bigint as pending_approvals;
END;
$$;

-- إعادة إنشاء دالة get_waqf_summary مع SECURITY DEFINER وفحص الصلاحيات
CREATE OR REPLACE FUNCTION public.get_waqf_summary()
RETURNS TABLE(
  metric_name text,
  metric_value numeric,
  metric_unit text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- فحص الصلاحيات: يجب أن يكون المستخدم موظفاً
  IF NOT public.is_staff_only() THEN
    RAISE EXCEPTION 'غير مصرح لك بالوصول إلى ملخص الوقف';
  END IF;

  RETURN QUERY
  SELECT 'إجمالي المستفيدين'::text, (SELECT COUNT(*) FROM beneficiaries)::numeric, 'مستفيد'::text
  UNION ALL
  SELECT 'المستفيدين النشطين'::text, (SELECT COUNT(*) FROM beneficiaries WHERE status = 'active')::numeric, 'مستفيد'::text
  UNION ALL
  SELECT 'إجمالي العقارات'::text, (SELECT COUNT(*) FROM properties)::numeric, 'عقار'::text
  UNION ALL
  SELECT 'قيمة العقارات'::text, (SELECT COALESCE(SUM(COALESCE(market_value, 0)), 0) FROM properties)::numeric, 'ريال'::text
  UNION ALL
  SELECT 'رصيد البنك'::text, (SELECT COALESCE(SUM(current_balance), 0) FROM bank_accounts WHERE is_active = true)::numeric, 'ريال'::text
  UNION ALL
  SELECT 'القروض النشطة'::text, (SELECT COALESCE(SUM(remaining_balance), 0) FROM loans WHERE status = 'active')::numeric, 'ريال'::text
  UNION ALL
  SELECT 'إجمالي التوزيعات'::text, (SELECT COUNT(*) FROM distributions)::numeric, 'توزيعة'::text
  UNION ALL
  SELECT 'المبالغ الموزعة'::text, (SELECT COALESCE(SUM(total_amount), 0) FROM distributions WHERE status = 'completed')::numeric, 'ريال'::text;
END;
$$;

-- إضافة تعليقات توثيقية
COMMENT ON FUNCTION public.get_dashboard_stats() IS 'إرجاع إحصائيات لوحة التحكم - محمية بـ SECURITY DEFINER وفحص صلاحيات is_staff_only()';
COMMENT ON FUNCTION public.get_waqf_summary() IS 'إرجاع ملخص الوقف - محمية بـ SECURITY DEFINER وفحص صلاحيات is_staff_only()';
