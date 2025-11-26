-- إصلاح دالة calculate_account_balance لاستخدام account_type بشكل صحيح
CREATE OR REPLACE FUNCTION calculate_account_balance(account_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    balance numeric := 0;
    acc_type account_type;
    acc_nature account_nature;
BEGIN
    -- جلب نوع الحساب وطبيعته
    SELECT account_type, account_nature INTO acc_type, acc_nature
    FROM accounts
    WHERE id = account_uuid;
    
    -- الحسابات المدينة بطبيعتها: الأصول والمصروفات
    -- أو استخدام account_nature = 'debit'
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
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;