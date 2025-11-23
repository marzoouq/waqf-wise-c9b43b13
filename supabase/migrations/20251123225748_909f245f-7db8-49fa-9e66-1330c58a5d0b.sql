-- المرحلة 1: إضافة نسبة الضريبة الافتراضية إلى الإعدادات العامة
ALTER TABLE organization_settings 
ADD COLUMN IF NOT EXISTS default_tax_percentage NUMERIC DEFAULT 15;

-- تحديث السجل الموجود بدلاً من إنشاء سجل جديد
UPDATE organization_settings 
SET default_tax_percentage = 15
WHERE default_tax_percentage IS NULL OR default_tax_percentage = 0;

-- المرحلة 2: إنشاء function لحساب الإيراد الشهري للعقار من العقود النشطة
CREATE OR REPLACE FUNCTION calculate_property_revenue(property_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(monthly_rent), 0)
  FROM contracts
  WHERE property_id = $1 AND status = 'نشط'
$$ LANGUAGE SQL STABLE;

-- المرحلة 3: إنشاء function لحساب الوحدات المشغولة
CREATE OR REPLACE FUNCTION calculate_occupied_units(property_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(COALESCE(units_count, 1)), 0)::INTEGER
  FROM contracts
  WHERE property_id = $1 AND status = 'نشط'
$$ LANGUAGE SQL STABLE;

-- المرحلة 4: إنشاء function لتوليد جدول دفعات العقد تلقائياً
CREATE OR REPLACE FUNCTION create_payment_schedule(
  p_contract_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_monthly_rent NUMERIC,
  p_payment_frequency TEXT
) RETURNS JSON AS $$
DECLARE
  v_months INTEGER;
  v_total_amount NUMERIC;
  v_payments_count INTEGER;
  v_payment_amount NUMERIC;
  v_interval TEXT;
  v_current_date DATE;
  v_payment_number TEXT;
  v_created_payments INTEGER := 0;
BEGIN
  -- حساب عدد الأشهر بين التاريخين
  v_months := EXTRACT(MONTH FROM AGE(p_end_date, p_start_date)) + 
              EXTRACT(YEAR FROM AGE(p_end_date, p_start_date)) * 12;
  
  -- حساب المبلغ الإجمالي
  v_total_amount := p_monthly_rent * v_months;
  
  -- تحديد عدد الدفعات والفترة الزمنية حسب التكرار
  CASE p_payment_frequency
    WHEN 'شهري' THEN 
      v_payments_count := v_months;
      v_interval := '1 month';
    WHEN 'ربع سنوي' THEN 
      v_payments_count := GREATEST(CEIL(v_months / 3.0), 1);
      v_interval := '3 months';
    WHEN 'نصف سنوي' THEN 
      v_payments_count := GREATEST(CEIL(v_months / 6.0), 1);
      v_interval := '6 months';
    WHEN 'سنوي' THEN 
      v_payments_count := GREATEST(CEIL(v_months / 12.0), 1);
      v_interval := '12 months';
    WHEN 'دفعة واحدة' THEN 
      v_payments_count := 1;
      v_interval := '0 months';
    WHEN 'دفعتين' THEN 
      v_payments_count := 2;
      v_interval := (v_months / 2)::TEXT || ' months';
    ELSE
      v_payments_count := v_months;
      v_interval := '1 month';
  END CASE;
  
  -- حساب قيمة كل دفعة
  v_payment_amount := v_total_amount / v_payments_count;
  
  -- إنشاء الدفعات
  v_current_date := p_start_date;
  
  FOR i IN 1..v_payments_count LOOP
    -- توليد رقم الدفعة
    v_payment_number := 'RPM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0');
    
    -- إدراج الدفعة
    INSERT INTO rental_payments (
      payment_number,
      contract_id,
      due_date,
      amount_due,
      amount_paid,
      status,
      late_fee,
      discount
    ) VALUES (
      v_payment_number,
      p_contract_id,
      v_current_date,
      v_payment_amount,
      0,
      'معلق',
      0,
      0
    );
    
    v_created_payments := v_created_payments + 1;
    
    -- حساب تاريخ الدفعة التالية
    IF v_interval != '0 months' THEN
      v_current_date := v_current_date + v_interval::INTERVAL;
    END IF;
  END LOOP;
  
  -- إرجاع نتيجة العملية
  RETURN json_build_object(
    'success', true,
    'payments_created', v_created_payments,
    'total_amount', v_total_amount,
    'payment_amount', v_payment_amount
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;