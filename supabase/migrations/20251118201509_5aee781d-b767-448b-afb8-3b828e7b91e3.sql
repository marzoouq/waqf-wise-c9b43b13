-- إضافة العقارات الجديدة للعقود التجارية الكبيرة
INSERT INTO properties (name, location, type, total_units, available_units, status)
VALUES 
  ('عقار جدة 2+3', 'جدة', 'تجاري', 1, 0, 'مؤجر'),
  ('عقار عبدالعزيز', 'المدينة المنورة', 'تجاري', 1, 0, 'مؤجر'),
  ('عقار النهدي', 'المدينة المنورة', 'تجاري', 1, 0, 'مؤجر')
ON CONFLICT DO NOTHING;

-- إضافة العقود التجارية الكبيرة والدفعات
DO $$
DECLARE
  v_property_jeddah_id UUID;
  v_property_aziz_id UUID;
  v_property_nahdi_id UUID;
  v_contract_jeddah_id UUID;
  v_contract_aziz_id UUID;
  v_contract_nahdi_id UUID;
  v_fiscal_year_id UUID;
  v_cash_account_id UUID;
  v_rental_revenue_account_id UUID;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_counter INTEGER;
BEGIN
  -- الحصول على معرفات العقارات
  SELECT id INTO v_property_jeddah_id FROM properties WHERE name = 'عقار جدة 2+3' LIMIT 1;
  SELECT id INTO v_property_aziz_id FROM properties WHERE name = 'عقار عبدالعزيز' LIMIT 1;
  SELECT id INTO v_property_nahdi_id FROM properties WHERE name = 'عقار النهدي' LIMIT 1;
  
  -- الحصول على الحسابات المحاسبية
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE name = 'السنة المالية 2024-2025' LIMIT 1;
  SELECT id INTO v_cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
  SELECT id INTO v_rental_revenue_account_id FROM accounts WHERE code = '4.1.2' LIMIT 1;
  
  -- احصل على آخر رقم قيد
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 8) AS INTEGER)), 0) + 1 INTO v_counter
  FROM journal_entries WHERE entry_number LIKE 'JE-24-%';

  -- إضافة عقد جدة 2+3
  INSERT INTO contracts (
    contract_number, property_id, tenant_name, tenant_phone, tenant_id_number,
    contract_type, start_date, end_date, monthly_rent, security_deposit,
    payment_frequency, status, is_renewable
  ) VALUES (
    'CON-25-000015', v_property_jeddah_id, 'مستأجر عقار جدة 2+3', '0500000000', '1000000000',
    'إيجار', '2024-01-01', '2025-12-31', 62500, 0, 'سنوي', 'نشط', true
  ) RETURNING id INTO v_contract_jeddah_id;

  -- إضافة دفعة جدة 2+3 (750,000 ريال)
  INSERT INTO rental_payments (
    contract_id, due_date, payment_date, amount_due, amount_paid,
    payment_method, status, notes
  ) VALUES (
    v_contract_jeddah_id, '2024-12-31', '2024-12-15', 750000, 750000,
    'تحويل بنكي', 'مدفوع', 'دفعة سنوية كاملة - عقار جدة 2+3'
  );

  -- قيد دفعة جدة
  v_entry_number := 'JE-24-' || LPAD(v_counter::TEXT, 6, '0');
  INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, reference_type, status)
  VALUES (v_entry_number, '2024-12-15', 'إيجار سنوي - عقار جدة 2+3', v_fiscal_year_id, 'rental_payment', 'posted')
  RETURNING id INTO v_entry_id;
  
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, line_number, description, debit_amount, credit_amount) 
  VALUES 
    (v_entry_id, v_cash_account_id, 1, 'استلام إيجار سنوي', 750000, 0),
    (v_entry_id, v_rental_revenue_account_id, 2, 'إيراد إيجار', 0, 750000);
  
  v_counter := v_counter + 1;

  -- إضافة عقد عبدالعزيز
  INSERT INTO contracts (
    contract_number, property_id, tenant_name, tenant_phone, tenant_id_number,
    contract_type, start_date, end_date, monthly_rent, security_deposit,
    payment_frequency, status, is_renewable
  ) VALUES (
    'CON-25-000016', v_property_aziz_id, 
    'شركة روائح النسيم المحدودة', 
    '0500000000', '#20645282400',
    'إيجار', '2023-11-15', '2030-11-14', 8333.33, 0, 'سنوي', 'نشط', true
  ) RETURNING id INTO v_contract_aziz_id;

  -- إضافة دفعة عبدالعزيز (100,000 ريال)
  INSERT INTO rental_payments (
    contract_id, due_date, payment_date, amount_due, amount_paid,
    payment_method, status, notes
  ) VALUES (
    v_contract_aziz_id, '2024-12-31', '2024-12-15', 100000, 100000,
    'تحويل بنكي', 'مدفوع', 'دفعة سنوية كاملة - عقد عبدالعزيز'
  );

  -- قيد دفعة عبدالعزيز
  v_entry_number := 'JE-24-' || LPAD(v_counter::TEXT, 6, '0');
  INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, reference_type, status)
  VALUES (v_entry_number, '2024-12-15', 'إيجار سنوي - عقد عبدالعزيز', v_fiscal_year_id, 'rental_payment', 'posted')
  RETURNING id INTO v_entry_id;
  
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, line_number, description, debit_amount, credit_amount) 
  VALUES 
    (v_entry_id, v_cash_account_id, 1, 'استلام إيجار سنوي', 100000, 0),
    (v_entry_id, v_rental_revenue_account_id, 2, 'إيراد إيجار', 0, 100000);
  
  v_counter := v_counter + 1;

  -- إضافة عقد النهدي
  INSERT INTO contracts (
    contract_number, property_id, tenant_name, tenant_phone, tenant_id_number,
    contract_type, start_date, end_date, monthly_rent, security_deposit,
    payment_frequency, status, is_renewable
  ) VALUES (
    'CON-25-000017', v_property_nahdi_id, 'صيدلية النهدي', '0500000000', '2000000000',
    'إيجار', '2024-01-01', '2025-12-31', 20833.33, 0, 'سنوي', 'نشط', true
  ) RETURNING id INTO v_contract_nahdi_id;

  -- إضافة دفعة النهدي (250,000 ريال)
  INSERT INTO rental_payments (
    contract_id, due_date, payment_date, amount_due, amount_paid,
    payment_method, status, notes
  ) VALUES (
    v_contract_nahdi_id, '2024-12-31', '2024-12-15', 250000, 250000,
    'تحويل بنكي', 'مدفوع', 'دفعة سنوية كاملة - عقد النهدي'
  );

  -- قيد دفعة النهدي
  v_entry_number := 'JE-24-' || LPAD(v_counter::TEXT, 6, '0');
  INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, reference_type, status)
  VALUES (v_entry_number, '2024-12-15', 'إيجار سنوي - عقد النهدي', v_fiscal_year_id, 'rental_payment', 'posted')
  RETURNING id INTO v_entry_id;
  
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, line_number, description, debit_amount, credit_amount) 
  VALUES 
    (v_entry_id, v_cash_account_id, 1, 'استلام إيجار سنوي', 250000, 0),
    (v_entry_id, v_rental_revenue_account_id, 2, 'إيراد إيجار', 0, 250000);

  RAISE NOTICE 'تم إضافة 3 عقود و 3 دفعات بإجمالي 1,100,000 ريال';
END $$;