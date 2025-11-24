
-- ======================================
-- المرحلة الثانية: التوليد التلقائي للأرقام
-- ======================================

-- 1. دالة توليد رقم السند التلقائي (Payment Voucher)
CREATE OR REPLACE FUNCTION generate_payment_voucher_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  prefix TEXT;
  year_part TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN voucher_number ~ '^PV-[0-9]{4}-[0-9]+$' 
      THEN CAST(SUBSTRING(voucher_number FROM 'PV-[0-9]{4}-([0-9]+)') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_number
  FROM payment_vouchers
  WHERE voucher_number LIKE 'PV-' || year_part || '-%';
  
  RETURN 'PV-' || year_part || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. دالة توليد رقم الفاتورة التلقائي (Invoice)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ '^INV-[0-9]{4}-[0-9]+$' 
      THEN CAST(SUBSTRING(invoice_number FROM 'INV-[0-9]{4}-([0-9]+)') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  
  RETURN 'INV-' || year_part || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. دالة توليد رقم القيد اليومي التلقائي (Journal Entry)
CREATE OR REPLACE FUNCTION generate_entry_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN entry_number ~ '^JE-[0-9]{4}-[0-9]+$' 
      THEN CAST(SUBSTRING(entry_number FROM 'JE-[0-9]{4}-([0-9]+)') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_number
  FROM journal_entries
  WHERE entry_number LIKE 'JE-' || year_part || '-%';
  
  RETURN 'JE-' || year_part || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger لتوليد رقم السند تلقائياً
CREATE OR REPLACE FUNCTION auto_generate_payment_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voucher_number IS NULL OR NEW.voucher_number = '' THEN
    NEW.voucher_number := generate_payment_voucher_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_payment_voucher_number ON payment_vouchers;
CREATE TRIGGER trigger_auto_payment_voucher_number
  BEFORE INSERT ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_payment_voucher_number();

-- 5. Trigger لتوليد رقم الفاتورة تلقائياً
CREATE OR REPLACE FUNCTION auto_generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_invoice_number ON invoices;
CREATE TRIGGER trigger_auto_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invoice_number();

-- 6. Trigger لتوليد رقم القيد تلقائياً
CREATE OR REPLACE FUNCTION auto_generate_entry_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_number IS NULL OR NEW.entry_number = '' THEN
    NEW.entry_number := generate_entry_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_entry_number ON journal_entries;
CREATE TRIGGER trigger_auto_entry_number
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_entry_number();

-- 7. دالة لتوليد قيد يومي من سند صرف/قبض تلقائياً
CREATE OR REPLACE FUNCTION create_journal_entry_from_voucher()
RETURNS TRIGGER AS $$
DECLARE
  fiscal_year_record RECORD;
  cash_account_id UUID;
  expense_account_id UUID;
  entry_id UUID;
BEGIN
  -- الحصول على السنة المالية النشطة
  SELECT id INTO fiscal_year_record
  FROM fiscal_years
  WHERE NEW.voucher_date BETWEEN start_date AND end_date
  AND is_closed = false
  LIMIT 1;

  IF fiscal_year_record IS NULL THEN
    RAISE NOTICE 'No active fiscal year found for date %', NEW.voucher_date;
    RETURN NEW;
  END IF;

  -- الحصول على حسابات النقدية والمصروفات
  SELECT id INTO cash_account_id
  FROM accounts
  WHERE code = '1010' -- حساب النقدية
  LIMIT 1;

  SELECT id INTO expense_account_id
  FROM accounts
  WHERE code = '5010' -- حساب المصروفات
  LIMIT 1;

  -- إنشاء القيد اليومي
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    fiscal_year_id,
    description,
    reference_type,
    reference_id,
    status
  ) VALUES (
    generate_entry_number(),
    NEW.voucher_date,
    fiscal_year_record.id,
    NEW.description,
    'payment_voucher',
    NEW.id,
    'posted'
  ) RETURNING id INTO entry_id;

  -- إضافة سطور القيد (مدين ودائن)
  IF NEW.voucher_type = 'payment' THEN
    -- سند صرف: مدين (مصروف) / دائن (نقدية)
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description, line_number)
    VALUES 
      (entry_id, expense_account_id, NEW.amount, 0, NEW.description, 1),
      (entry_id, cash_account_id, 0, NEW.amount, NEW.description, 2);
  ELSE
    -- سند قبض: مدين (نقدية) / دائن (إيراد)
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description, line_number)
    VALUES 
      (entry_id, cash_account_id, NEW.amount, 0, NEW.description, 1),
      (entry_id, expense_account_id, 0, NEW.amount, NEW.description, 2);
  END IF;

  NEW.journal_entry_id := entry_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_journal_from_voucher ON payment_vouchers;
CREATE TRIGGER trigger_create_journal_from_voucher
  AFTER INSERT ON payment_vouchers
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND NEW.journal_entry_id IS NULL)
  EXECUTE FUNCTION create_journal_entry_from_voucher();

-- 8. دالة لتوليد ميزانية تلقائية من السنة السابقة
CREATE OR REPLACE FUNCTION generate_budget_from_previous_year(
  p_fiscal_year_id UUID,
  p_increase_percentage NUMERIC DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE
  previous_year_id UUID;
  records_created INTEGER := 0;
BEGIN
  -- الحصول على السنة المالية السابقة
  SELECT id INTO previous_year_id
  FROM fiscal_years
  WHERE end_date < (SELECT start_date FROM fiscal_years WHERE id = p_fiscal_year_id)
  ORDER BY end_date DESC
  LIMIT 1;

  IF previous_year_id IS NULL THEN
    RAISE NOTICE 'No previous fiscal year found';
    RETURN 0;
  END IF;

  -- نسخ الميزانيات من السنة السابقة مع زيادة اختيارية
  INSERT INTO budgets (
    fiscal_year_id,
    account_id,
    period_type,
    period_number,
    budgeted_amount
  )
  SELECT 
    p_fiscal_year_id,
    account_id,
    period_type,
    period_number,
    budgeted_amount * (1 + p_increase_percentage / 100)
  FROM budgets
  WHERE fiscal_year_id = previous_year_id;

  GET DIAGNOSTICS records_created = ROW_COUNT;
  
  RETURN records_created;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_budget_from_previous_year IS 'توليد ميزانية تلقائية من السنة المالية السابقة مع إمكانية زيادة نسبة مئوية';
