-- =========================================
-- Migration: إعادة تطبيق Trigger + RLS للميزانيات
-- =========================================

-- 1. حذف الدالة والـ Trigger إن وُجدا
DROP TRIGGER IF EXISTS trigger_auto_update_account_balance ON journal_entry_lines;
DROP FUNCTION IF EXISTS auto_update_account_balance();

-- 2. إنشاء الدالة من جديد
CREATE FUNCTION auto_update_account_balance()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- 3. إنشاء Trigger
CREATE TRIGGER trigger_auto_update_account_balance
AFTER INSERT OR UPDATE ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION auto_update_account_balance();

-- 4. إضافة RLS policies للميزانيات
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view budgets" ON budgets;
CREATE POLICY "Users can view budgets" 
ON budgets FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admins can manage budgets" ON budgets;
CREATE POLICY "Admins can manage budgets" 
ON budgets FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. إضافة RLS للتدفقات النقدية
ALTER TABLE cash_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view cash flows" ON cash_flows;
CREATE POLICY "Users can view cash flows" 
ON cash_flows FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admins can manage cash flows" ON cash_flows;
CREATE POLICY "Admins can manage cash flows" 
ON cash_flows FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 6. تعليقات توثيقية
COMMENT ON FUNCTION auto_update_account_balance IS 'دالة تلقائية لتحديث أرصدة الحسابات عند إضافة أو تعديل القيود المحاسبية';
COMMENT ON TRIGGER trigger_auto_update_account_balance ON journal_entry_lines IS 'يُفعّل تلقائياً عند إدراج أو تحديث سطور القيود لتحديث أرصدة الحسابات';