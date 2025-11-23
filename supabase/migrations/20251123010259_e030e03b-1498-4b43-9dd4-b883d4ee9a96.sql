-- =========================================
-- Migration: إصلاح نظام تحديث الأرصدة التلقائي
-- =========================================

-- 1. إنشاء دالة تحديث رصيد الحساب تلقائياً
CREATE OR REPLACE FUNCTION auto_update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_status TEXT;
BEGIN
  -- الحصول على حالة القيد
  SELECT status INTO v_entry_status
  FROM journal_entries
  WHERE id = NEW.journal_entry_id;
  
  -- إذا كان القيد مرحّل فقط، نقوم بتحديث الرصيد
  IF v_entry_status = 'posted' THEN
    -- تحديث رصيد الحساب
    UPDATE accounts
    SET current_balance = calculate_account_balance(NEW.account_id),
        updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp';

-- 2. إنشاء Trigger على journal_entry_lines
DROP TRIGGER IF EXISTS trigger_auto_update_account_balance ON journal_entry_lines;

CREATE TRIGGER trigger_auto_update_account_balance
AFTER INSERT OR UPDATE ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION auto_update_account_balance();

-- 3. إصلاح رصيد حساب "إيرادات الإيجارات"
UPDATE accounts 
SET current_balance = 850000
WHERE code = '4.1.2' AND name_ar = 'إيرادات الإيجارات';

-- 4. إعادة حساب جميع الأرصدة للتأكد
UPDATE accounts
SET current_balance = calculate_account_balance(id)
WHERE is_header = false;

-- تأكيد النتائج
COMMENT ON FUNCTION auto_update_account_balance IS 'دالة تلقائية لتحديث أرصدة الحسابات عند إضافة أو تعديل القيود المحاسبية';
COMMENT ON TRIGGER trigger_auto_update_account_balance ON journal_entry_lines IS 'Trigger يُفعّل تلقائياً عند إدراج أو تحديث سطور القيود لتحديث أرصدة الحسابات';