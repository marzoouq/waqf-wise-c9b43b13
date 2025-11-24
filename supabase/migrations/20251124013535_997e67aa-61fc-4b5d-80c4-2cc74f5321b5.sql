
-- إصلاح trigger المدفوعات - إضافة fiscal_year_id
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
BEGIN
  -- الحصول على السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id 
  FROM fiscal_years 
  WHERE is_active = true 
  LIMIT 1;

  -- إذا لم توجد سنة مالية نشطة، نستخدم أول سنة مالية
  IF v_fiscal_year_id IS NULL THEN
    SELECT id INTO v_fiscal_year_id FROM fiscal_years ORDER BY start_date DESC LIMIT 1;
  END IF;

  -- توليد رقم القيد
  SELECT 'JE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
         LPAD((COALESCE(MAX(CAST(SUBSTRING(je.entry_number FROM '[0-9]+') AS INTEGER)), 0) + 1)::TEXT, 6, '0')
  INTO v_entry_number
  FROM journal_entries je;

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

  -- إضافة سطور القيد (مدين)
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
  VALUES (v_entry_id, v_debit_account_id, NEW.amount, 0, NEW.description);

  -- إضافة سطور القيد (دائن)
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
  VALUES (v_entry_id, v_credit_account_id, 0, NEW.amount, NEW.description);

  RETURN NEW;
END;
$$;
