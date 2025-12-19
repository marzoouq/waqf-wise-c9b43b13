-- إصلاح تحذير الأمان: Function Search Path Mutable
-- تحديث الـ Function مع تحديد search_path

CREATE OR REPLACE FUNCTION update_account_balance_on_entry()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_nature text;
  v_old_account_nature text;
BEGIN
  -- للإدراج أو التحديث
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- جلب طبيعة الحساب الجديد
    SELECT account_nature INTO v_account_nature 
    FROM accounts WHERE id = NEW.account_id;
    
    -- تحديث رصيد الحساب الجديد
    UPDATE accounts
    SET current_balance = (
      SELECT CASE 
        WHEN account_nature = 'credit' 
        THEN COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0)
        ELSE COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)
      END
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
      WHERE a.id = NEW.account_id
      GROUP BY a.account_nature
    ),
    updated_at = now()
    WHERE id = NEW.account_id;
  END IF;
  
  -- للحذف أو التحديث (الحساب القديم)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id) THEN
    -- تحديث رصيد الحساب القديم
    UPDATE accounts
    SET current_balance = (
      SELECT CASE 
        WHEN account_nature = 'credit' 
        THEN COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0)
        ELSE COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)
      END
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
      WHERE a.id = OLD.account_id
      GROUP BY a.account_nature
    ),
    updated_at = now()
    WHERE id = OLD.account_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;