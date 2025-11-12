-- ==========================================
-- المرحلة 1: نظام القروض الكامل
-- ==========================================

-- 1. إنشاء جدول القروض
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE NOT NULL,
  loan_number TEXT UNIQUE,
  loan_amount DECIMAL(15,2) NOT NULL CHECK (loan_amount > 0),
  interest_rate DECIMAL(5,2) DEFAULT 0 CHECK (interest_rate >= 0),
  term_months INTEGER NOT NULL CHECK (term_months > 0),
  monthly_installment DECIMAL(15,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'defaulted', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(user_id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. إنشاء جدول الأقساط
CREATE TABLE IF NOT EXISTS public.loan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  due_date DATE NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL CHECK (principal_amount >= 0),
  interest_amount DECIMAL(15,2) DEFAULT 0 CHECK (interest_amount >= 0),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  paid_amount DECIMAL(15,2) DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount DECIMAL(15,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(loan_id, installment_number)
);

-- 3. إنشاء جدول مدفوعات القروض
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  installment_id UUID REFERENCES public.loan_installments(id),
  payment_number TEXT UNIQUE,
  payment_amount DECIMAL(15,2) NOT NULL CHECK (payment_amount > 0),
  payment_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card')),
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. إنشاء Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_loans_beneficiary ON public.loans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_number ON public.loans(loan_number);
CREATE INDEX IF NOT EXISTS idx_installments_loan ON public.loan_installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.loan_installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.loan_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_loan ON public.loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_installment ON public.loan_payments(installment_id);

-- 5. تفعيل RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- 6. سياسات RLS للقروض
CREATE POLICY "Authenticated users can view loans" ON public.loans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert loans" ON public.loans
  FOR INSERT TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update loans" ON public.loans
  FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete loans" ON public.loans
  FOR DELETE TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. سياسات RLS للأقساط
CREATE POLICY "Authenticated users can view installments" ON public.loan_installments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert installments" ON public.loan_installments
  FOR INSERT TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update installments" ON public.loan_installments
  FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. سياسات RLS للمدفوعات
CREATE POLICY "Authenticated users can view payments" ON public.loan_payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert payments" ON public.loan_payments
  FOR INSERT TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payments" ON public.loan_payments
  FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. Function لتوليد رقم القرض تلقائياً
CREATE OR REPLACE FUNCTION public.generate_loan_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(loan_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM loans
  WHERE loan_number LIKE 'LN-' || year_suffix || '-%';
  
  NEW.loan_number := 'LN-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_generate_loan_number
  BEFORE INSERT ON public.loans
  FOR EACH ROW
  WHEN (NEW.loan_number IS NULL)
  EXECUTE FUNCTION public.generate_loan_number();

-- 10. Function لحساب جدول الأقساط
CREATE OR REPLACE FUNCTION public.calculate_loan_schedule(
  p_loan_id UUID,
  p_principal DECIMAL,
  p_interest_rate DECIMAL,
  p_term_months INTEGER,
  p_start_date DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_monthly_payment DECIMAL;
  v_interest_payment DECIMAL;
  v_principal_payment DECIMAL;
  v_remaining_balance DECIMAL;
  v_current_date DATE;
BEGIN
  -- حساب القسط الشهري
  IF p_interest_rate > 0 THEN
    v_monthly_payment := p_principal * (p_interest_rate/1200 * POWER(1 + p_interest_rate/1200, p_term_months)) 
                         / (POWER(1 + p_interest_rate/1200, p_term_months) - 1);
  ELSE
    v_monthly_payment := p_principal / p_term_months;
  END IF;

  -- تحديث القسط الشهري في جدول القروض
  UPDATE loans SET monthly_installment = v_monthly_payment WHERE id = p_loan_id;

  v_remaining_balance := p_principal;
  
  FOR i IN 1..p_term_months LOOP
    v_current_date := p_start_date + (i || ' months')::INTERVAL;
    
    IF p_interest_rate > 0 THEN
      v_interest_payment := v_remaining_balance * p_interest_rate / 1200;
      v_principal_payment := v_monthly_payment - v_interest_payment;
    ELSE
      v_interest_payment := 0;
      v_principal_payment := v_monthly_payment;
    END IF;
    
    IF i = p_term_months THEN
      v_principal_payment := v_remaining_balance;
      v_monthly_payment := v_principal_payment + v_interest_payment;
    END IF;
    
    v_remaining_balance := v_remaining_balance - v_principal_payment;
    
    INSERT INTO loan_installments (
      loan_id, installment_number, due_date,
      principal_amount, interest_amount, total_amount, remaining_amount
    ) VALUES (
      p_loan_id, i, v_current_date,
      v_principal_payment, v_interest_payment, v_monthly_payment, GREATEST(v_remaining_balance, 0)
    );
  END LOOP;
END;
$$;

-- 11. Function لتحديث حالة القرض
CREATE OR REPLACE FUNCTION public.update_loan_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_remaining DECIMAL;
  v_has_overdue BOOLEAN;
BEGIN
  -- حساب المبلغ المتبقي
  SELECT COALESCE(SUM(remaining_amount), 0)
  INTO v_total_remaining
  FROM loan_installments
  WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id);
  
  -- التحقق من وجود أقساط متأخرة
  SELECT EXISTS(
    SELECT 1 FROM loan_installments 
    WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id)
    AND status = 'overdue'
  ) INTO v_has_overdue;
  
  -- تحديث حالة القرض
  UPDATE loans
  SET 
    status = CASE
      WHEN v_total_remaining = 0 THEN 'paid'
      WHEN v_has_overdue THEN 'defaulted'
      ELSE 'active'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.loan_id, OLD.loan_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tr_update_loan_status_on_installment
  AFTER INSERT OR UPDATE ON public.loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_status();

-- 12. Function لتحديث حالة الأقساط المتأخرة
CREATE OR REPLACE FUNCTION public.update_overdue_installments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE loan_installments
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
  AND status IN ('pending', 'partial');
END;
$$;

-- 13. Trigger لتحديث updated_at
CREATE TRIGGER tr_update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Function لتوليد رقم الدفعة
CREATE OR REPLACE FUNCTION public.generate_payment_number_for_loan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM loan_payments
  WHERE payment_number LIKE 'LP-' || year_suffix || '-%';
  
  NEW.payment_number := 'LP-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_generate_loan_payment_number
  BEFORE INSERT ON public.loan_payments
  FOR EACH ROW
  WHEN (NEW.payment_number IS NULL)
  EXECUTE FUNCTION public.generate_payment_number_for_loan();