-- إنشاء الحسابات المحاسبية
INSERT INTO accounts (code, name_ar, name_en, account_type, account_nature, is_header, is_active)
VALUES 
  ('1201', 'ذمم المستأجرين', 'Tenants Receivables', 'asset', 'debit', false, true),
  ('4001', 'إيرادات الإيجارات', 'Rental Revenue', 'revenue', 'credit', false, true)
ON CONFLICT (code) DO NOTHING;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS trigger_auto_create_journal_entry_for_payment ON rental_payments;

CREATE TRIGGER trigger_auto_create_journal_entry_for_payment
AFTER INSERT ON rental_payments
FOR EACH ROW
EXECUTE FUNCTION auto_create_journal_entry_for_payment();

-- Function لمعالجة الدفعات الموجودة
CREATE OR REPLACE FUNCTION process_existing_rental_payments()
RETURNS TABLE(payment_id UUID, journal_entry_id UUID, success BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_rec RECORD;
  v_fiscal_year_id UUID;
  v_entry_number TEXT;
  v_journal_entry_id UUID;
  v_receivable_account_id UUID;
  v_revenue_account_id UUID;
BEGIN
  -- جلب الحسابات
  SELECT id INTO v_receivable_account_id FROM accounts WHERE code = '1201' LIMIT 1;
  SELECT id INTO v_revenue_account_id FROM accounts WHERE code = '4001' LIMIT 1;
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
  
  FOR payment_rec IN 
    SELECT rp.id, rp.due_date, rp.amount_due, rp.payment_number
    FROM rental_payments rp
    WHERE rp.journal_entry_id IS NULL
    LIMIT 50
  LOOP
    v_entry_number := 'JE-' || TO_CHAR(payment_rec.due_date, 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    
    INSERT INTO journal_entries (entry_number, entry_date, description, reference_type, reference_id, fiscal_year_id, status)
    VALUES (v_entry_number, payment_rec.due_date, 'قيد إيجار - ' || payment_rec.payment_number, 
            'rental_payment', payment_rec.id, v_fiscal_year_id, 'draft')
    RETURNING id INTO v_journal_entry_id;
    
    INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, debit_amount, credit_amount, description)
    VALUES 
      (v_journal_entry_id, 1, v_receivable_account_id, payment_rec.amount_due, 0, 'مدين - ذمم مستأجرين'),
      (v_journal_entry_id, 2, v_revenue_account_id, 0, payment_rec.amount_due, 'دائن - إيرادات إيجارات');
    
    UPDATE rental_payments SET journal_entry_id = v_journal_entry_id WHERE id = payment_rec.id;
    
    payment_id := payment_rec.id;
    journal_entry_id := v_journal_entry_id;
    success := true;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- تشغيلها
SELECT * FROM process_existing_rental_payments();