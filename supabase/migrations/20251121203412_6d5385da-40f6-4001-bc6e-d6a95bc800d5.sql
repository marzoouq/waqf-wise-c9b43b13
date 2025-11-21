
-- دالة لإضافة قيود محاسبية تجريبية
CREATE OR REPLACE FUNCTION seed_journal_entries()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fiscal_year_id uuid;
  cash_account_id uuid;
  revenue_account_id uuid;
  expense_account_id uuid;
  journal_entry_id uuid;
  entries_created int := 0;
BEGIN
  -- الحصول على السنة المالية النشطة
  SELECT id INTO fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
  
  IF fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'لا توجد سنة مالية نشطة';
  END IF;
  
  -- الحصول على الحسابات المطلوبة
  SELECT id INTO cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
  SELECT id INTO revenue_account_id FROM accounts WHERE code = '4.1.2' LIMIT 1;
  SELECT id INTO expense_account_id FROM accounts WHERE code = '5' LIMIT 1;
  
  -- إنشاء قيد إيرادات تجريبي إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM journal_entries WHERE description LIKE '%إيرادات إيجارات%') THEN
    -- قيد إيرادات شهرية
    INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status, entry_type)
    VALUES ('JE-2025-001', '2025-01-01', 'إيرادات إيجارات العقارات - يناير 2025', fiscal_year_id, 'مرحّل', 'عام')
    RETURNING id INTO journal_entry_id;
    
    -- سطور القيد (مدين: النقدية، دائن: الإيرادات)
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES 
      (journal_entry_id, cash_account_id, 250000, 0, 'تحصيل إيجارات شهرية'),
      (journal_entry_id, revenue_account_id, 0, 250000, 'إيرادات إيجارات العقارات');
    
    entries_created := entries_created + 1;
  END IF;
  
  -- قيد مصروفات تجريبي
  IF NOT EXISTS (SELECT 1 FROM journal_entries WHERE description LIKE '%مصروفات صيانة%') THEN
    INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status, entry_type)
    VALUES ('JE-2025-002', '2025-01-05', 'مصروفات صيانة العقارات', fiscal_year_id, 'مرحّل', 'عام')
    RETURNING id INTO journal_entry_id;
    
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES 
      (journal_entry_id, expense_account_id, 50000, 0, 'مصروفات صيانة'),
      (journal_entry_id, cash_account_id, 0, 50000, 'دفع نقدي');
    
    entries_created := entries_created + 1;
  END IF;
  
  -- قيد إيرادات إضافي
  IF NOT EXISTS (SELECT 1 FROM journal_entries WHERE description LIKE '%إيرادات فبراير%') THEN
    INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status, entry_type)
    VALUES ('JE-2025-003', '2025-02-01', 'إيرادات إيجارات العقارات - فبراير 2025', fiscal_year_id, 'مرحّل', 'عام')
    RETURNING id INTO journal_entry_id;
    
    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
    VALUES 
      (journal_entry_id, cash_account_id, 250000, 0, 'تحصيل إيجارات شهرية'),
      (journal_entry_id, revenue_account_id, 0, 250000, 'إيرادات إيجارات');
    
    entries_created := entries_created + 1;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'entries_created', entries_created
  );
END;
$$;
