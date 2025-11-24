
-- إصلاح دالة create_journal_entry_from_voucher لتستخدم الأعمدة الصحيحة
DROP FUNCTION IF EXISTS create_journal_entry_from_voucher() CASCADE;

CREATE OR REPLACE FUNCTION create_journal_entry_from_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fiscal_year_id UUID;
  v_entry_number TEXT;
  v_debit_account UUID;
  v_credit_account UUID;
  v_entry_id UUID;
BEGIN
  -- تنفيذ فقط عند تغيير الحالة إلى 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    
    -- التحقق من عدم وجود قيد محاسبي مسبق
    IF NEW.journal_entry_id IS NOT NULL THEN
      RETURN NEW;
    END IF;
    
    -- الحصول على السنة المالية النشطة
    SELECT id INTO v_fiscal_year_id
    FROM fiscal_years
    WHERE DATE(NEW.created_at) BETWEEN start_date AND end_date
    AND is_closed = false
    LIMIT 1;
    
    IF v_fiscal_year_id IS NULL THEN
      -- استخدام السنة المالية النشطة الافتراضية
      SELECT id INTO v_fiscal_year_id
      FROM fiscal_years
      WHERE is_active = true
      LIMIT 1;
    END IF;
    
    IF v_fiscal_year_id IS NULL THEN
      RAISE EXCEPTION 'لا توجد سنة مالية نشطة';
    END IF;
    
    -- تحديد الحسابات بناءً على نوع السند
    IF NEW.voucher_type = 'payment' OR NEW.voucher_type = 'صرف' THEN
      -- سند صرف: مدين مصروفات / دائن نقدية
      SELECT id INTO v_debit_account FROM accounts WHERE code = '5.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
    ELSE
      -- سند قبض: مدين نقدية / دائن إيرادات
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.1' LIMIT 1;
    END IF;
    
    IF v_debit_account IS NULL OR v_credit_account IS NULL THEN
      RAISE WARNING 'الحسابات المحاسبية غير موجودة للسند رقم: %', NEW.voucher_number;
      RETURN NEW;
    END IF;
    
    -- إنشاء القيد المحاسبي
    INSERT INTO journal_entries (
      entry_number,
      entry_date,
      description,
      fiscal_year_id,
      reference_type,
      reference_id,
      status
    ) VALUES (
      'JE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
        LPAD((SELECT COUNT(*) + 1 FROM journal_entries)::TEXT, 6, '0'),
      DATE(NEW.created_at),
      COALESCE(NEW.description, 'قيد آلي من سند ' || NEW.voucher_number),
      v_fiscal_year_id,
      'payment_voucher',
      NEW.id,
      'draft'
    ) RETURNING id INTO v_entry_id;
    
    -- إضافة بنود القيد
    INSERT INTO journal_entry_lines (
      journal_entry_id,
      account_id,
      line_number,
      description,
      debit_amount,
      credit_amount
    ) VALUES 
    (v_entry_id, v_debit_account, 1, NEW.description, NEW.amount, 0),
    (v_entry_id, v_credit_account, 2, NEW.description, 0, NEW.amount);
    
    -- ربط القيد بالسند
    NEW.journal_entry_id := v_entry_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- إعادة إنشاء الـ trigger
DROP TRIGGER IF EXISTS trigger_create_journal_from_voucher ON payment_vouchers;
CREATE TRIGGER trigger_create_journal_from_voucher
  BEFORE UPDATE ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION create_journal_entry_from_voucher();
