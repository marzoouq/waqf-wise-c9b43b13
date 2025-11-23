-- إضافة حقول الضريبة إلى جدول rental_payments
ALTER TABLE rental_payments
ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC DEFAULT 15,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount NUMERIC DEFAULT 0;

-- تحديث البيانات الموجودة
UPDATE rental_payments
SET 
  tax_percentage = 15,
  tax_amount = ROUND((amount_due * 15) / 115, 2),
  net_amount = ROUND(amount_due - ((amount_due * 15) / 115), 2)
WHERE tax_amount IS NULL OR tax_amount = 0;

-- إنشاء أو تعديل دالة لحساب الضريبة تلقائياً عند إدخال دفعة إيجار
CREATE OR REPLACE FUNCTION calculate_rental_tax()
RETURNS TRIGGER AS $$
DECLARE
  property_tax_rate NUMERIC;
BEGIN
  -- الحصول على نسبة الضريبة من العقار
  SELECT COALESCE(p.tax_percentage, 15) INTO property_tax_rate
  FROM contracts c
  JOIN properties p ON p.id = c.property_id
  WHERE c.id = NEW.contract_id;
  
  -- تعيين نسبة الضريبة
  NEW.tax_percentage := property_tax_rate;
  
  -- حساب مبلغ الضريبة (المبلغ المدفوع يشمل الضريبة)
  -- المعادلة: tax = (amount × tax_rate) / (100 + tax_rate)
  NEW.tax_amount := ROUND((NEW.amount_due * property_tax_rate) / (100 + property_tax_rate), 2);
  
  -- حساب المبلغ الصافي (بدون ضريبة)
  NEW.net_amount := NEW.amount_due - NEW.tax_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتطبيق الحساب التلقائي
DROP TRIGGER IF EXISTS trigger_calculate_rental_tax ON rental_payments;
CREATE TRIGGER trigger_calculate_rental_tax
BEFORE INSERT OR UPDATE ON rental_payments
FOR EACH ROW
EXECUTE FUNCTION calculate_rental_tax();

-- حذف الدالة القديمة
DROP FUNCTION IF EXISTS create_rental_invoice_and_receipt(UUID, UUID, NUMERIC, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- إنشاء دالة RPC جديدة لإنشاء الفاتورة والقيد المحاسبي مع فصل الضريبة
CREATE FUNCTION create_rental_invoice_and_receipt(
  p_rental_payment_id UUID,
  p_contract_id UUID,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_payment_method TEXT,
  p_tenant_name TEXT DEFAULT NULL,
  p_tenant_id TEXT DEFAULT NULL,
  p_tenant_email TEXT DEFAULT NULL,
  p_tenant_phone TEXT DEFAULT NULL,
  p_property_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  invoice_id UUID,
  receipt_id UUID,
  journal_entry_id UUID,
  message TEXT
) AS $$
DECLARE
  v_invoice_id UUID;
  v_receipt_id UUID;
  v_journal_entry_id UUID;
  v_invoice_number TEXT;
  v_receipt_number TEXT;
  v_entry_number TEXT;
  v_fiscal_year_id UUID;
  v_cash_account_id UUID;
  v_revenue_account_id UUID;
  v_vat_account_id UUID;
  v_tax_amount NUMERIC;
  v_net_amount NUMERIC;
  v_tax_percentage NUMERIC;
BEGIN
  -- الحصول على معلومات الضريبة من الدفعة
  SELECT tax_percentage, tax_amount, net_amount
  INTO v_tax_percentage, v_tax_amount, v_net_amount
  FROM rental_payments
  WHERE id = p_rental_payment_id;
  
  -- الحصول على السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE status = 'active'
  LIMIT 1;
  
  IF v_fiscal_year_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID, 'لا توجد سنة مالية نشطة';
    RETURN;
  END IF;
  
  -- الحصول على IDs للحسابات المحاسبية
  SELECT id INTO v_cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
  SELECT id INTO v_revenue_account_id FROM accounts WHERE code = '4110' LIMIT 1;
  SELECT id INTO v_vat_account_id FROM accounts WHERE code = '2130' LIMIT 1;
  
  IF v_cash_account_id IS NULL OR v_revenue_account_id IS NULL OR v_vat_account_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID, 'حسابات المحاسبة غير موجودة';
    RETURN;
  END IF;
  
  -- إنشاء رقم الفاتورة
  v_invoice_number := 'INV-' || LPAD(EXTRACT(YEAR FROM p_payment_date)::TEXT, 4, '0') || 
                      '-' || LPAD(nextval('invoice_sequence')::TEXT, 6, '0');
  
  -- إنشاء الفاتورة
  INSERT INTO invoices (
    invoice_number,
    invoice_date,
    customer_name,
    customer_vat_number,
    customer_phone,
    customer_email,
    total_amount,
    tax_amount,
    net_amount,
    status,
    payment_status,
    reference_type,
    reference_id
  ) VALUES (
    v_invoice_number,
    p_payment_date,
    p_tenant_name,
    p_tenant_id,
    p_tenant_phone,
    p_tenant_email,
    p_amount,
    v_tax_amount,
    v_net_amount,
    'issued',
    'paid',
    'rental_payment',
    p_rental_payment_id
  ) RETURNING id INTO v_invoice_id;
  
  -- إنشاء بنود الفاتورة
  INSERT INTO invoice_lines (
    invoice_id,
    line_number,
    description,
    quantity,
    unit_price,
    tax_rate,
    tax_amount,
    line_total
  ) VALUES (
    v_invoice_id,
    1,
    'إيجار ' || COALESCE(p_property_name, 'عقار'),
    1,
    v_net_amount,
    v_tax_percentage,
    v_tax_amount,
    p_amount
  );
  
  -- إنشاء رقم سند القبض
  v_receipt_number := 'REC-' || LPAD(EXTRACT(YEAR FROM p_payment_date)::TEXT, 4, '0') || 
                      '-' || LPAD(nextval('payment_sequence')::TEXT, 6, '0');
  
  -- إنشاء سند القبض
  INSERT INTO payments (
    payment_number,
    payment_date,
    payment_type,
    amount,
    payment_method,
    payer_name,
    reference_type,
    reference_id,
    status
  ) VALUES (
    v_receipt_number,
    p_payment_date,
    'receipt',
    p_amount,
    p_payment_method,
    p_tenant_name,
    'rental_payment',
    p_rental_payment_id,
    'completed'
  ) RETURNING id INTO v_receipt_id;
  
  -- إنشاء رقم القيد
  v_entry_number := 'JE-' || LPAD(EXTRACT(YEAR FROM p_payment_date)::TEXT, 4, '0') || 
                    '-' || LPAD(nextval('journal_entry_sequence')::TEXT, 6, '0');
  
  -- إنشاء القيد المحاسبي
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    fiscal_year_id,
    description,
    reference_type,
    reference_id,
    status,
    posted_at
  ) VALUES (
    v_entry_number,
    p_payment_date,
    v_fiscal_year_id,
    'قيد إيجار - ' || v_invoice_number,
    'rental_payment',
    p_rental_payment_id,
    'posted',
    NOW()
  ) RETURNING id INTO v_journal_entry_id;
  
  -- إنشاء بنود القيد المحاسبي
  -- مدين: النقدية (إجمالي المبلغ شامل الضريبة)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    debit_amount,
    credit_amount,
    description
  ) VALUES (
    v_journal_entry_id,
    v_cash_account_id,
    1,
    p_amount,
    0,
    'قبض إيجار نقدي'
  );
  
  -- دائن: إيرادات الإيجارات (المبلغ الصافي بدون ضريبة)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    debit_amount,
    credit_amount,
    description
  ) VALUES (
    v_journal_entry_id,
    v_revenue_account_id,
    2,
    0,
    v_net_amount,
    'إيراد إيجار صافي'
  );
  
  -- دائن: ضريبة القيمة المضافة المستحقة
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    debit_amount,
    credit_amount,
    description
  ) VALUES (
    v_journal_entry_id,
    v_vat_account_id,
    3,
    0,
    v_tax_amount,
    'ضريبة قيمة مضافة ' || v_tax_percentage || '%'
  );
  
  -- تحديث أرصدة الحسابات
  UPDATE accounts SET current_balance = current_balance + p_amount WHERE id = v_cash_account_id;
  UPDATE accounts SET current_balance = current_balance + v_net_amount WHERE id = v_revenue_account_id;
  UPDATE accounts SET current_balance = current_balance + v_tax_amount WHERE id = v_vat_account_id;
  
  -- تحديث الدفعة بربطها بالفاتورة وسند القبض والقيد
  UPDATE rental_payments
  SET 
    invoice_id = v_invoice_id,
    receipt_id = v_receipt_id,
    journal_entry_id = v_journal_entry_id
  WHERE id = p_rental_payment_id;
  
  RETURN QUERY SELECT 
    true,
    v_invoice_id,
    v_receipt_id,
    v_journal_entry_id,
    'تم إنشاء الفاتورة وسند القبض والقيد المحاسبي بنجاح';
END;
$$ LANGUAGE plpgsql;