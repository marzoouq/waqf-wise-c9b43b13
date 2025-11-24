
-- ============================================
-- إصلاح التحذيرات الأمنية المتبقية
-- ============================================

-- 1. حذف النسخ القديمة من الدوال المتعددة
DROP FUNCTION IF EXISTS public.calculate_loan_schedule(numeric, integer, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_loan_schedule(uuid, numeric, integer, numeric, date) CASCADE;

-- 2. إعادة إنشاء الدوال مع search_path
-- ============================================

-- calculate_account_balance
CREATE OR REPLACE FUNCTION public.calculate_account_balance(account_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    balance numeric := 0;
    acc_nature account_nature;
BEGIN
    SELECT account_nature INTO acc_nature
    FROM accounts
    WHERE id = account_uuid;
    
    IF acc_nature IN ('debit', 'asset', 'expense') THEN
        SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
        INTO balance
        FROM journal_entry_lines
        WHERE account_id = account_uuid;
    ELSE
        SELECT COALESCE(SUM(credit_amount - debit_amount), 0)
        INTO balance
        FROM journal_entry_lines
        WHERE account_id = account_uuid;
    END IF;
    
    RETURN balance;
END;
$$;

-- calculate_loan_schedule (النسخة البسيطة)
CREATE OR REPLACE FUNCTION public.calculate_loan_schedule(
    p_principal numeric,
    p_term_months integer,
    p_interest_rate numeric DEFAULT 0
)
RETURNS TABLE (
    installment_number integer,
    due_date date,
    principal_amount numeric,
    interest_amount numeric,
    total_amount numeric,
    remaining_balance numeric
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    monthly_payment numeric;
    remaining numeric;
    interest numeric;
    principal_payment numeric;
    i integer;
BEGIN
    remaining := p_principal;
    
    IF p_interest_rate > 0 THEN
        monthly_payment := p_principal * (p_interest_rate/100/12) * 
                          POWER(1 + p_interest_rate/100/12, p_term_months) / 
                          (POWER(1 + p_interest_rate/100/12, p_term_months) - 1);
    ELSE
        monthly_payment := p_principal / p_term_months;
    END IF;
    
    FOR i IN 1..p_term_months LOOP
        IF p_interest_rate > 0 THEN
            interest := remaining * (p_interest_rate/100/12);
            principal_payment := monthly_payment - interest;
        ELSE
            interest := 0;
            principal_payment := monthly_payment;
        END IF;
        
        remaining := remaining - principal_payment;
        
        installment_number := i;
        due_date := CURRENT_DATE + (i || ' months')::interval;
        principal_amount := principal_payment;
        interest_amount := interest;
        total_amount := monthly_payment;
        remaining_balance := remaining;
        
        RETURN NEXT;
    END LOOP;
END;
$$;

-- calculate_monthly_payment
CREATE OR REPLACE FUNCTION public.calculate_monthly_payment(
    p_principal numeric,
    p_term_months integer,
    p_interest_rate numeric DEFAULT 0
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
    IF p_interest_rate > 0 THEN
        RETURN p_principal * (p_interest_rate/100/12) * 
               POWER(1 + p_interest_rate/100/12, p_term_months) / 
               (POWER(1 + p_interest_rate/100/12, p_term_months) - 1);
    ELSE
        RETURN p_principal / p_term_months;
    END IF;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.calculate_account_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_loan_schedule(numeric, integer, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_monthly_payment(numeric, integer, numeric) TO authenticated;
