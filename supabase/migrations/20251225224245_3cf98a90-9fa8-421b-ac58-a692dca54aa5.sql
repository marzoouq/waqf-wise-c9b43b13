
-- إضافة عمود contract_id للفواتير إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'contract_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN contract_id UUID REFERENCES contracts(id);
  END IF;
END $$;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);

-- إنشاء دالة لإنشاء فاتورة من دفعة إيجار
CREATE OR REPLACE FUNCTION create_invoice_from_rental_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_contract RECORD;
  v_tenant RECORD;
  v_invoice_number TEXT;
  v_new_invoice_id UUID;
  v_subtotal NUMERIC;
  v_tax_amount NUMERIC;
  v_total_amount NUMERIC;
BEGIN
  -- جلب بيانات العقد
  SELECT * INTO v_contract FROM contracts WHERE id = NEW.contract_id;
  
  IF v_contract IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- جلب بيانات المستأجر
  SELECT * INTO v_tenant FROM tenants WHERE id = v_contract.tenant_id;
  
  IF v_tenant IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- حساب المبالغ
  v_subtotal := COALESCE(NEW.net_amount, NEW.amount_due);
  v_tax_amount := COALESCE(NEW.tax_amount, v_subtotal * 0.15);
  v_total_amount := v_subtotal + v_tax_amount;
  
  -- إنشاء رقم فاتورة جديد
  SELECT 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 13) AS INTEGER)), 0) + 1)::TEXT, 4, '0')
  INTO v_invoice_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  IF v_invoice_number IS NULL THEN
    v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-0001';
  END IF;
  
  -- إنشاء الفاتورة
  INSERT INTO invoices (
    invoice_number,
    invoice_date,
    customer_name,
    customer_phone,
    customer_address,
    customer_city,
    subtotal,
    tax_amount,
    tax_rate,
    total_amount,
    status,
    due_date,
    notes,
    tenant_id,
    contract_id,
    rental_payment_id,
    invoice_type
  ) VALUES (
    v_invoice_number,
    COALESCE(NEW.payment_date, CURRENT_DATE),
    v_tenant.full_name,
    v_tenant.phone,
    v_tenant.address,
    v_tenant.city,
    v_subtotal,
    v_tax_amount,
    COALESCE(NEW.tax_percentage, 15),
    v_total_amount,
    CASE WHEN NEW.status = 'paid' THEN 'paid' ELSE 'draft' END,
    NEW.due_date,
    'فاتورة إيجار - ' || v_contract.contract_number,
    v_tenant.id,
    v_contract.id,
    NEW.id,
    'rental'
  )
  RETURNING id INTO v_new_invoice_id;
  
  -- تحديث دفعة الإيجار برقم الفاتورة
  NEW.invoice_id := v_new_invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء الـ Trigger إذا لم يكن موجوداً
DROP TRIGGER IF EXISTS trigger_create_invoice_from_rental ON rental_payments;
CREATE TRIGGER trigger_create_invoice_from_rental
  BEFORE INSERT ON rental_payments
  FOR EACH ROW
  WHEN (NEW.invoice_id IS NULL)
  EXECUTE FUNCTION create_invoice_from_rental_payment();

-- تحديث الفواتير الموجودة لربطها بالمستأجرين
UPDATE invoices i
SET tenant_id = t.id
FROM tenants t
WHERE i.tenant_id IS NULL
  AND i.customer_name = t.full_name;
