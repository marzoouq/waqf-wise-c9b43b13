
-- إصلاح trigger المدفوعات - مشكلة ambiguous column
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
BEGIN
  -- توليد رقم القيد
  SELECT 'JE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
         LPAD((COALESCE(MAX(CAST(SUBSTRING(je.entry_number FROM '[0-9]+') AS INTEGER)), 0) + 1)::TEXT, 6, '0')
  INTO v_entry_number
  FROM journal_entries je;

  -- تحديد الحسابات حسب نوع السند
  IF NEW.payment_type = 'receipt' THEN
    -- سند قبض: مدين الصندوق / دائن الإيرادات
    SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1010' LIMIT 1; -- الصندوق
    SELECT id INTO v_credit_account_id FROM accounts WHERE code = '4010' LIMIT 1; -- الإيرادات
  ELSE
    -- سند صرف: مدين المصروفات / دائن الصندوق
    SELECT id INTO v_debit_account_id FROM accounts WHERE code = '5010' LIMIT 1; -- المصروفات
    SELECT id INTO v_credit_account_id FROM accounts WHERE code = '1010' LIMIT 1; -- الصندوق
  END IF;

  -- إنشاء القيد
  INSERT INTO journal_entries (entry_number, entry_date, description, reference_type, reference_id, created_by)
  VALUES (v_entry_number, NEW.payment_date, NEW.description, 'payment', NEW.id, 'النظام')
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
