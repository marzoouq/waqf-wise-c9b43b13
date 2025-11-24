
-- إصلاح توليد رقم القيد ليكون فريداً
CREATE OR REPLACE FUNCTION create_journal_entry_for_payment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_entry_number TEXT;
  v_entry_id UUID;
  v_debit_account_id UUID;
  v_credit_account_id UUID;
  v_fiscal_year_id UUID;
  v_next_number INTEGER;
BEGIN
  -- الحصول على السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id 
  FROM fiscal_years 
  WHERE is_active = true 
  LIMIT 1;

  IF v_fiscal_year_id IS NULL THEN
    SELECT id INTO v_fiscal_year_id FROM fiscal_years ORDER BY start_date DESC LIMIT 1;
  END IF;

  -- توليد رقم القيد الفريد
  SELECT COALESCE(MAX(
    CASE 
      WHEN entry_number ~ '^JE-[0-9]{4}-[0-9]+$' 
      THEN CAST(SUBSTRING(entry_number FROM 'JE-[0-9]{4}-([0-9]+)') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO v_next_number
  FROM journal_entries
  WHERE entry_number LIKE 'JE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%';

  v_entry_number := 'JE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(v_next_number::TEXT, 6, '0');

  -- تحديد الحسابات حسب نوع السند
  IF NEW.payment_type = 'receipt' THEN
    SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1010' LIMIT 1;
    SELECT id INTO v_credit_account_id FROM accounts WHERE code = '4010' LIMIT 1;
  ELSE
    SELECT id INTO v_debit_account_id FROM accounts WHERE code = '5010' LIMIT 1;
    SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1010' LIMIT 1;
  END IF;

  -- إنشاء القيد
  INSERT INTO journal_entries (entry_number, entry_date, description, reference_type, reference_id, fiscal_year_id)
  VALUES (v_entry_number, NEW.payment_date, NEW.description, 'payment', NEW.id, v_fiscal_year_id)
  RETURNING id INTO v_entry_id;

  -- إضافة سطور القيد
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description, line_number)
  VALUES 
    (v_entry_id, v_debit_account_id, NEW.amount, 0, NEW.description, 1),
    (v_entry_id, v_credit_account_id, 0, NEW.amount, NEW.description, 2);

  RETURN NEW;
END;
$$;
