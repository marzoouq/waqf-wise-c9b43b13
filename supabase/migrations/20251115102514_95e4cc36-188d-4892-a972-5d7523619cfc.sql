-- Create function to calculate account balance
CREATE OR REPLACE FUNCTION public.calculate_account_balance(account_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_nature account_nature;
  v_total_debit NUMERIC;
  v_total_credit NUMERIC;
  v_balance NUMERIC;
BEGIN
  -- Get account nature
  SELECT account_nature INTO v_account_nature
  FROM public.accounts
  WHERE id = account_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate total debit and credit from journal entry lines
  SELECT 
    COALESCE(SUM(debit_amount), 0),
    COALESCE(SUM(credit_amount), 0)
  INTO v_total_debit, v_total_credit
  FROM public.journal_entry_lines
  WHERE account_id = account_uuid;
  
  -- Calculate balance based on account nature
  IF v_account_nature = 'debit' THEN
    v_balance := v_total_debit - v_total_credit;
  ELSE
    v_balance := v_total_credit - v_total_debit;
  END IF;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

COMMENT ON FUNCTION public.calculate_account_balance(UUID) IS 'Calculates the current balance of an account based on journal entry lines and account nature';