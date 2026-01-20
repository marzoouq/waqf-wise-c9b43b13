-- Fix security warnings: Add search_path to functions
CREATE OR REPLACE FUNCTION prevent_hard_delete_financial()
RETURNS trigger 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'الحذف الفيزيائي ممنوع في نظام الوقف المالي. استخدم soft delete بتحديث deleted_at بدلاً من ذلك. Hard delete is forbidden in Waqf financial system.';
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION protect_created_at()
RETURNS trigger 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'تعديل created_at ممنوع - الختم الزمني غير قابل للتغيير. Modifying created_at is forbidden - timestamp is immutable.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_dual_control()
RETURNS trigger 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  threshold_amount numeric;
  check_amount numeric;
BEGIN
  IF TG_TABLE_NAME = 'payment_vouchers' THEN
    threshold_amount := 10000;
    check_amount := COALESCE(NEW.amount, 0);
  ELSIF TG_TABLE_NAME = 'distributions' THEN
    threshold_amount := 50000;
    check_amount := COALESCE(NEW.total_amount, 0);
  ELSE
    threshold_amount := 10000;
    check_amount := COALESCE(NEW.amount, 0);
  END IF;
  
  IF NEW.status IN ('approved', 'posted', 'paid', 'completed') THEN
    IF check_amount > threshold_amount THEN
      IF NEW.approved_by IS NULL THEN
        RAISE EXCEPTION 'المبالغ التي تتجاوز % تتطلب موافقة. Amounts exceeding % require approval.', threshold_amount, threshold_amount;
      END IF;
      IF NEW.approved_by = NEW.created_by THEN
        RAISE EXCEPTION 'المبالغ التي تتجاوز % تتطلب موافقة من شخص مختلف عن المنشئ. Amounts exceeding % require approval from a different person than the creator.', threshold_amount, threshold_amount;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION immutable_audit_logs()
RETURNS trigger 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'سجلات التدقيق غير قابلة للتعديل أو الحذف. Audit logs are immutable and cannot be modified or deleted.';
  RETURN NULL;
END;
$$;