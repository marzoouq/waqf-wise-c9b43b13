-- =============================================
-- المرحلة 3: إنشاء Functions و Triggers لدفعات الإيجار
-- =============================================

-- 1. Function لتوليد جدول الدفعات للعقد
CREATE OR REPLACE FUNCTION public.regenerate_payment_schedule(p_contract_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract RECORD;
  v_current_date DATE;
  v_count INTEGER := 0;
  v_end_date DATE;
BEGIN
  -- جلب بيانات العقد
  SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'العقد غير موجود: %', p_contract_id;
  END IF;
  
  -- حذف الدفعات القديمة غير المدفوعة
  DELETE FROM rental_payments 
  WHERE contract_id = p_contract_id 
  AND status IN ('pending', 'معلقة', 'overdue', 'متأخرة');
  
  -- تحديد تاريخ البداية والنهاية
  v_current_date := COALESCE(v_contract.start_date, CURRENT_DATE);
  v_end_date := COALESCE(v_contract.end_date, v_current_date + INTERVAL '1 year');
  
  -- توليد الدفعات الشهرية
  WHILE v_current_date < v_end_date AND v_count < 24 LOOP
    INSERT INTO rental_payments (
      contract_id, 
      tenant_id, 
      unit_id, 
      amount_due, 
      due_date, 
      status,
      period_start,
      period_end
    ) VALUES (
      p_contract_id, 
      v_contract.tenant_id, 
      v_contract.unit_id,
      COALESCE(v_contract.monthly_rent, 0), 
      v_current_date, 
      'معلقة',
      v_current_date,
      v_current_date + INTERVAL '1 month' - INTERVAL '1 day'
    )
    ON CONFLICT DO NOTHING;
    
    v_current_date := v_current_date + INTERVAL '1 month';
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- 2. Function للـ Trigger
CREATE OR REPLACE FUNCTION public.auto_generate_rental_payments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- توليد الدفعات عند تفعيل العقد
  IF NEW.status = 'نشط' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'نشط') THEN
    PERFORM regenerate_payment_schedule(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- 3. إنشاء الـ Trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_payments ON contracts;
CREATE TRIGGER trigger_auto_generate_payments
AFTER INSERT OR UPDATE OF status ON contracts
FOR EACH ROW 
EXECUTE FUNCTION auto_generate_rental_payments();

-- =============================================
-- المرحلة 5: ربط سندات الصرف بالمستأجرين
-- =============================================

-- إضافة أعمدة tenant_id و contract_id لجدول payment_vouchers
ALTER TABLE payment_vouchers
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_tenant_id ON payment_vouchers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_contract_id ON payment_vouchers(contract_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_status ON rental_payments(status);
CREATE INDEX IF NOT EXISTS idx_rental_payments_due_date ON rental_payments(due_date);

-- Function لتحديث دفتر المستأجر عند إنشاء سند صرف
CREATE OR REPLACE FUNCTION public.update_tenant_ledger_on_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تحديث رصيد المستأجر عند اكتمال السند
  IF NEW.tenant_id IS NOT NULL AND NEW.status IN ('مكتمل', 'paid', 'completed') THEN
    -- إذا كان سند صرف (دفع للمستأجر)
    IF NEW.voucher_type = 'payment' THEN
      UPDATE tenants
      SET balance = COALESCE(balance, 0) - COALESCE(NEW.amount, 0)
      WHERE id = NEW.tenant_id;
    -- إذا كان سند قبض (استلام من المستأجر)
    ELSIF NEW.voucher_type = 'receipt' THEN
      UPDATE tenants
      SET balance = COALESCE(balance, 0) + COALESCE(NEW.amount, 0)
      WHERE id = NEW.tenant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- إنشاء الـ Trigger للسندات
DROP TRIGGER IF EXISTS trigger_update_tenant_ledger ON payment_vouchers;
CREATE TRIGGER trigger_update_tenant_ledger
AFTER INSERT OR UPDATE OF status ON payment_vouchers
FOR EACH ROW 
EXECUTE FUNCTION update_tenant_ledger_on_voucher();