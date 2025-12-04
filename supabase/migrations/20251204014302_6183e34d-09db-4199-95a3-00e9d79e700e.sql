-- تعديل دالة حساب الضريبة لاستخدام 15% مباشرة
CREATE OR REPLACE FUNCTION public.calculate_rental_tax()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  property_tax_rate NUMERIC;
BEGIN
  -- الحصول على نسبة الضريبة من العقار
  SELECT COALESCE(p.tax_percentage, 15) INTO property_tax_rate
  FROM contracts c
  JOIN properties p ON p.id = c.property_id
  WHERE c.id = NEW.contract_id;
  
  -- تعيين نسبة الضريبة
  NEW.tax_percentage := property_tax_rate;
  
  -- حساب مبلغ الضريبة (15% من المبلغ مباشرة)
  NEW.tax_amount := ROUND(NEW.amount_due * property_tax_rate / 100, 2);
  
  -- حساب المبلغ الصافي
  NEW.net_amount := NEW.amount_due - NEW.tax_amount;
  
  RETURN NEW;
END;
$function$;