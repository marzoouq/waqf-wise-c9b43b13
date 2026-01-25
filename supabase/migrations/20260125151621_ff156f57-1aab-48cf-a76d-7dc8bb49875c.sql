
-- حذف وإعادة إنشاء الدالة
DROP FUNCTION IF EXISTS public.regenerate_payment_schedule(uuid);

CREATE OR REPLACE FUNCTION public.regenerate_payment_schedule(p_contract_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract RECORD;
  v_current_date DATE;
  v_end_date DATE;
  v_payment_number INTEGER;
BEGIN
  -- الحصول على بيانات العقد
  SELECT * INTO v_contract
  FROM contracts
  WHERE id = p_contract_id AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- البدء من تاريخ بداية العقد
  v_current_date := v_contract.start_date;
  v_end_date := v_contract.end_date;
  v_payment_number := 1;
  
  -- إنشاء جدول الدفعات
  WHILE v_current_date < v_end_date LOOP
    INSERT INTO rental_payments (
      payment_number,
      contract_id, 
      amount_due, 
      due_date, 
      status
    ) VALUES (
      'PAY-' || v_contract.contract_number || '-' || LPAD(v_payment_number::TEXT, 3, '0'),
      p_contract_id, 
      COALESCE(v_contract.monthly_rent, 0), 
      v_current_date, 
      'معلقة'
    )
    ON CONFLICT DO NOTHING;
    
    -- الانتقال للشهر التالي
    IF v_contract.payment_frequency = 'شهري' THEN
      v_current_date := v_current_date + INTERVAL '1 month';
    ELSIF v_contract.payment_frequency = 'ربع سنوي' THEN
      v_current_date := v_current_date + INTERVAL '3 months';
    ELSIF v_contract.payment_frequency = 'نصف سنوي' THEN
      v_current_date := v_current_date + INTERVAL '6 months';
    ELSIF v_contract.payment_frequency = 'سنوي' THEN
      v_current_date := v_current_date + INTERVAL '1 year';
    ELSE
      v_current_date := v_current_date + INTERVAL '1 month';
    END IF;
    
    v_payment_number := v_payment_number + 1;
  END LOOP;
END;
$$;
