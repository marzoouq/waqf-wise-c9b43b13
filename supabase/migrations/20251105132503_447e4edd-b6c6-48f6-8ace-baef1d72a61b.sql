-- Insert sample invoices and invoice lines

-- Sample Invoice 1: Paid
INSERT INTO invoices (
  invoice_number,
  invoice_date,
  due_date,
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  subtotal,
  tax_amount,
  total_amount,
  status,
  notes
) VALUES (
  'INV-2024-001',
  '2024-01-15',
  '2024-02-15',
  'شركة الأمل للتجارة',
  'info@amal-trade.com',
  '+966501234567',
  'الرياض، حي النخيل، شارع الملك فهد',
  50000.00,
  7500.00,
  57500.00,
  'paid',
  'تم الدفع عن طريق التحويل البنكي'
);

-- Get the invoice ID for lines
DO $$
DECLARE
  inv1_id UUID;
  rev_account_id UUID;
BEGIN
  SELECT id INTO inv1_id FROM invoices WHERE invoice_number = 'INV-2024-001';
  SELECT id INTO rev_account_id FROM accounts WHERE code = '41' LIMIT 1;
  
  IF inv1_id IS NOT NULL AND rev_account_id IS NOT NULL THEN
    INSERT INTO invoice_lines (invoice_id, line_number, account_id, description, quantity, unit_price, line_total)
    VALUES 
      (inv1_id, 1, rev_account_id, 'خدمات استشارية - شهر يناير 2024', 1, 30000.00, 30000.00),
      (inv1_id, 2, rev_account_id, 'تدريب وتطوير', 2, 10000.00, 20000.00);
  END IF;
END $$;

-- Sample Invoice 2: Sent
INSERT INTO invoices (
  invoice_number,
  invoice_date,
  due_date,
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  subtotal,
  tax_amount,
  total_amount,
  status,
  notes
) VALUES (
  'INV-2024-002',
  '2024-02-01',
  '2024-03-01',
  'مؤسسة النجاح للمقاولات',
  'contact@najah.sa',
  '+966502345678',
  'جدة، حي الحمراء، طريق المدينة',
  75000.00,
  11250.00,
  86250.00,
  'sent',
  'في انتظار الدفع'
);

DO $$
DECLARE
  inv2_id UUID;
  rev_account_id UUID;
BEGIN
  SELECT id INTO inv2_id FROM invoices WHERE invoice_number = 'INV-2024-002';
  SELECT id INTO rev_account_id FROM accounts WHERE code = '41' LIMIT 1;
  
  IF inv2_id IS NOT NULL AND rev_account_id IS NOT NULL THEN
    INSERT INTO invoice_lines (invoice_id, line_number, account_id, description, quantity, unit_price, line_total)
    VALUES 
      (inv2_id, 1, rev_account_id, 'إدارة مشروع - المرحلة الأولى', 1, 50000.00, 50000.00),
      (inv2_id, 2, rev_account_id, 'دراسة جدوى اقتصادية', 1, 25000.00, 25000.00);
  END IF;
END $$;

-- Sample Invoice 3: Draft
INSERT INTO invoices (
  invoice_number,
  invoice_date,
  customer_name,
  customer_email,
  customer_phone,
  subtotal,
  tax_amount,
  total_amount,
  status,
  notes
) VALUES (
  'INV-2024-003',
  '2024-03-10',
  'شركة الابتكار التقني',
  'info@innovation-tech.sa',
  '+966503456789',
  120000.00,
  18000.00,
  138000.00,
  'draft',
  'مسودة - قيد المراجعة'
);

DO $$
DECLARE
  inv3_id UUID;
  rev_account_id UUID;
BEGIN
  SELECT id INTO inv3_id FROM invoices WHERE invoice_number = 'INV-2024-003';
  SELECT id INTO rev_account_id FROM accounts WHERE code = '41' LIMIT 1;
  
  IF inv3_id IS NOT NULL AND rev_account_id IS NOT NULL THEN
    INSERT INTO invoice_lines (invoice_id, line_number, account_id, description, quantity, unit_price, line_total)
    VALUES 
      (inv3_id, 1, rev_account_id, 'تطوير نظام محاسبي متكامل', 1, 80000.00, 80000.00),
      (inv3_id, 2, rev_account_id, 'تدريب المستخدمين - 4 أيام', 4, 5000.00, 20000.00),
      (inv3_id, 3, rev_account_id, 'دعم فني سنوي', 1, 20000.00, 20000.00);
  END IF;
END $$;

-- Sample Invoice 4: Paid (older)
INSERT INTO invoices (
  invoice_number,
  invoice_date,
  due_date,
  customer_name,
  customer_phone,
  subtotal,
  tax_amount,
  total_amount,
  status,
  notes
) VALUES (
  'INV-2023-125',
  '2023-12-20',
  '2024-01-20',
  'مكتب الخليج للمحاماة',
  '+966504567890',
  35000.00,
  5250.00,
  40250.00,
  'paid',
  'مدفوع كاملاً'
);

DO $$
DECLARE
  inv4_id UUID;
  rev_account_id UUID;
BEGIN
  SELECT id INTO inv4_id FROM invoices WHERE invoice_number = 'INV-2023-125';
  SELECT id INTO rev_account_id FROM accounts WHERE code = '41' LIMIT 1;
  
  IF inv4_id IS NOT NULL AND rev_account_id IS NOT NULL THEN
    INSERT INTO invoice_lines (invoice_id, line_number, account_id, description, quantity, unit_price, line_total)
    VALUES 
      (inv4_id, 1, rev_account_id, 'استشارات قانونية', 1, 35000.00, 35000.00);
  END IF;
END $$;

-- Sample Invoice 5: Cancelled
INSERT INTO invoices (
  invoice_number,
  invoice_date,
  customer_name,
  customer_email,
  subtotal,
  tax_amount,
  total_amount,
  status,
  notes
) VALUES (
  'INV-2024-004',
  '2024-02-28',
  'شركة الأفق الجديد',
  'info@newhor.com',
  45000.00,
  6750.00,
  51750.00,
  'cancelled',
  'ملغية بناءً على طلب العميل'
);

DO $$
DECLARE
  inv5_id UUID;
  rev_account_id UUID;
BEGIN
  SELECT id INTO inv5_id FROM invoices WHERE invoice_number = 'INV-2024-004';
  SELECT id INTO rev_account_id FROM accounts WHERE code = '41' LIMIT 1;
  
  IF inv5_id IS NOT NULL AND rev_account_id IS NOT NULL THEN
    INSERT INTO invoice_lines (invoice_id, line_number, account_id, description, quantity, unit_price, line_total)
    VALUES 
      (inv5_id, 1, rev_account_id, 'خدمات تسويقية', 1, 45000.00, 45000.00);
  END IF;
END $$;