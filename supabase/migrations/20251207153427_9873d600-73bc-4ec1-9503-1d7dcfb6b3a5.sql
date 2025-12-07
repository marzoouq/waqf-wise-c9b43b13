
-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.calculate_tenant_balance(p_tenant_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0)
  INTO v_balance
  FROM public.tenant_ledger
  WHERE tenant_id = p_tenant_id;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_tenant_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_running_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0)
  INTO v_running_balance
  FROM public.tenant_ledger
  WHERE tenant_id = NEW.tenant_id
  AND (transaction_date < NEW.transaction_date 
       OR (transaction_date = NEW.transaction_date AND created_at < NEW.created_at));
  
  NEW.balance := v_running_balance + NEW.debit_amount - NEW.credit_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_tenant_number()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_year TEXT;
BEGIN
  IF NEW.tenant_number IS NULL THEN
    v_year := TO_CHAR(CURRENT_DATE, 'YY');
    SELECT COUNT(*) + 1 INTO v_count FROM public.tenants;
    NEW.tenant_number := 'T' || v_year || LPAD(v_count::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
