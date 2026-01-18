-- ============================================
-- إصلاحات أمنية شاملة - إكمال الخطة 100%
-- ============================================

-- 1. إصلاح Storage Bucket: تحويل request-attachments إلى private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'request-attachments';

-- 2. إصلاح سياسة system_error_logs (WITH CHECK = true)
DROP POLICY IF EXISTS "all_authenticated_insert_error_logs" ON public.system_error_logs;

CREATE POLICY "authenticated_can_insert_error_logs" 
ON public.system_error_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (
  -- يمكن للمستخدم إدراج سجلات الأخطاء المرتبطة به فقط
  user_id IS NULL OR user_id = auth.uid()
);

-- 3. إصلاح دالة update_account_balance_on_entry بإضافة search_path
CREATE OR REPLACE FUNCTION update_account_balance_on_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Update debit account balance
  IF NEW.debit_amount > 0 THEN
    UPDATE accounts 
    SET current_balance = COALESCE(current_balance, 0) + NEW.debit_amount,
        updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;
  
  -- Update credit account balance
  IF NEW.credit_amount > 0 THEN
    UPDATE accounts 
    SET current_balance = COALESCE(current_balance, 0) - NEW.credit_amount,
        updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;