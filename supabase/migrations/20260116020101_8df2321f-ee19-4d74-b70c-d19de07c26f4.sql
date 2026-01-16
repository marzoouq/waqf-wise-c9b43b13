
-- إنشاء دالة لتحديث رصيد الحساب بناءً على القيود اليومية
CREATE OR REPLACE FUNCTION recalculate_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إعادة حساب الرصيد من القيود المعتمدة فقط
  UPDATE accounts
  SET current_balance = COALESCE((
    SELECT SUM(jl.debit_amount) - SUM(jl.credit_amount)
    FROM journal_entry_lines jl
    JOIN journal_entries je ON je.id = jl.journal_entry_id
    WHERE jl.account_id = NEW.account_id
    AND je.status = 'posted'
  ), 0),
  updated_at = now()
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$;

-- إزالة الـ trigger القديم إن وجد
DROP TRIGGER IF EXISTS trigger_recalc_account_balance ON journal_entry_lines;

-- إنشاء trigger لتحديث الرصيد عند إضافة قيود جديدة
CREATE TRIGGER trigger_recalc_account_balance
AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION recalculate_account_balance();

-- تصحيح الدالة التي تنشئ القيد الآلي لتجنب التكرار
CREATE OR REPLACE FUNCTION auto_create_journal_for_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_journal_id uuid;
  v_entry_number text;
  v_cash_account_id uuid;
  v_revenue_account_id uuid;
  v_liability_account_id uuid;
  v_fiscal_year_id uuid;
BEGIN
  -- فقط عند تغيير الحالة إلى مدفوع ولم يكن هناك قيد مرتبط
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.journal_entry_id IS NULL THEN
    
    -- جلب حسابات محاسبية
    SELECT id INTO v_cash_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
    SELECT id INTO v_revenue_account_id FROM accounts WHERE code = '4.1' LIMIT 1;
    SELECT id INTO v_liability_account_id FROM accounts WHERE code = '2.1' LIMIT 1;
    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_closed = false ORDER BY start_date DESC LIMIT 1;
    
    IF v_cash_account_id IS NULL THEN
      RAISE NOTICE 'Cash account not found';
      RETURN NEW;
    END IF;

    -- إنشاء رقم القيد
    SELECT 'JE-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INTEGER)), 0) + 1::INTEGER, 6, '0')
    INTO v_entry_number
    FROM journal_entries;
    
    -- إنشاء القيد اليومي
    INSERT INTO journal_entries (
      entry_number,
      entry_date,
      description,
      status,
      fiscal_year_id,
      reference_type,
      reference_id,
      waqf_unit_id
    ) VALUES (
      v_entry_number,
      CURRENT_DATE,
      CASE 
        WHEN NEW.voucher_type = 'receipt' THEN 'سند قبض رقم ' || NEW.voucher_number || ' - ' || COALESCE(NEW.description, '')
        ELSE 'سند صرف رقم ' || NEW.voucher_number || ' - ' || COALESCE(NEW.description, '')
      END,
      'posted',
      v_fiscal_year_id,
      'payment_voucher',
      NEW.id,
      NEW.waqf_unit_id
    ) RETURNING id INTO v_journal_id;
    
    -- إضافة سطور القيد حسب نوع السند
    IF NEW.voucher_type = 'receipt' THEN
      -- سند قبض: مدين النقدية، دائن الإيرادات
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
      VALUES 
        (v_journal_id, v_cash_account_id, NEW.amount, 0, 'قبض نقدي'),
        (v_journal_id, COALESCE(v_revenue_account_id, v_cash_account_id), 0, NEW.amount, 'إيراد');
    ELSE
      -- سند صرف: مدين المصروفات، دائن النقدية
      INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
      VALUES 
        (v_journal_id, COALESCE(v_liability_account_id, v_cash_account_id), NEW.amount, 0, 'مصروف'),
        (v_journal_id, v_cash_account_id, 0, NEW.amount, 'صرف نقدي');
    END IF;
    
    -- ربط السند بالقيد
    NEW.journal_entry_id := v_journal_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;
