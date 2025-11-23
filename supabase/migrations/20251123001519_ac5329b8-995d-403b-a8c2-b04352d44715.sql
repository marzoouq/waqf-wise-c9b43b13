-- المرحلة 2: جدول القروض الكامل
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number TEXT UNIQUE NOT NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  loan_amount NUMERIC NOT NULL CHECK (loan_amount > 0),
  interest_rate NUMERIC DEFAULT 0 CHECK (interest_rate >= 0),
  term_months INTEGER NOT NULL CHECK (term_months > 0),
  monthly_installment NUMERIC NOT NULL,
  total_paid NUMERIC DEFAULT 0,
  remaining_balance NUMERIC,
  status TEXT DEFAULT 'نشط' CHECK (status IN ('نشط', 'متأخر', 'مسدد', 'ملغي')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

-- جدول أقساط القروض
CREATE TABLE IF NOT EXISTS loan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  payment_date DATE,
  status TEXT DEFAULT 'معلق' CHECK (status IN ('معلق', 'مدفوع', 'متأخر', 'معفي')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرسة
CREATE INDEX IF NOT EXISTS idx_loans_beneficiary ON loans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_installments_loan ON loan_installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_installments_due_date ON loan_installments(due_date);

-- دالة لتوليد رقم القرض
CREATE SEQUENCE IF NOT EXISTS loan_seq START 1;

CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.loan_number IS NULL THEN
    NEW.loan_number := 'LOAN-' || TO_CHAR(NOW(), 'YY') || '-' || 
      LPAD(NEXTVAL('loan_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_loan_number
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION generate_loan_number();

-- دالة لحساب الرصيد المتبقي
CREATE OR REPLACE FUNCTION update_loan_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.remaining_balance := NEW.loan_amount - NEW.total_paid;
  
  -- تحديث الحالة
  IF NEW.remaining_balance <= 0 THEN
    NEW.status := 'مسدد';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_loan_balance
  BEFORE INSERT OR UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_balance();

-- دالة لإنشاء الأقساط التلقائية
CREATE OR REPLACE FUNCTION create_loan_installments(
  p_loan_id UUID,
  p_start_date DATE,
  p_term_months INTEGER,
  p_monthly_installment NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_installment_number INTEGER;
  v_due_date DATE;
BEGIN
  FOR v_installment_number IN 1..p_term_months LOOP
    v_due_date := p_start_date + (v_installment_number || ' months')::INTERVAL;
    
    INSERT INTO loan_installments (
      loan_id,
      installment_number,
      due_date,
      amount,
      status
    ) VALUES (
      p_loan_id,
      v_installment_number,
      v_due_date,
      p_monthly_installment,
      'معلق'
    );
  END LOOP;
END;
$$;

-- دالة للاستقطاع التلقائي من التوزيعات
CREATE OR REPLACE FUNCTION auto_deduct_loan_installments(
  p_distribution_id UUID
)
RETURNS TABLE (
  beneficiary_id UUID,
  original_amount NUMERIC,
  deducted_amount NUMERIC,
  final_amount NUMERIC,
  installments_paid INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH beneficiary_loans AS (
    SELECT 
      l.beneficiary_id,
      l.id as loan_id,
      li.id as installment_id,
      li.amount as installment_amount
    FROM loans l
    JOIN loan_installments li ON li.loan_id = l.id
    WHERE l.status = 'نشط'
    AND li.status = 'معلق'
    AND li.due_date <= CURRENT_DATE
  )
  SELECT 
    dd.beneficiary_id,
    dd.allocated_amount as original_amount,
    COALESCE(SUM(bl.installment_amount), 0) as deducted_amount,
    dd.allocated_amount - COALESCE(SUM(bl.installment_amount), 0) as final_amount,
    COUNT(bl.installment_id)::INTEGER as installments_paid
  FROM distribution_details dd
  LEFT JOIN beneficiary_loans bl ON bl.beneficiary_id = dd.beneficiary_id
  WHERE dd.distribution_id = p_distribution_id
  GROUP BY dd.beneficiary_id, dd.allocated_amount;
END;
$$;

-- RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enable_read_loans" ON loans FOR SELECT USING (true);
CREATE POLICY "enable_all_loans" ON loans FOR ALL USING (true);
CREATE POLICY "enable_read_installments" ON loan_installments FOR SELECT USING (true);
CREATE POLICY "enable_all_installments" ON loan_installments FOR ALL USING (true);