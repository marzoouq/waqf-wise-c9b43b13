
-- إعادة بناء شاملة للدوال والـ triggers

-- الخطوة 1: حذف كل شيء
DROP TRIGGER IF EXISTS auto_generate_payment_voucher_number ON payment_vouchers CASCADE;
DROP TRIGGER IF EXISTS auto_generate_invoice_number_trigger ON invoices CASCADE;
DROP TRIGGER IF EXISTS auto_generate_journal_entry_number ON journal_entries CASCADE;
DROP TRIGGER IF EXISTS trigger_create_journal_from_voucher ON payment_vouchers CASCADE;
DROP TRIGGER IF EXISTS auto_approve_distributions_trigger ON distribution_approvals CASCADE;
DROP TRIGGER IF EXISTS process_approval_trigger ON distribution_approvals CASCADE;

DROP FUNCTION IF EXISTS generate_payment_voucher_number() CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS generate_entry_number() CASCADE;
DROP FUNCTION IF EXISTS auto_approve_distribution() CASCADE;
DROP FUNCTION IF EXISTS process_approval_and_notify() CASCADE;

-- الخطوة 2: إنشاء الدوال
CREATE FUNCTION generate_payment_voucher_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_next_num INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(voucher_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO v_next_num FROM payment_vouchers WHERE voucher_number LIKE 'PV-' || v_year || '-%';
  NEW.voucher_number := 'PV-' || v_year || '-' || LPAD(v_next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_next_num INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO v_next_num FROM invoices WHERE invoice_number LIKE 'INV-' || v_year || '-%';
  NEW.invoice_number := 'INV-' || v_year || '-' || LPAD(v_next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION generate_entry_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_next_num INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO v_next_num FROM journal_entries WHERE entry_number LIKE 'JE-' || v_year || '-%';
  NEW.entry_number := 'JE-' || v_year || '-' || LPAD(v_next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION auto_approve_distribution()
RETURNS TRIGGER AS $$
DECLARE
  v_approval_count INTEGER;
  v_approved_count INTEGER;
  v_rejected_count INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'موافق'), COUNT(*) FILTER (WHERE status = 'مرفوض')
  INTO v_approval_count, v_approved_count, v_rejected_count
  FROM distribution_approvals WHERE distribution_id = NEW.distribution_id;
  
  IF v_rejected_count > 0 THEN
    UPDATE distributions SET status = 'مرفوض', updated_at = NOW() WHERE id = NEW.distribution_id;
    RETURN NEW;
  END IF;
  
  IF v_approval_count >= 3 AND v_approved_count = 3 THEN
    UPDATE distributions SET status = 'معتمد', updated_at = NOW() WHERE id = NEW.distribution_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE FUNCTION process_approval_and_notify()
RETURNS TRIGGER AS $$
BEGIN
  NEW.auto_approved := true;
  NEW.notification_sent := true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- الخطوة 3: إنشاء Triggers
CREATE TRIGGER auto_generate_payment_voucher_number
  BEFORE INSERT ON payment_vouchers
  FOR EACH ROW WHEN (NEW.voucher_number IS NULL OR NEW.voucher_number = '')
  EXECUTE FUNCTION generate_payment_voucher_number();

CREATE TRIGGER auto_generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER auto_generate_journal_entry_number
  BEFORE INSERT ON journal_entries
  FOR EACH ROW WHEN (NEW.entry_number IS NULL OR NEW.entry_number = '')
  EXECUTE FUNCTION generate_entry_number();

CREATE TRIGGER trigger_create_journal_from_voucher
  BEFORE UPDATE ON payment_vouchers
  FOR EACH ROW WHEN (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid'))
  EXECUTE FUNCTION create_journal_entry_from_voucher();

CREATE TRIGGER auto_approve_distributions_trigger
  AFTER INSERT ON distribution_approvals
  FOR EACH ROW EXECUTE FUNCTION auto_approve_distribution();

CREATE TRIGGER process_approval_trigger
  BEFORE INSERT ON distribution_approvals
  FOR EACH ROW EXECUTE FUNCTION process_approval_and_notify();
