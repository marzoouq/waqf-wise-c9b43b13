-- إصلاح trigger update_account_balance - استخدام CASCADE

-- إضافة عمود current_balance إن لم يكن موجوداً
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS current_balance NUMERIC DEFAULT 0;

-- حذف الدالة مع جميع التبعيات
DROP FUNCTION IF EXISTS update_account_balance() CASCADE;

-- إعادة إنشاء الدالة بشكل صحيح
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- عند إنشاء سطر قيد جديد
  IF TG_OP = 'INSERT' THEN
    -- تحديث الحساب المدين
    IF NEW.debit_amount > 0 THEN
      UPDATE accounts 
      SET current_balance = COALESCE(current_balance, 0) + NEW.debit_amount
      WHERE id = NEW.account_id;
    END IF;
    
    -- تحديث الحساب الدائن
    IF NEW.credit_amount > 0 THEN
      UPDATE accounts 
      SET current_balance = COALESCE(current_balance, 0) - NEW.credit_amount
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إعادة إنشاء الـ trigger
CREATE TRIGGER update_account_balance_trigger
AFTER INSERT ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();