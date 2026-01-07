-- Fix create_rental_invoice_and_receipt function to use correct table structure
CREATE OR REPLACE FUNCTION public.create_rental_invoice_and_receipt(
  p_rental_payment_id uuid, 
  p_contract_id uuid, 
  p_amount numeric, 
  p_payment_date date, 
  p_payment_method text, 
  p_tenant_name text DEFAULT NULL::text, 
  p_tenant_id text DEFAULT NULL::text, 
  p_tenant_email text DEFAULT NULL::text, 
  p_tenant_phone text DEFAULT NULL::text, 
  p_property_name text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, invoice_id uuid, receipt_id uuid, journal_entry_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
  v_qr_code_data TEXT;
  v_org_name TEXT;
  v_org_vat TEXT;
BEGIN
  -- Get tax info from rental payment
  SELECT tax_percentage, tax_amount, net_amount
  INTO v_tax_percentage, v_tax_amount, v_net_amount
  FROM rental_payments WHERE id = p_rental_payment_id;
  
  -- Use defaults if null
  v_tax_percentage := COALESCE(v_tax_percentage, 15);
  v_tax_amount := COALESCE(v_tax_amount, p_amount * 0.15);
  v_net_amount := COALESCE(v_net_amount, p_amount - v_tax_amount);
  
  -- Get organization settings from organization_settings table
  SELECT 
    COALESCE(organization_name_ar, 'الوقف'),
    COALESCE(vat_registration_number, '300000000000003')
  INTO v_org_name, v_org_vat
  FROM organization_settings LIMIT 1;
  
  -- Fallback if no organization settings
  v_org_name := COALESCE(v_org_name, 'الوقف');
  v_org_vat := COALESCE(v_org_vat, '300000000000003');
  
  -- Get active fiscal year
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE status = 'active' LIMIT 1;
  IF v_fiscal_year_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID, 'لا توجد سنة مالية نشطة';
    RETURN;
  END IF;
  
  -- Get account IDs
  SELECT id INTO v_cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
  SELECT id INTO v_revenue_account_id FROM accounts WHERE code = '4110' LIMIT 1;
  SELECT id INTO v_vat_account_id FROM accounts WHERE code = '2130' LIMIT 1;
  
  IF v_cash_account_id IS NULL OR v_revenue_account_id IS NULL OR v_vat_account_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID, 'حسابات المحاسبة غير موجودة';
    RETURN;
  END IF;
  
  -- Generate invoice number
  v_invoice_number := 'INV-' || LPAD(EXTRACT(YEAR FROM p_payment_date)::TEXT, 4, '0') || 
                      '-' || LPAD(nextval('invoice_sequence')::TEXT, 6, '0');
  
  -- Generate QR code data
  v_qr_code_data := encode(
    '\x01' || chr(length(v_org_name)) || v_org_name ||
    '\x02' || chr(length(v_org_vat)) || v_org_vat ||
    '\x03' || chr(length(p_payment_date::text)) || p_payment_date::text ||
    '\x04' || chr(length(p_amount::text)) || p_amount::text ||
    '\x05' || chr(length(v_tax_amount::text)) || v_tax_amount::text,
    'base64'
  );
  
  -- Insert invoice
  INSERT INTO invoices (
    invoice_number, invoice_date, customer_name, customer_vat_number,
    customer_phone, customer_email, total_amount, tax_amount, net_amount,
    status, payment_status, reference_type, reference_id, qr_code_data
  ) VALUES (
    v_invoice_number, p_payment_date, p_tenant_name, p_tenant_id,
    p_tenant_phone, p_tenant_email, p_amount, v_tax_amount, v_net_amount,
    'issued', 'paid', 'rental_payment', p_rental_payment_id, v_qr_code_data
  ) RETURNING id INTO v_invoice_id;
  
  -- Insert invoice line
  INSERT INTO invoice_lines (
    invoice_id, line_number, description, quantity, unit_price, tax_rate, tax_amount, line_total
  ) VALUES (
    v_invoice_id, 1, 'إيجار ' || COALESCE(p_property_name, 'عقار'),
    1, v_net_amount, v_tax_percentage, v_tax_amount, p_amount
  );
  
  -- Generate receipt number
  v_receipt_number := 'REC-' || LPAD(EXTRACT(YEAR FROM p_payment_date)::TEXT, 4, '0') || 
                      '-' || LPAD(nextval('payment_sequence')::TEXT, 6, '0');
  
  -- Insert payment/receipt
  INSERT INTO payments (
    payment_number, payment_date, payment_type, amount, payment_method,
    payer_name, reference_type, reference_id, status
  ) VALUES (
    v_receipt_number, p_payment_date, 'receipt', p_amount, p_payment_method,
    p_tenant_name, 'rental_payment', p_rental_payment_id, 'completed'
  ) RETURNING id INTO v_receipt_id;
  
  -- Generate journal entry number
  v_entry_number := 'JE-' || LPAD(EXTRACT(YEAR FROM p_payment_date)::TEXT, 4, '0') || 
                    '-' || LPAD(nextval('journal_entry_sequence')::TEXT, 6, '0');
  
  -- Insert journal entry
  INSERT INTO journal_entries (
    entry_number, entry_date, fiscal_year_id, description,
    reference_type, reference_id, status, posted_at
  ) VALUES (
    v_entry_number, p_payment_date, v_fiscal_year_id, 'قيد إيجار - ' || v_invoice_number,
    'rental_payment', p_rental_payment_id, 'posted', NOW()
  ) RETURNING id INTO v_journal_entry_id;
  
  -- Insert journal entry lines (debit cash, credit revenue and VAT)
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
  VALUES 
    (v_journal_entry_id, v_cash_account_id, p_amount, 0, 'تحصيل إيجار'),
    (v_journal_entry_id, v_revenue_account_id, 0, v_net_amount, 'إيرادات إيجار'),
    (v_journal_entry_id, v_vat_account_id, 0, v_tax_amount, 'ضريبة القيمة المضافة');
  
  -- Update rental payment with invoice_id
  UPDATE rental_payments 
  SET invoice_id = v_invoice_id, 
      updated_at = NOW()
  WHERE id = p_rental_payment_id;
  
  RETURN QUERY SELECT true, v_invoice_id, v_receipt_id, v_journal_entry_id, 'تم إنشاء الفاتورة والإيصال والقيد بنجاح';
END;
$function$;