
CREATE OR REPLACE FUNCTION public.calculate_account_balance(account_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    balance numeric := 0;
    opening_bal numeric := 0;
    acc_type account_type;
    acc_nature account_nature;
BEGIN
    -- جلب نوع الحساب وطبيعته
    SELECT account_type, account_nature INTO acc_type, acc_nature
    FROM accounts
    WHERE id = account_uuid;
    
    -- جلب الرصيد الافتتاحي (من السنة المالية النشطة)
    SELECT COALESCE(ob.opening_balance, 0) INTO opening_bal
    FROM opening_balances ob
    JOIN fiscal_years fy ON ob.fiscal_year_id = fy.id
    WHERE ob.account_id = account_uuid 
      AND fy.is_active = true;
    
    -- الحسابات المدينة بطبيعتها: الأصول والمصروفات
    IF acc_type IN ('asset', 'expense') OR acc_nature = 'debit' THEN
        SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
        INTO balance
        FROM journal_entry_lines
        WHERE account_id = account_uuid;
    -- الحسابات الدائنة بطبيعتها: الخصوم وحقوق الملكية والإيرادات
    ELSE
        SELECT COALESCE(SUM(credit_amount - debit_amount), 0)
        INTO balance
        FROM journal_entry_lines
        WHERE account_id = account_uuid;
    END IF;
    
    -- إضافة الرصيد الافتتاحي
    RETURN balance + COALESCE(opening_bal, 0);
END;
$function$;
