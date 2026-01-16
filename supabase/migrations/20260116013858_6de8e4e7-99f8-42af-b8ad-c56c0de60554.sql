
-- إضافة waqf_unit_id للجداول المالية الناقصة

-- 1. الفواتير
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- 2. القروض
ALTER TABLE loans ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- 3. دفعات القروض
ALTER TABLE loan_payments ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- 4. معاملات الصناديق
ALTER TABLE fund_transactions ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- 5. معاملات نقطة البيع
ALTER TABLE pos_transactions ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- 6. بنود الميزانية
ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- 7. توزيعات الورثة (لديها distribution_id يمكن الربط منه)
ALTER TABLE heir_distributions ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- ============================================
-- TRIGGERS للربط التلقائي
-- ============================================

-- Trigger للفواتير (من العقد)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  IF NEW.contract_id IS NOT NULL THEN
    SELECT p.waqf_unit_id INTO v_waqf_unit_id
    FROM contracts c
    JOIN properties p ON c.property_id = p.id
    WHERE c.id = NEW.contract_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_invoice ON invoices;
CREATE TRIGGER set_waqf_unit_for_invoice
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_invoice();

-- Trigger للقروض (من المستفيد والتوزيع)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_loan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  -- جلب قلم الوقف من أحدث توزيع للمستفيد
  IF NEW.beneficiary_id IS NOT NULL THEN
    SELECT d.waqf_unit_id INTO v_waqf_unit_id
    FROM heir_distributions hd
    JOIN distributions d ON hd.distribution_id = d.id
    WHERE hd.beneficiary_id = NEW.beneficiary_id
    ORDER BY d.created_at DESC
    LIMIT 1;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_loan ON loans;
CREATE TRIGGER set_waqf_unit_for_loan
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_loan();

-- Trigger لدفعات القروض (من القرض)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_loan_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  IF NEW.loan_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM loans WHERE id = NEW.loan_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_loan_payment ON loan_payments;
CREATE TRIGGER set_waqf_unit_for_loan_payment
  BEFORE INSERT ON loan_payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_loan_payment();

-- Trigger لمعاملات الصناديق (من الصندوق)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_fund_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  IF NEW.fund_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM funds WHERE id = NEW.fund_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_fund_transaction ON fund_transactions;
CREATE TRIGGER set_waqf_unit_for_fund_transaction
  BEFORE INSERT ON fund_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_fund_transaction();

-- Trigger لمعاملات نقطة البيع (من العقار عبر المستأجر)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_pos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT p.waqf_unit_id INTO v_waqf_unit_id
    FROM tenants t
    JOIN property_units pu ON t.unit_id = pu.id
    JOIN properties p ON pu.property_id = p.id
    WHERE t.id = NEW.tenant_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_pos ON pos_transactions;
CREATE TRIGGER set_waqf_unit_for_pos
  BEFORE INSERT ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_pos();

-- Trigger لتوزيعات الورثة (من التوزيع)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_heir_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  IF NEW.distribution_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM distributions WHERE id = NEW.distribution_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_heir_distribution ON heir_distributions;
CREATE TRIGGER set_waqf_unit_for_heir_distribution
  BEFORE INSERT ON heir_distributions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_heir_distribution();

-- Trigger للمدفوعات (من السند أو العقد)
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  -- من سند الصرف
  IF NEW.voucher_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM payment_vouchers WHERE id = NEW.voucher_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  -- من العقد
  ELSIF NEW.contract_id IS NOT NULL THEN
    SELECT p.waqf_unit_id INTO v_waqf_unit_id
    FROM contracts c
    JOIN properties p ON c.property_id = p.id
    WHERE c.id = NEW.contract_id;
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_waqf_unit_for_payment ON payments;
CREATE TRIGGER set_waqf_unit_for_payment
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_payment();

-- إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_invoices_waqf_unit ON invoices(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_loans_waqf_unit ON loans(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_waqf_unit ON loan_payments(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_waqf_unit ON fund_transactions(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_waqf_unit ON pos_transactions(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_heir_distributions_waqf_unit ON heir_distributions(waqf_unit_id);
