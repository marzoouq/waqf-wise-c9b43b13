
-- إنشاء sequence للترقيم التلقائي للسندات
DROP SEQUENCE IF EXISTS payment_vouchers_seq CASCADE;
CREATE SEQUENCE payment_vouchers_seq START 1;

-- دالة لتوليد رقم سند تلقائي تسلسلي
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voucher_number IS NULL OR NEW.voucher_number = '' THEN
    NEW.voucher_number := 'V-' || LPAD(nextval('payment_vouchers_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء الـ trigger
DROP TRIGGER IF EXISTS auto_voucher_number ON payment_vouchers;
CREATE TRIGGER auto_voucher_number
  BEFORE INSERT ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION generate_voucher_number();
