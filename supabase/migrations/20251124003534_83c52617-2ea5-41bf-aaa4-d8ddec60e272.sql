-- ========================================
-- المرحلة 1: RLS Policies للصلاحيات
-- ========================================

-- صلاحيات rental_payments
DROP POLICY IF EXISTS "allow_authenticated_insert_rental_payments" ON rental_payments;
CREATE POLICY "allow_authenticated_insert_rental_payments"
ON rental_payments FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_authenticated_select_rental_payments" ON rental_payments;
CREATE POLICY "allow_authenticated_select_rental_payments"
ON rental_payments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "allow_authenticated_update_rental_payments" ON rental_payments;
CREATE POLICY "allow_authenticated_update_rental_payments"
ON rental_payments FOR UPDATE
TO authenticated
USING (true);

-- صلاحيات journal_entries
DROP POLICY IF EXISTS "allow_authenticated_insert_journal_entries" ON journal_entries;
CREATE POLICY "allow_authenticated_insert_journal_entries"
ON journal_entries FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_authenticated_select_journal_entries" ON journal_entries;
CREATE POLICY "allow_authenticated_select_journal_entries"
ON journal_entries FOR SELECT
TO authenticated
USING (true);

-- صلاحيات journal_entry_lines
DROP POLICY IF EXISTS "allow_authenticated_insert_journal_entry_lines" ON journal_entry_lines;
CREATE POLICY "allow_authenticated_insert_journal_entry_lines"
ON journal_entry_lines FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_authenticated_select_journal_entry_lines" ON journal_entry_lines;
CREATE POLICY "allow_authenticated_select_journal_entry_lines"
ON journal_entry_lines FOR SELECT
TO authenticated
USING (true);

-- ========================================
-- المرحلة 2: إصلاح create_payment_schedule
-- ========================================

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
  v_inserted_count INTEGER := 0;
BEGIN
  -- تحقق من صحة المدخلات
  IF p_contract_id IS NULL THEN
    RAISE EXCEPTION 'Contract ID cannot be null';
  END IF;
  
  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Start date and end date cannot be null';
  END IF;
  
  IF p_end_date <= p_start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  IF p_monthly_rent <= 0 THEN
    RAISE EXCEPTION 'Monthly rent must be greater than zero';
  END IF;

  -- حساب عدد الأشهر
  v_months := EXTRACT(MONTH FROM AGE(p_end_date, p_start_date)) + 
              EXTRACT(YEAR FROM AGE(p_end_date, p_start_date)) * 12;
  
  IF v_months <= 0 THEN
    RAISE EXCEPTION 'Contract duration must be at least 1 month';
  END IF;
  
  v_total_amount := p_monthly_rent * v_months;
  
  -- تحديد عدد الدفعات
  IF p_payment_frequency = 'شهري' THEN 
    v_payments_count := v_months;
    v_payment_amount := p_monthly_rent;
  ELSIF p_payment_frequency = 'سنوي' THEN 
    v_payments_count := GREATEST(1, v_months / 12);
    v_payment_amount := p_monthly_rent * 12;
  ELSE
    RAISE EXCEPTION 'نوع الدفع غير مدعوم: %. استخدم "شهري" أو "سنوي"', p_payment_frequency;
  END IF;
  
  -- حذف الدفعات القديمة إن وجدت
  DELETE FROM rental_payments WHERE contract_id = p_contract_id;
  
  -- توليد الدفعات
  year_suffix := TO_CHAR(p_start_date, 'YY');
  v_current_date := p_start_date;
  
  FOR i IN 1..v_payments_count LOOP
    -- حساب الرقم التسلسلي
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM rental_payments
    WHERE payment_number LIKE 'PAY-' || year_suffix || '-%';
    
    v_payment_number := 'PAY-' || year_suffix || '-' || LPAD((next_number + i - 1)::TEXT, 6, '0');
    
    -- إدخال الدفعة
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
    
    v_inserted_count := v_inserted_count + 1;
    
    -- التاريخ التالي
    IF p_payment_frequency = 'شهري' THEN
      v_current_date := v_current_date + INTERVAL '1 month';
    ELSIF p_payment_frequency = 'سنوي' THEN
      v_current_date := v_current_date + INTERVAL '1 year';
    END IF;
  END LOOP;
  
  -- التحقق من نجاح الإدخال
  IF v_inserted_count = 0 THEN
    RAISE EXCEPTION 'Failed to create any payments';
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'payments_created', v_inserted_count,
    'total_amount', v_total_amount,
    'monthly_rent', p_monthly_rent,
    'contract_duration_months', v_months
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in create_payment_schedule: %', SQLERRM;
END;
$$;

-- ========================================
-- المرحلة 3: Auto Journal Entries Trigger
-- ========================================

CREATE OR REPLACE FUNCTION auto_create_journal_entry_for_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_fiscal_year_id UUID;
  v_entry_number TEXT;
  v_journal_entry_id UUID;
  v_receivable_account_id UUID;
  v_revenue_account_id UUID;
  v_next_seq INTEGER;
BEGIN
  -- جلب السنة المالية الحالية
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE status = 'active'
  AND NEW.due_date BETWEEN start_date AND end_date
  LIMIT 1;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE WARNING 'No active fiscal year found for payment date %', NEW.due_date;
    RETURN NEW;
  END IF;
  
  -- جلب حسابات الإيرادات والذمم
  SELECT id INTO v_receivable_account_id
  FROM accounts
  WHERE code = '1201' -- حساب ذمم المستأجرين
  LIMIT 1;
  
  SELECT id INTO v_revenue_account_id
  FROM accounts
  WHERE code = '4001' -- حساب إيرادات الإيجارات
  LIMIT 1;
  
  IF v_receivable_account_id IS NULL OR v_revenue_account_id IS NULL THEN
    RAISE WARNING 'Required accounts not found';
    RETURN NEW;
  END IF;
  
  -- توليد رقم القيد التسلسلي
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 12) AS INTEGER)), 0) + 1
  INTO v_next_seq
  FROM journal_entries
  WHERE entry_number LIKE 'JE-' || TO_CHAR(NEW.due_date, 'YYYYMMDD') || '-%';
  
  v_entry_number := 'JE-' || TO_CHAR(NEW.due_date, 'YYYYMMDD') || '-' || 
                    LPAD(v_next_seq::TEXT, 4, '0');
  
  -- إنشاء القيد المحاسبي
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    description,
    reference_type,
    reference_id,
    fiscal_year_id,
    status
  ) VALUES (
    v_entry_number,
    NEW.due_date,
    'قيد إيجار - دفعة رقم: ' || NEW.payment_number,
    'rental_payment',
    NEW.id,
    v_fiscal_year_id,
    'draft'
  )
  RETURNING id INTO v_journal_entry_id;
  
  -- سطر المدين (ذمم المستأجرين)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    line_number,
    account_id,
    debit_amount,
    credit_amount,
    description
  ) VALUES (
    v_journal_entry_id,
    1,
    v_receivable_account_id,
    NEW.amount_due,
    0,
    'مدين - ذمم مستأجرين'
  );
  
  -- سطر الدائن (إيرادات الإيجارات)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    line_number,
    account_id,
    debit_amount,
    credit_amount,
    description
  ) VALUES (
    v_journal_entry_id,
    2,
    v_revenue_account_id,
    0,
    NEW.amount_due,
    'دائن - إيرادات إيجارات'
  );
  
  -- تحديث rental_payment بمعرف القيد
  UPDATE rental_payments
  SET journal_entry_id = v_journal_entry_id
  WHERE id = NEW.id;
  
  RAISE NOTICE 'Created journal entry % for payment %', v_journal_entry_id, NEW.id;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating journal entry: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS trigger_auto_create_journal_entry_for_payment ON rental_payments;

CREATE TRIGGER trigger_auto_create_journal_entry_for_payment
AFTER INSERT ON rental_payments
FOR EACH ROW
EXECUTE FUNCTION auto_create_journal_entry_for_payment();