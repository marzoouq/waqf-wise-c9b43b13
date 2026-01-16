
-- إصلاح تحذير الأمان للدالة
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.voucher_number IS NULL OR NEW.voucher_number = '' THEN
    NEW.voucher_number := 'V-' || LPAD(nextval('payment_vouchers_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
