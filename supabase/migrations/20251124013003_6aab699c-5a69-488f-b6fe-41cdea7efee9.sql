-- إصلاح التحذيرات الأمنية: إضافة search_path للـ functions

CREATE OR REPLACE FUNCTION auto_update_distribution_status()
RETURNS TRIGGER AS $$
DECLARE
  total_approvals INT;
  approved_count INT;
BEGIN
  SELECT COUNT(*) INTO total_approvals
  FROM distribution_approvals
  WHERE distribution_id = NEW.distribution_id;
  
  SELECT COUNT(*) INTO approved_count
  FROM distribution_approvals
  WHERE distribution_id = NEW.distribution_id AND status = 'موافق';
  
  IF approved_count = total_approvals AND total_approvals > 0 THEN
    UPDATE distributions
    SET status = 'معتمد', updated_at = NOW()
    WHERE id = NEW.distribution_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION create_journal_entry_for_distribution()
RETURNS TRIGGER AS $$
DECLARE
  new_entry_id UUID;
  entry_number TEXT;
  debit_account_id UUID;
  credit_account_id UUID;
BEGIN
  IF NEW.status = 'معتمد' AND (OLD.status IS NULL OR OLD.status != 'معتمد') AND NEW.journal_entry_id IS NULL THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO entry_number FROM journal_entries;
    entry_number := 'JE-' || LPAD(entry_number::TEXT, 6, '0');
    
    SELECT id INTO debit_account_id FROM accounts WHERE code = '2100' LIMIT 1;
    SELECT id INTO credit_account_id FROM accounts WHERE code = '4100' LIMIT 1;
    
    INSERT INTO journal_entries (entry_number, entry_date, description, entry_type, status, reference_type, reference_id, total_debit, total_credit)
    VALUES (entry_number, NEW.distribution_date, 'توزيع معتمد - ' || NEW.month || ' - عدد المستفيدين: ' || NEW.beneficiaries_count, 'distribution', 'posted', 'distribution', NEW.id, NEW.total_amount, NEW.total_amount)
    RETURNING id INTO new_entry_id;
    
    IF debit_account_id IS NOT NULL AND credit_account_id IS NOT NULL THEN
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (new_entry_id, debit_account_id, 'توزيع شهر ' || NEW.month, NEW.total_amount, 0);
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (new_entry_id, credit_account_id, 'توزيع شهر ' || NEW.month, 0, NEW.total_amount);
    END IF;
    
    NEW.journal_entry_id := new_entry_id;
    INSERT INTO activities (user_name, action, timestamp) VALUES ('النظام', 'تم إنشاء قيد محاسبي تلقائي للتوزيع - ' || NEW.month, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION create_journal_entry_for_payment()
RETURNS TRIGGER AS $$
DECLARE
  new_entry_id UUID;
  entry_number TEXT;
  debit_account_id UUID;
  credit_account_id UUID;
BEGIN
  IF NEW.journal_entry_id IS NULL AND NEW.amount > 0 THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO entry_number FROM journal_entries;
    entry_number := 'JE-' || LPAD(entry_number::TEXT, 6, '0');
    
    IF NEW.payment_type = 'receipt' THEN
      SELECT id INTO debit_account_id FROM accounts WHERE code = '1010' LIMIT 1;
      SELECT id INTO credit_account_id FROM accounts WHERE code = '4100' LIMIT 1;
    ELSE
      SELECT id INTO debit_account_id FROM accounts WHERE code = '5100' LIMIT 1;
      SELECT id INTO credit_account_id FROM accounts WHERE code = '1010' LIMIT 1;
    END IF;
    
    INSERT INTO journal_entries (entry_number, entry_date, description, entry_type, status, reference_type, reference_id, total_debit, total_credit)
    VALUES (entry_number, NEW.payment_date, CASE WHEN NEW.payment_type = 'receipt' THEN 'سند قبض - ' ELSE 'سند صرف - ' END || NEW.description || ' - ' || NEW.payer_name, 'payment', 'posted', 'payment', NEW.id, NEW.amount, NEW.amount)
    RETURNING id INTO new_entry_id;
    
    IF debit_account_id IS NOT NULL AND credit_account_id IS NOT NULL THEN
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (new_entry_id, debit_account_id, NEW.description, NEW.amount, 0);
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit_amount, credit_amount)
      VALUES (new_entry_id, credit_account_id, NEW.description, 0, NEW.amount);
      UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE id = debit_account_id;
      UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = credit_account_id;
    END IF;
    
    NEW.journal_entry_id := new_entry_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION send_distribution_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'معتمد' AND (OLD.status IS NULL OR OLD.status != 'معتمد') THEN
    INSERT INTO notifications (title, message, type, priority, target_roles, reference_type, reference_id)
    VALUES ('تم اعتماد التوزيع', 'تم اعتماد توزيع شهر ' || NEW.month || ' بمبلغ ' || NEW.total_amount || ' ريال', 'distribution_approved', 'high', ARRAY['nazer', 'accountant', 'admin'], 'distribution', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;