-- إضافة حقل نسبة الضريبة للعقود
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC DEFAULT 0;

-- تحديث العقود الخاضعة للضريبة (القويشي، روائع النسيم، دار الذهب)
UPDATE contracts SET tax_percentage = 15 
WHERE tenant_name IN ('عبدالله محمد القويشي', 'شركة روائع النسيم المحدودة', 'شركة دار الذهب للذهب والمجوهرات');

-- تحديث trigger حساب الضريبة ليستخدم نسبة الضريبة من العقد
CREATE OR REPLACE FUNCTION calculate_rental_tax()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  contract_tax_pct NUMERIC;
BEGIN
  -- جلب نسبة الضريبة من العقد
  SELECT COALESCE(tax_percentage, 0) INTO contract_tax_pct
  FROM contracts
  WHERE id = NEW.contract_id;
  
  -- تطبيق الضريبة
  NEW.tax_percentage := contract_tax_pct;
  NEW.tax_amount := ROUND(NEW.amount_due * contract_tax_pct / 100, 2);
  NEW.net_amount := NEW.amount_due - NEW.tax_amount;
  
  RETURN NEW;
END;
$$;

-- التأكد من وجود trigger على rental_payments
DROP TRIGGER IF EXISTS calculate_rental_tax_trigger ON rental_payments;
CREATE TRIGGER calculate_rental_tax_trigger
  BEFORE INSERT OR UPDATE ON rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_rental_tax();

-- إضافة تعليق على الحقل
COMMENT ON COLUMN contracts.tax_percentage IS 'نسبة ضريبة القيمة المضافة - يحددها الناظر (0 = معفي، 15 = خاضع للضريبة)';