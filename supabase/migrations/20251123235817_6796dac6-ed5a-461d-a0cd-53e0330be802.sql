-- تحديث دالة create_payment_schedule لتبسيط خيارات الدفع
DROP FUNCTION IF EXISTS create_payment_schedule(UUID, DATE, DATE, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION public.create_payment_schedule(
  p_contract_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_monthly_rent NUMERIC,
  p_payment_frequency TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_months INTEGER;
  v_total_amount NUMERIC;
  v_payments_count INTEGER;
  v_payment_amount NUMERIC;
  v_current_date DATE;
  v_payment_number TEXT;
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  -- حساب عدد الأشهر الكاملة
  v_months := EXTRACT(MONTH FROM AGE(p_end_date, p_start_date)) + 
              EXTRACT(YEAR FROM AGE(p_end_date, p_start_date)) * 12;
  
  v_total_amount := p_monthly_rent * v_months;
  
  -- خيارين فقط: شهري أو سنوي
  IF p_payment_frequency = 'شهري' THEN 
    v_payments_count := v_months;
    v_payment_amount := p_monthly_rent;
  ELSIF p_payment_frequency = 'سنوي' THEN 
    v_payments_count := 1;
    v_payment_amount := v_total_amount;
  ELSE
    -- دعم القيم القديمة مؤقتاً
    CASE p_payment_frequency
      WHEN 'ربع سنوي' THEN 
        v_payments_count := GREATEST(1, v_months / 3);
        v_payment_amount := v_total_amount / v_payments_count;
      WHEN 'نصف سنوي' THEN 
        v_payments_count := GREATEST(1, v_months / 6);
        v_payment_amount := v_total_amount / v_payments_count;
      WHEN 'دفعة واحدة', 'دفعة واحدة (مقدماً)' THEN 
        v_payments_count := 1;
        v_payment_amount := v_total_amount;
      WHEN 'دفعتين' THEN 
        v_payments_count := 2;
        v_payment_amount := v_total_amount / 2;
      ELSE 
        RAISE EXCEPTION 'نوع الدفع غير مدعوم: %. استخدم "شهري" أو "سنوي"', p_payment_frequency;
    END CASE;
  END IF;
  
  -- حذف الدفعات القديمة إن وجدت
  DELETE FROM rental_payments WHERE contract_id = p_contract_id;
  
  -- توليد رقم تسلسلي للدفعة
  year_suffix := TO_CHAR(p_start_date, 'YY');
  
  -- إنشاء الدفعات
  v_current_date := p_start_date;
  FOR i IN 1..v_payments_count LOOP
    -- حساب الرقم التسلسلي
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM rental_payments
    WHERE payment_number LIKE 'PAY-' || year_suffix || '-%';
    
    v_payment_number := 'PAY-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
    
    INSERT INTO rental_payments (
      payment_number,
      contract_id,
      due_date,
      amount_due,
      status,
      payment_method
    ) VALUES (
      v_payment_number,
      p_contract_id,
      v_current_date,
      v_payment_amount,
      'معلق',
      'تحويل بنكي'
    );
    
    -- التاريخ التالي
    IF p_payment_frequency = 'شهري' THEN
      v_current_date := v_current_date + INTERVAL '1 month';
    ELSIF p_payment_frequency = 'سنوي' THEN
      v_current_date := v_current_date + INTERVAL '1 year';
    ELSE
      -- للقيم القديمة
      v_current_date := v_current_date + (v_months || ' months')::INTERVAL / v_payments_count;
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'payments_created', v_payments_count,
    'total_amount', v_total_amount,
    'monthly_rent', p_monthly_rent,
    'contract_duration_months', v_months
  );
END;
$$;