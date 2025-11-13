-- إصلاح Function Search Path للأمان
-- تحديث جميع الـ functions لتكون آمنة

-- 1. تحديث update_family_members_count
CREATE OR REPLACE FUNCTION public.update_family_members_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE families 
    SET total_members = total_members + 1 
    WHERE id = NEW.family_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE families 
    SET total_members = total_members - 1 
    WHERE id = OLD.family_id;
  END IF;
  RETURN NULL;
END;
$function$;

-- 2. تحديث update_payment_status
CREATE OR REPLACE FUNCTION public.update_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- إذا تأخرت الدفعة
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'معلق' THEN
    NEW.status := 'متأخر';
    -- احتساب غرامة تأخير (1% من المبلغ المستحق عن كل يوم)
    NEW.late_fee := (CURRENT_DATE - NEW.due_date) * (NEW.amount_due * 0.01);
  END IF;
  
  -- إذا تم الدفع كاملاً
  IF NEW.amount_paid >= NEW.amount_due AND NEW.status != 'مدفوع' THEN
    NEW.status := 'مدفوع';
    NEW.payment_date := CURRENT_DATE;
  -- إذا تم دفع جزء
  ELSIF NEW.amount_paid > 0 AND NEW.amount_paid < NEW.amount_due THEN
    NEW.status := 'مدفوع جزئياً';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. تحديث update_contract_status
CREATE OR REPLACE FUNCTION public.update_contract_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- إذا انتهى العقد
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'نشط' THEN
    NEW.status := 'منتهي';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. تحديث update_loan_status
CREATE OR REPLACE FUNCTION public.update_loan_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total_remaining DECIMAL;
  v_has_overdue BOOLEAN;
BEGIN
  -- حساب المبلغ المتبقي
  SELECT COALESCE(SUM(remaining_amount), 0)
  INTO v_total_remaining
  FROM loan_installments
  WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id);
  
  -- التحقق من وجود أقساط متأخرة
  SELECT EXISTS(
    SELECT 1 FROM loan_installments 
    WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id)
    AND status = 'overdue'
  ) INTO v_has_overdue;
  
  -- تحديث حالة القرض
  UPDATE loans
  SET 
    status = CASE
      WHEN v_total_remaining = 0 THEN 'paid'
      WHEN v_has_overdue THEN 'defaulted'
      ELSE 'active'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.loan_id, OLD.loan_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;