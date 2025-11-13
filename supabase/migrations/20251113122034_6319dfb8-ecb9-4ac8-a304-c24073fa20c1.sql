-- إصلاح باقي الـ functions لتكون آمنة

-- 5. تحديث check_distribution_approvals
CREATE OR REPLACE FUNCTION public.check_distribution_approvals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_all_approved BOOLEAN;
  v_distribution_id UUID;
  v_any_rejected BOOLEAN;
BEGIN
  v_distribution_id := NEW.distribution_id;
  
  -- التحقق من وجود رفض
  SELECT EXISTS(
    SELECT 1 FROM distribution_approvals
    WHERE distribution_id = v_distribution_id AND status = 'مرفوض'
  ) INTO v_any_rejected;
  
  IF v_any_rejected THEN
    UPDATE distributions
    SET status = 'مرفوض'
    WHERE id = v_distribution_id;
    RETURN NEW;
  END IF;
  
  -- التحقق من اكتمال جميع الموافقات (3 مستويات)
  SELECT COUNT(*) = 3 AND COUNT(*) FILTER (WHERE status = 'موافق') = 3
  INTO v_all_approved
  FROM distribution_approvals
  WHERE distribution_id = v_distribution_id;
  
  -- تحديث حالة التوزيع
  IF v_all_approved THEN
    UPDATE distributions
    SET status = 'معتمد'
    WHERE id = v_distribution_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. تحديث check_request_approvals
CREATE OR REPLACE FUNCTION public.check_request_approvals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_all_approved BOOLEAN;
  v_request_id UUID;
  v_any_rejected BOOLEAN;
BEGIN
  v_request_id := NEW.request_id;
  
  -- التحقق من وجود رفض
  SELECT EXISTS(
    SELECT 1 FROM request_approvals
    WHERE request_id = v_request_id AND status = 'مرفوض'
  ) INTO v_any_rejected;
  
  IF v_any_rejected THEN
    UPDATE beneficiary_requests
    SET status = 'مرفوض'
    WHERE id = v_request_id;
    RETURN NEW;
  END IF;
  
  -- التحقق من اكتمال جميع الموافقات (3 مستويات)
  SELECT COUNT(*) = 3 AND COUNT(*) FILTER (WHERE status = 'موافق') = 3
  INTO v_all_approved
  FROM request_approvals
  WHERE request_id = v_request_id;
  
  -- تحديث حالة الطلب
  IF v_all_approved THEN
    UPDATE beneficiary_requests
    SET status = 'موافق عليه'
    WHERE id = v_request_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 7. تحديث update_account_balance
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- عند إنشاء سطر قيد جديد
  IF TG_OP = 'INSERT' THEN
    -- تحديث الحساب المدين
    IF NEW.debit_amount > 0 THEN
      UPDATE accounts 
      SET current_balance = COALESCE(current_balance, 0) + NEW.debit_amount
      WHERE id = NEW.account_id;
    END IF;
    
    -- تحديث الحساب الدائن
    IF NEW.credit_amount > 0 THEN
      UPDATE accounts 
      SET current_balance = COALESCE(current_balance, 0) - NEW.credit_amount
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 8. تحديث update_overdue_installments
CREATE OR REPLACE FUNCTION public.update_overdue_installments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE loan_installments
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
  AND status IN ('pending', 'partial');
END;
$function$;

-- 9. تحديث check_overdue_requests
CREATE OR REPLACE FUNCTION public.check_overdue_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE beneficiary_requests br
  SET is_overdue = true,
      updated_at = now()
  WHERE br.status IN ('قيد المراجعة', 'قيد المعالجة')
    AND br.is_overdue = false
    AND br.sla_due_at IS NOT NULL
    AND br.sla_due_at < now();
END;
$function$;