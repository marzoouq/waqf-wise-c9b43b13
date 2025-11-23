-- إضافة عمود paid_amount في loan_installments
ALTER TABLE loan_installments 
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0 NOT NULL;

-- إنشاء function لتحديث رصيد القرض بعد الدفع
CREATE OR REPLACE FUNCTION update_loan_balance_after_payment(
  p_loan_id UUID,
  p_payment_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining_balance NUMERIC;
BEGIN
  -- تحديث المبلغ المدفوع في القرض
  UPDATE loans
  SET 
    total_paid = COALESCE(total_paid, 0) + p_payment_amount,
    remaining_balance = loan_amount - (COALESCE(total_paid, 0) + p_payment_amount),
    updated_at = NOW()
  WHERE id = p_loan_id
  RETURNING remaining_balance INTO v_remaining_balance;
  
  -- إذا تم سداد القرض بالكامل، تحديث الحالة
  IF v_remaining_balance <= 0 THEN
    UPDATE loans
    SET status = 'paid'
    WHERE id = p_loan_id;
  END IF;
END;
$$;

-- تحديث trigger لحساب paid_amount و remaining_amount
CREATE OR REPLACE FUNCTION update_installment_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- حساب المبلغ المتبقي
  NEW.remaining_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
  
  -- تحديث الحالة بناءً على المدفوع
  IF NEW.paid_amount >= NEW.total_amount THEN
    NEW.status := 'paid';
  ELSIF NEW.paid_amount > 0 THEN
    NEW.status := 'partial';
  ELSIF NEW.due_date < CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger
DROP TRIGGER IF EXISTS trigger_update_installment_amounts ON loan_installments;
CREATE TRIGGER trigger_update_installment_amounts
  BEFORE INSERT OR UPDATE ON loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_installment_amounts();

-- تحديث القيم الحالية
UPDATE loan_installments
SET paid_amount = COALESCE(paid_amount, 0)
WHERE paid_amount IS NULL;

-- إضافة comment
COMMENT ON COLUMN loan_installments.paid_amount IS 'المبلغ المدفوع من هذا القسط';