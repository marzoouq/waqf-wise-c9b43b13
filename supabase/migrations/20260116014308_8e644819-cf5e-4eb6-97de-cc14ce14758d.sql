
-- أولاً: إضافة الأعمدة لجدول أقلام الوقف
ALTER TABLE waqf_units ADD COLUMN IF NOT EXISTS current_balance NUMERIC DEFAULT 0;
ALTER TABLE waqf_units ADD COLUMN IF NOT EXISTS total_income NUMERIC DEFAULT 0;
ALTER TABLE waqf_units ADD COLUMN IF NOT EXISTS total_expenses NUMERIC DEFAULT 0;

-- ============================================
-- دالة تحديث رصيد الصندوق عند إضافة معاملة
-- ============================================
CREATE OR REPLACE FUNCTION update_fund_balance_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.transaction_type IN ('credit', 'deposit', 'income') THEN
    UPDATE funds 
    SET allocated_amount = COALESCE(allocated_amount, 0) + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.fund_id;
  ELSIF NEW.transaction_type IN ('debit', 'withdrawal', 'expense') THEN
    UPDATE funds 
    SET spent_amount = COALESCE(spent_amount, 0) + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.fund_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_fund_balance ON fund_transactions;
CREATE TRIGGER trigger_update_fund_balance
  AFTER INSERT ON fund_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_fund_balance_on_transaction();

-- ============================================
-- دالة تحديث رصيد قلم الوقف عند سند الصرف
-- ============================================
CREATE OR REPLACE FUNCTION update_waqf_balance_on_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE waqf_units 
    SET total_expenses = COALESCE(total_expenses, 0) + NEW.amount,
        current_balance = COALESCE(current_balance, 0) - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_waqf_balance_on_voucher ON payment_vouchers;
CREATE TRIGGER trigger_update_waqf_balance_on_voucher
  AFTER UPDATE ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_waqf_balance_on_voucher();

-- ============================================
-- دالة تحديث رصيد قلم الوقف عند استلام إيجار
-- ============================================
CREATE OR REPLACE FUNCTION update_waqf_balance_on_rental()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    UPDATE waqf_units 
    SET total_income = COALESCE(total_income, 0) + COALESCE(NEW.amount_paid, 0),
        current_balance = COALESCE(current_balance, 0) + COALESCE(NEW.amount_paid, 0),
        updated_at = NOW()
    WHERE id = NEW.waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_waqf_balance_on_rental ON rental_payments;
CREATE TRIGGER trigger_update_waqf_balance_on_rental
  AFTER INSERT OR UPDATE ON rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_waqf_balance_on_rental();

-- ============================================
-- دالة تحديث رصيد قلم الوقف عند التوزيع
-- ============================================
CREATE OR REPLACE FUNCTION update_waqf_balance_on_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE waqf_units 
    SET total_expenses = COALESCE(total_expenses, 0) + COALESCE(NEW.distributable_amount, 0),
        current_balance = COALESCE(current_balance, 0) - COALESCE(NEW.distributable_amount, 0),
        updated_at = NOW()
    WHERE id = NEW.waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_waqf_balance_on_distribution ON distributions;
CREATE TRIGGER trigger_update_waqf_balance_on_distribution
  AFTER UPDATE ON distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_waqf_balance_on_distribution();

-- ============================================
-- دالة تحديث رصيد قلم الوقف عند المساعدات الطارئة (الفزعة)
-- ============================================
CREATE OR REPLACE FUNCTION update_waqf_balance_on_emergency_aid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    SELECT d.waqf_unit_id INTO v_waqf_unit_id
    FROM heir_distributions hd
    JOIN distributions d ON hd.distribution_id = d.id
    WHERE hd.beneficiary_id = NEW.beneficiary_id
    ORDER BY d.created_at DESC
    LIMIT 1;
    
    IF v_waqf_unit_id IS NOT NULL AND NEW.amount IS NOT NULL THEN
      UPDATE waqf_units 
      SET total_expenses = COALESCE(total_expenses, 0) + NEW.amount,
          current_balance = COALESCE(current_balance, 0) - NEW.amount,
          updated_at = NOW()
      WHERE id = v_waqf_unit_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_waqf_on_emergency ON beneficiary_requests;
CREATE TRIGGER trigger_update_waqf_on_emergency
  AFTER UPDATE ON beneficiary_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_waqf_balance_on_emergency_aid();

-- ============================================
-- View ملخص الأرصدة
-- ============================================
DROP VIEW IF EXISTS waqf_balance_summary;
CREATE VIEW waqf_balance_summary AS
SELECT 
  wu.id,
  wu.name,
  wu.code,
  COALESCE(wu.current_balance, 0) as current_balance,
  COALESCE(wu.total_income, 0) as total_income,
  COALESCE(wu.total_expenses, 0) as total_expenses,
  (SELECT COUNT(*) FROM distributions d WHERE d.waqf_unit_id = wu.id AND d.status = 'completed') as completed_distributions,
  (SELECT COALESCE(SUM(pv.amount), 0) FROM payment_vouchers pv WHERE pv.waqf_unit_id = wu.id AND pv.status = 'paid') as total_vouchers_paid,
  (SELECT COALESCE(SUM(rp.amount_paid), 0) FROM rental_payments rp WHERE rp.waqf_unit_id = wu.id AND rp.status = 'paid') as total_rentals_received
FROM waqf_units wu
WHERE wu.is_active = true;

-- فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_waqf_units_balance ON waqf_units(current_balance);
