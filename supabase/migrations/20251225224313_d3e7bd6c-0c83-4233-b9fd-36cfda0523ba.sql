
-- إصلاح مشكلة search_path للدالة
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
  SELECT * INTO v_contract FROM public.contracts WHERE id = NEW.contract_id;
  
  IF v_contract IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- جلب بيانات المستأجر
  SELECT * INTO v_tenant FROM public.tenants WHERE id = v_contract.tenant_id;
  
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
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  IF v_invoice_number IS NULL THEN
    v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-0001';
  END IF;
  
  -- إنشاء الفاتورة
  INSERT INTO public.invoices (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
