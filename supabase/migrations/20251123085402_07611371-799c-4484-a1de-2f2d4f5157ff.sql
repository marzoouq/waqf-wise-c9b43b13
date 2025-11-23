-- تحديث دالة create_rental_invoice_and_receipt لدعم الضريبة
CREATE OR REPLACE FUNCTION public.create_rental_invoice_and_receipt(
  p_rental_payment_id uuid,
  p_contract_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_payment_method text DEFAULT 'نقدي'::text,
  p_tenant_name text DEFAULT NULL::text,
  p_tenant_id text DEFAULT NULL::text,
  p_tenant_email text DEFAULT NULL::text,
  p_tenant_phone text DEFAULT NULL::text,
  p_property_name text DEFAULT NULL::text
)
RETURNS TABLE(
  invoice_id uuid,
  receipt_id uuid,
  journal_entry_id uuid,
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_invoice_id UUID;
  v_receipt_id UUID;
  v_journal_entry_id UUID;
  v_fiscal_year_id UUID;
  v_invoice_number TEXT;
  v_receipt_number TEXT;
  v_entry_number TEXT;
  v_debit_account UUID;
  v_credit_account UUID;
  v_tax_account UUID;
  v_tenant_name TEXT;
  v_tenant_id TEXT;
  v_tenant_email TEXT;
  v_tenant_phone TEXT;
  v_property_name TEXT;
  v_property_id UUID;
  v_payment_number TEXT;
  v_tax_percentage NUMERIC;
  v_tax_amount NUMERIC;
  v_revenue_amount NUMERIC;
BEGIN
  -- التحقق من وجود دفعة الإيجار
  IF NOT EXISTS(SELECT 1 FROM rental_payments WHERE id = p_rental_payment_id) THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::UUID, 
      false, 'دفعة الإيجار غير موجودة';
    RETURN;
  END IF;

  -- الحصول على السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE is_active = true
  LIMIT 1;

  IF v_fiscal_year_id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::UUID,
      false, 'لا توجد سنة مالية نشطة';
    RETURN;
  END IF;

  -- جلب بيانات المستأجر والعقار من العقد
  SELECT 
    c.tenant_name, 
    c.tenant_id_number,
    c.tenant_email,
    c.tenant_phone,
    p.name,
    p.id,
    COALESCE(p.tax_percentage, 15)
  INTO v_tenant_name, v_tenant_id, v_tenant_email, v_tenant_phone, v_property_name, v_property_id, v_tax_percentage
  FROM contracts c
  LEFT JOIN properties p ON p.id = c.property_id
  WHERE c.id = p_contract_id;

  -- استخدام القيم الممررة إذا كانت موجودة
  v_tenant_name := COALESCE(p_tenant_name, v_tenant_name);
  v_tenant_id := COALESCE(p_tenant_id, v_tenant_id);
  v_tenant_email := COALESCE(p_tenant_email, v_tenant_email);
  v_tenant_phone := COALESCE(p_tenant_phone, v_tenant_phone);
  v_property_name := COALESCE(p_property_name, v_property_name);

  -- حساب الضريبة والإيراد الصافي
  v_tax_amount := ROUND(p_amount * (v_tax_percentage / (100 + v_tax_percentage)), 2);
  v_revenue_amount := p_amount - v_tax_amount;

  -- الحصول على payment_number
  SELECT payment_number INTO v_payment_number
  FROM rental_payments
  WHERE id = p_rental_payment_id;

  -- تحديد الحسابات المحاسبية
  SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1; -- نقدية
  SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.2' LIMIT 1; -- إيرادات إيجار
  SELECT id INTO v_tax_account FROM accounts WHERE code = '2.3.1' LIMIT 1; -- ضرائب مستحقة

  IF v_debit_account IS NULL OR v_credit_account IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::UUID,
      false, 'الحسابات المحاسبية غير موجودة';
    RETURN;
  END IF;

  -- إنشاء رقم الفاتورة
  v_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM invoices WHERE invoice_date = p_payment_date)::TEXT, 4, '0');

  -- إنشاء الفاتورة
  INSERT INTO invoices (
    invoice_number,
    invoice_date,
    due_date,
    customer_name,
    customer_email,
    customer_phone,
    subtotal,
    tax_amount,
    total_amount,
    status,
    notes,
    rental_payment_id,
    invoice_type,
    zatca_uuid,
    zatca_hash
  ) VALUES (
    v_invoice_number,
    p_payment_date,
    p_payment_date,
    v_tenant_name,
    v_tenant_email,
    v_tenant_phone,
    v_revenue_amount,
    v_tax_amount,
    p_amount,
    'paid',
    'فاتورة إيجار - ' || v_property_name || ' - ' || v_payment_number || ' (ضريبة ' || v_tax_percentage || '%)',
    p_rental_payment_id,
    'tax_invoice',
    gen_random_uuid()::TEXT,
    encode(sha256(v_invoice_number::bytea), 'hex')
  ) RETURNING id INTO v_invoice_id;

  -- إضافة بند الفاتورة
  INSERT INTO invoice_lines (
    invoice_id,
    line_number,
    description,
    quantity,
    unit_price,
    line_total
  ) VALUES (
    v_invoice_id,
    1,
    'إيجار عقار - ' || v_property_name,
    1,
    v_revenue_amount,
    v_revenue_amount
  );

  -- إنشاء سند القبض
  v_receipt_number := 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM payments WHERE payment_date = p_payment_date)::TEXT, 4, '0');

  INSERT INTO payments (
    payment_number,
    payment_type,
    payment_date,
    amount,
    payment_method,
    payer_name,
    description,
    status,
    rental_payment_id,
    reference_number
  ) VALUES (
    v_receipt_number,
    'receipt',
    p_payment_date,
    p_amount,
    p_payment_method,
    v_tenant_name,
    'سند قبض إيجار - ' || v_property_name || ' - ' || v_payment_number,
    'completed',
    p_rental_payment_id,
    v_invoice_number
  ) RETURNING id INTO v_receipt_id;

  -- إنشاء القيد اليومية
  v_entry_number := 'JE-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM journal_entries)::TEXT, 6, '0');

  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    description,
    fiscal_year_id,
    reference_type,
    reference_id,
    status,
    posted_at
  ) VALUES (
    v_entry_number,
    p_payment_date,
    'إيراد إيجار - ' || v_property_name || ' - فاتورة ' || v_invoice_number || ' (ضريبة ' || v_tax_percentage || '%)',
    v_fiscal_year_id,
    'rental_payment_received',
    p_rental_payment_id,
    'posted',
    NOW()
  ) RETURNING id INTO v_journal_entry_id;

  -- بند مدين: نقدية (المبلغ الإجمالي)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_journal_entry_id,
    v_debit_account,
    1,
    'نقدية من إيجار (إجمالي)',
    p_amount,
    0
  );

  -- بند دائن: إيرادات إيجار (صافي بعد الضريبة)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_journal_entry_id,
    v_credit_account,
    2,
    'إيراد إيجار (صافي)',
    0,
    v_revenue_amount
  );

  -- بند دائن: ضرائب مستحقة (إذا كان حساب الضرائب موجود)
  IF v_tax_account IS NOT NULL AND v_tax_amount > 0 THEN
    INSERT INTO journal_entry_lines (
      journal_entry_id,
      account_id,
      line_number,
      description,
      debit_amount,
      credit_amount
    ) VALUES (
      v_journal_entry_id,
      v_tax_account,
      3,
      'ضريبة القيمة المضافة (' || v_tax_percentage || '%)',
      0,
      v_tax_amount
    );
  END IF;

  -- تحديث دفعة الإيجار
  UPDATE rental_payments
  SET 
    invoice_id = v_invoice_id,
    receipt_id = v_receipt_id,
    journal_entry_id = v_journal_entry_id,
    updated_at = NOW()
  WHERE id = p_rental_payment_id;

  RETURN QUERY SELECT 
    v_invoice_id,
    v_receipt_id,
    v_journal_entry_id,
    true,
    'تم إصدار الفاتورة وسند القبض والقيد المحاسبي بنجاح (ضريبة: ' || v_tax_amount || ' ر.س)';
END;
$$;