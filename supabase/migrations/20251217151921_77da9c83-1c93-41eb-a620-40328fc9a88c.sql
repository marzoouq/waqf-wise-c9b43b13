
-- 1. إنشاء دالة notify_overdue_invoices
CREATE OR REPLACE FUNCTION public.notify_overdue_invoices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invoice RECORD;
  v_admin_id UUID;
BEGIN
  -- جلب الفواتير المتأخرة
  FOR v_invoice IN 
    SELECT i.id, i.invoice_number, i.total_amount, i.due_date
    FROM invoices i
    WHERE i.status = 'pending' 
      AND i.due_date < CURRENT_DATE
  LOOP
    -- إشعار للمدير والناظر والمحاسب
    FOR v_admin_id IN SELECT user_id FROM user_roles WHERE role IN ('admin', 'nazer', 'accountant')
    LOOP
      PERFORM create_notification(
        v_admin_id,
        'فاتورة متأخرة',
        'الفاتورة رقم ' || v_invoice.invoice_number || ' بمبلغ ' || v_invoice.total_amount || ' ريال متأخرة عن السداد',
        'warning',
        'invoice',
        v_invoice.id,
        '/accounting?tab=invoices'
      );
    END LOOP;
  END LOOP;
END;
$$;

-- 2. إنشاء دالة notify_overdue_loan_installments
CREATE OR REPLACE FUNCTION public.notify_overdue_loan_installments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_installment RECORD;
  v_admin_id UUID;
BEGIN
  FOR v_installment IN 
    SELECT li.id, li.amount, li.due_date, li.installment_number,
           l.beneficiary_id, b.full_name, b.user_id
    FROM loan_installments li
    JOIN loans l ON li.loan_id = l.id
    JOIN beneficiaries b ON l.beneficiary_id = b.id
    WHERE li.status = 'معلق' 
      AND li.due_date < CURRENT_DATE
  LOOP
    -- إشعار للمستفيد
    IF v_installment.user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_installment.user_id,
        'قسط قرض متأخر',
        'لديك قسط قرض متأخر رقم ' || v_installment.installment_number || ' بمبلغ ' || v_installment.amount || ' ريال',
        'warning',
        'loan_installment',
        v_installment.id,
        '/beneficiary/dashboard'
      );
    END IF;
    
    -- إشعار للإدارة
    FOR v_admin_id IN SELECT user_id FROM user_roles WHERE role IN ('admin', 'nazer', 'accountant')
    LOOP
      PERFORM create_notification(
        v_admin_id,
        'قسط قرض متأخر',
        'المستفيد ' || v_installment.full_name || ' لديه قسط متأخر بمبلغ ' || v_installment.amount || ' ريال',
        'warning',
        'loan_installment',
        v_installment.id,
        '/loans'
      );
    END LOOP;
  END LOOP;
END;
$$;

-- 3. إنشاء دالة refresh_financial_views
CREATE OR REPLACE FUNCTION public.refresh_financial_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- تحديث أرصدة الحسابات
  UPDATE accounts 
  SET current_balance = calculate_account_balance(id),
      updated_at = NOW()
  WHERE is_header = false;
  
  -- تحديث إجماليات المستفيدين
  UPDATE beneficiaries b
  SET total_received = COALESCE((
    SELECT SUM(allocated_amount) FROM distribution_details 
    WHERE beneficiary_id = b.id
  ), 0),
  updated_at = NOW();
  
  RAISE NOTICE 'تم تحديث التقارير المالية بنجاح';
END;
$$;

-- 4. إنشاء دالة archive_old_notifications
CREATE OR REPLACE FUNCTION public.archive_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_temp_count INTEGER;
BEGIN
  -- حذف الإشعارات المقروءة الأقدم من 30 يوم
  DELETE FROM notifications 
  WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_temp_count = ROW_COUNT;
  v_deleted_count := v_temp_count;
  
  -- حذف الإشعارات غير المقروءة الأقدم من 90 يوم
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_temp_count = ROW_COUNT;
  v_deleted_count := v_deleted_count + v_temp_count;
  
  RAISE NOTICE 'تم حذف % إشعار قديم', v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$;
