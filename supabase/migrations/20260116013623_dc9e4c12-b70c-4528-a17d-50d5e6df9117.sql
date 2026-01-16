
-- إضافة عمود waqf_unit_id للقيود المحاسبية
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- إضافة عمود waqf_unit_id لسندات الصرف
ALTER TABLE payment_vouchers 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- إضافة عمود waqf_unit_id للمدفوعات
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- إضافة عمود waqf_unit_id لطلبات الصيانة
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- إضافة عمود waqf_unit_id لدفعات الإيجار
ALTER TABLE rental_payments 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- إنشاء دالة لتحديث قلم الوقف تلقائياً عند إنشاء سند صرف
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  -- إذا كان السند مرتبط بمستفيد، نجلب قلم الوقف من التوزيع
  IF NEW.distribution_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM distributions
    WHERE id = NEW.distribution_id;
    
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء الـ trigger
DROP TRIGGER IF EXISTS set_waqf_unit_for_voucher ON payment_vouchers;
CREATE TRIGGER set_waqf_unit_for_voucher
  BEFORE INSERT ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_voucher();

-- دالة لتحديث قلم الوقف تلقائياً عند إنشاء دفعة إيجار
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_rental()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  -- جلب قلم الوقف من العقد ثم العقار
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

-- إنشاء الـ trigger
DROP TRIGGER IF EXISTS set_waqf_unit_for_rental ON rental_payments;
CREATE TRIGGER set_waqf_unit_for_rental
  BEFORE INSERT ON rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_rental();

-- دالة لتحديث قلم الوقف تلقائياً عند إنشاء طلب صيانة
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_maintenance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  -- جلب قلم الوقف من العقار
  IF NEW.property_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM properties
    WHERE id = NEW.property_id;
    
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء الـ trigger
DROP TRIGGER IF EXISTS set_waqf_unit_for_maintenance ON maintenance_requests;
CREATE TRIGGER set_waqf_unit_for_maintenance
  BEFORE INSERT ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_maintenance();

-- دالة لتحديث قلم الوقف في القيد المحاسبي
CREATE OR REPLACE FUNCTION auto_set_waqf_unit_for_journal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waqf_unit_id UUID;
BEGIN
  -- إذا كان القيد مرتبط بتوزيع
  IF NEW.distribution_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM distributions
    WHERE id = NEW.distribution_id;
    
    NEW.waqf_unit_id := v_waqf_unit_id;
  -- إذا كان القيد مرتبط بسند صرف
  ELSIF NEW.reference_type = 'payment_voucher' AND NEW.reference_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM payment_vouchers
    WHERE id = NEW.reference_id::uuid;
    
    NEW.waqf_unit_id := v_waqf_unit_id;
  -- إذا كان القيد مرتبط بدفعة إيجار
  ELSIF NEW.reference_type = 'rental_payment' AND NEW.reference_id IS NOT NULL THEN
    SELECT waqf_unit_id INTO v_waqf_unit_id
    FROM rental_payments
    WHERE id = NEW.reference_id::uuid;
    
    NEW.waqf_unit_id := v_waqf_unit_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء الـ trigger
DROP TRIGGER IF EXISTS set_waqf_unit_for_journal ON journal_entries;
CREATE TRIGGER set_waqf_unit_for_journal
  BEFORE INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_waqf_unit_for_journal();

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_journal_entries_waqf_unit ON journal_entries(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_waqf_unit ON payment_vouchers(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_waqf_unit ON payments(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_waqf_unit ON rental_payments(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_waqf_unit ON maintenance_requests(waqf_unit_id);

-- إضافة تعليق توضيحي
COMMENT ON COLUMN journal_entries.waqf_unit_id IS 'قلم الوقف المرتبط بالقيد - يُحدث تلقائياً';
COMMENT ON COLUMN payment_vouchers.waqf_unit_id IS 'قلم الوقف المرتبط بالسند - يُحدث تلقائياً';
COMMENT ON COLUMN rental_payments.waqf_unit_id IS 'قلم الوقف المرتبط بالدفعة - يُحدث تلقائياً';
