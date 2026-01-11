-- إصلاح search_path للـ function
CREATE OR REPLACE FUNCTION update_account_balance_on_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
  v_new_balance NUMERIC(15,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_account_id := OLD.account_id;
  ELSE
    v_account_id := NEW.account_id;
  END IF;
  
  SELECT COALESCE(SUM(
    CASE WHEN a.account_nature = 'debit' THEN jel.debit_amount - jel.credit_amount
    ELSE jel.credit_amount - jel.debit_amount END
  ), 0) INTO v_new_balance
  FROM public.journal_entry_lines jel
  JOIN public.journal_entries je ON je.id = jel.journal_entry_id
  JOIN public.accounts a ON a.id = jel.account_id
  WHERE jel.account_id = v_account_id AND je.status = 'posted';
  
  UPDATE public.accounts SET current_balance = v_new_balance, updated_at = now()
  WHERE id = v_account_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public