-- إصلاح تحذيرات الأمان في Supabase

-- 1. إضافة search_path للـ 4 functions لمنع SQL Injection
CREATE OR REPLACE FUNCTION public.generate_beneficiary_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_year TEXT;
  next_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num := LPAD(nextval('beneficiary_number_seq')::TEXT, 4, '0');
  RETURN 'B-' || current_year || '-' || next_num;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_beneficiary_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.beneficiary_number IS NULL THEN
    NEW.beneficiary_number := generate_beneficiary_number();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_monthly_payment(principal numeric, annual_rate numeric, months integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  monthly_rate NUMERIC;
  payment NUMERIC;
BEGIN
  IF annual_rate = 0 OR annual_rate IS NULL THEN
    RETURN principal / months;
  END IF;
  
  monthly_rate := annual_rate / 12 / 100;
  payment := principal * (monthly_rate * POWER(1 + monthly_rate, months)) / 
             (POWER(1 + monthly_rate, months) - 1);
  
  RETURN ROUND(payment, 2);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_beneficiary_number(ben_id uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT beneficiary_number
  FROM public.beneficiaries
  WHERE id = ben_id
  LIMIT 1;
$function$;