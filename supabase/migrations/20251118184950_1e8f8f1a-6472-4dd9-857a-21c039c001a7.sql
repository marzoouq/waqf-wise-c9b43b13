-- إدخال دفعات الإيجار والقيود المحاسبية
DO $$
DECLARE
  v_contract RECORD;
  v_fiscal_year_id UUID;
  v_cash_account_id UUID;
  v_rental_revenue_account_id UUID;
  v_entry_id UUID;
  v_payment RECORD;
  v_entry_number TEXT;
  v_counter INTEGER := 1;
BEGIN
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE name = 'السنة المالية 2024-2025' LIMIT 1;
  SELECT id INTO v_cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
  SELECT id INTO v_rental_revenue_account_id FROM accounts WHERE code = '4.1.2' LIMIT 1;

  -- إضافة دفعات لكل عقد
  FOR v_contract IN SELECT id, tenant_name, monthly_rent FROM contracts WHERE status = 'نشط' ORDER BY created_at
  LOOP
    INSERT INTO rental_payments (contract_id, due_date, payment_date, amount_due, amount_paid, payment_method, status)
    SELECT 
      v_contract.id,
      date_val,
      date_val - INTERVAL '3 days',
      v_contract.monthly_rent,
      v_contract.monthly_rent,
      CASE WHEN RANDOM() > 0.5 THEN 'تحويل بنكي' ELSE 'نقدي' END,
      'مدفوع'
    FROM (VALUES ('2024-11-01'::date), ('2024-12-01'::date), ('2025-01-01'::date)) AS dates(date_val);
  END LOOP;

  -- إنشاء القيود المحاسبية
  FOR v_payment IN 
    SELECT rp.*, c.tenant_name FROM rental_payments rp
    JOIN contracts c ON c.id = rp.contract_id
    WHERE rp.status = 'مدفوع' AND rp.payment_date IS NOT NULL
    ORDER BY rp.payment_date
  LOOP
    v_entry_number := 'JE-' || TO_CHAR(NOW(), 'YY') || '-' || LPAD(v_counter::TEXT, 6, '0');
    
    INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, reference_type, reference_id, status)
    VALUES (v_entry_number, v_payment.payment_date, 'إيجار - ' || v_payment.tenant_name, v_fiscal_year_id, 'rental_payment', v_payment.id, 'posted')
    RETURNING id INTO v_entry_id;

    INSERT INTO journal_entry_lines (journal_entry_id, account_id, line_number, description, debit_amount, credit_amount) VALUES 
      (v_entry_id, v_cash_account_id, 1, 'استلام إيجار', v_payment.amount_paid, 0),
      (v_entry_id, v_rental_revenue_account_id, 2, 'إيراد إيجار', 0, v_payment.amount_paid);
    
    v_counter := v_counter + 1;
  END LOOP;

  RAISE NOTICE 'تم إدخال % دفعة و % قيد محاسبي', (SELECT COUNT(*) FROM rental_payments), v_counter - 1;
END $$;