
-- ============================================================
-- إصلاح شامل للنظام المحاسبي والربط التلقائي بأقلام الوقف
-- ============================================================

-- 1️⃣ إنشاء قلم وقف افتراضي إذا لم يوجد
INSERT INTO waqf_units (id, code, name, description, waqf_type, is_active, current_balance, total_income, total_expenses)
SELECT 
  gen_random_uuid(),
  'WU-001',
  'القلم الرئيسي',
  'قلم الوقف الافتراضي للعمليات العامة',
  'عقار',
  true,
  0,
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM waqf_units LIMIT 1);

-- 2️⃣ إعادة إنشاء الـ Triggers للربط التلقائي بأقلام الوقف
DROP TRIGGER IF EXISTS set_waqf_unit_for_voucher ON payment_vouchers;
DROP TRIGGER IF EXISTS set_waqf_unit_for_journal ON journal_entries;
DROP TRIGGER IF EXISTS set_waqf_unit_for_rental ON rental_payments;
DROP TRIGGER IF EXISTS trigger_update_waqf_balance_on_voucher ON payment_vouchers;

-- 3️⃣ Function لتعيين قلم الوقف الافتراضي للسندات
CREATE OR REPLACE FUNCTION auto_set_default_waqf_unit()
RETURNS TRIGGER AS $$
DECLARE
  default_waqf_id UUID;
BEGIN
  IF NEW.waqf_unit_id IS NULL THEN
    SELECT id INTO default_waqf_id FROM waqf_units WHERE is_active = true ORDER BY created_at LIMIT 1;
    IF default_waqf_id IS NOT NULL THEN
      NEW.waqf_unit_id := default_waqf_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4️⃣ تطبيق Triggers
CREATE TRIGGER set_waqf_unit_for_voucher
  BEFORE INSERT ON payment_vouchers FOR EACH ROW EXECUTE FUNCTION auto_set_default_waqf_unit();

CREATE TRIGGER set_waqf_unit_for_journal
  BEFORE INSERT ON journal_entries FOR EACH ROW EXECUTE FUNCTION auto_set_default_waqf_unit();

CREATE TRIGGER set_waqf_unit_for_rental
  BEFORE INSERT ON rental_payments FOR EACH ROW EXECUTE FUNCTION auto_set_default_waqf_unit();

-- 5️⃣ Function لتحديث رصيد قلم الوقف عند الصرف/القبض
CREATE OR REPLACE FUNCTION update_waqf_balance_on_voucher()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    IF NEW.status = 'paid' AND NEW.waqf_unit_id IS NOT NULL THEN
      IF NEW.voucher_type = 'payment' THEN
        UPDATE waqf_units SET 
          current_balance = COALESCE(current_balance, 0) - NEW.amount,
          total_expenses = COALESCE(total_expenses, 0) + NEW.amount,
          updated_at = NOW()
        WHERE id = NEW.waqf_unit_id;
      ELSIF NEW.voucher_type = 'receipt' THEN
        UPDATE waqf_units SET 
          current_balance = COALESCE(current_balance, 0) + NEW.amount,
          total_income = COALESCE(total_income, 0) + NEW.amount,
          updated_at = NOW()
        WHERE id = NEW.waqf_unit_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_waqf_balance_on_voucher
  AFTER INSERT OR UPDATE ON payment_vouchers FOR EACH ROW EXECUTE FUNCTION update_waqf_balance_on_voucher();

-- 6️⃣ Function لإنشاء قيد محاسبي تلقائي عند الدفع
CREATE OR REPLACE FUNCTION auto_create_journal_for_voucher()
RETURNS TRIGGER AS $$
DECLARE
  v_fiscal_year_id UUID;
  v_cash_account_id UUID;
  v_liability_account_id UUID;
  v_revenue_account_id UUID;
  v_journal_id UUID;
  v_entry_number TEXT;
  v_last_number INT;
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') AND NEW.journal_entry_id IS NULL THEN
    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
    IF v_fiscal_year_id IS NULL THEN RETURN NEW; END IF;
    
    SELECT id INTO v_cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
    SELECT id INTO v_liability_account_id FROM accounts WHERE code = '2.1' LIMIT 1;
    SELECT id INTO v_revenue_account_id FROM accounts WHERE code = '4.1' LIMIT 1;
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(entry_number, '-', 2) AS INTEGER)), 0) INTO v_last_number
    FROM journal_entries WHERE entry_number LIKE 'JE-%';
    v_entry_number := 'JE-' || LPAD((v_last_number + 1)::TEXT, 6, '0');
    
    INSERT INTO journal_entries (entry_number, entry_date, description, status, fiscal_year_id, reference_type, reference_id, waqf_unit_id)
    VALUES (
      v_entry_number, CURRENT_DATE, 
      CASE NEW.voucher_type WHEN 'receipt' THEN 'سند قبض رقم ' ELSE 'سند صرف رقم ' END || NEW.voucher_number || ' - ' || COALESCE(NEW.description, ''),
      'posted', v_fiscal_year_id, 'payment_voucher', NEW.id, NEW.waqf_unit_id
    ) RETURNING id INTO v_journal_id;
    
    IF NEW.voucher_type = 'receipt' THEN
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, line_number, description, debit_amount, credit_amount) VALUES 
        (v_journal_id, v_cash_account_id, 1, 'استلام نقدي - ' || NEW.voucher_number, NEW.amount, 0),
        (v_journal_id, COALESCE(v_revenue_account_id, v_liability_account_id), 2, 'إيراد - ' || NEW.voucher_number, 0, NEW.amount);
    ELSE
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, line_number, description, debit_amount, credit_amount) VALUES 
        (v_journal_id, v_liability_account_id, 1, 'صرف - ' || NEW.voucher_number, NEW.amount, 0),
        (v_journal_id, v_cash_account_id, 2, 'صرف نقدي - ' || NEW.voucher_number, 0, NEW.amount);
    END IF;
    
    NEW.journal_entry_id := v_journal_id;
    
    INSERT INTO auto_journal_log (journal_entry_id, trigger_event, reference_id, reference_type, amount, success)
    VALUES (v_journal_id, NEW.voucher_type || '_paid', NEW.id, 'payment_voucher', NEW.amount, true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_auto_journal_for_voucher ON payment_vouchers;
CREATE TRIGGER trigger_auto_journal_for_voucher
  BEFORE UPDATE ON payment_vouchers FOR EACH ROW EXECUTE FUNCTION auto_create_journal_for_voucher();

-- 7️⃣ تحديث السندات الحالية لربطها بقلم الوقف
UPDATE payment_vouchers 
SET waqf_unit_id = (SELECT id FROM waqf_units WHERE is_active = true ORDER BY created_at LIMIT 1)
WHERE waqf_unit_id IS NULL;
