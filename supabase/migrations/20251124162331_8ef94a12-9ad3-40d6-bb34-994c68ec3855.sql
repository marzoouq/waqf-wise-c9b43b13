
-- ============================================
-- إصلاح آخر 3 دوال SECURITY DEFINER بدون search_path
-- ============================================

-- 1. auto_create_distribution_approvals
CREATE OR REPLACE FUNCTION public.auto_create_distribution_approvals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- إنشاء موافقات التوزيع تلقائياً
    INSERT INTO payment_approvals (
        reference_id,
        approval_type,
        approval_level,
        required_role,
        status
    )
    SELECT 
        NEW.id,
        'distribution',
        level_num,
        CASE level_num
            WHEN 1 THEN 'accountant'
            WHEN 2 THEN 'nazer'
            WHEN 3 THEN 'admin'
        END,
        'pending'
    FROM generate_series(1, 3) as level_num;
    
    RETURN NEW;
END;
$$;

-- 2. auto_create_journal_entry_for_payment
CREATE OR REPLACE FUNCTION public.auto_create_journal_entry_for_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_entry_id uuid;
    v_entry_number text;
BEGIN
    -- إنشاء قيد محاسبي تلقائي عند الدفع
    v_entry_number := 'JE-' || to_char(now(), 'YYYYMMDD') || '-' || 
                     LPAD(nextval('journal_entry_number_seq')::text, 6, '0');
    
    INSERT INTO journal_entries (
        entry_number,
        entry_date,
        description,
        reference_type,
        reference_id,
        status
    ) VALUES (
        v_entry_number,
        CURRENT_DATE,
        'قيد دفعة رقم: ' || NEW.voucher_number,
        'payment_voucher',
        NEW.id,
        'posted'
    ) RETURNING id INTO v_entry_id;
    
    -- سطر الدائن (النقدية/البنك)
    INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        description,
        debit_amount,
        credit_amount
    ) VALUES (
        v_entry_id,
        (SELECT id FROM accounts WHERE code = '1010' LIMIT 1),
        'دفع مستحقات: ' || NEW.beneficiary_name,
        0,
        NEW.total_amount
    );
    
    -- سطر المدين (المصروف)
    INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        description,
        debit_amount,
        credit_amount
    ) VALUES (
        v_entry_id,
        (SELECT id FROM accounts WHERE code = '4010' LIMIT 1),
        'دفع مستحقات: ' || NEW.beneficiary_name,
        NEW.total_amount,
        0
    );
    
    RETURN NEW;
END;
$$;

-- 3. auto_generate_invoice_number
CREATE OR REPLACE FUNCTION public.auto_generate_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || 
                             LPAD(nextval('invoice_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.auto_create_distribution_approvals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_create_journal_entry_for_payment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_generate_invoice_number() TO authenticated;

COMMENT ON FUNCTION public.auto_create_distribution_approvals IS 'Trigger function - إنشاء موافقات توزيع تلقائية - مع search_path آمن';
COMMENT ON FUNCTION public.auto_create_journal_entry_for_payment IS 'Trigger function - إنشاء قيد محاسبي تلقائي - مع search_path آمن';
COMMENT ON FUNCTION public.auto_generate_invoice_number IS 'Trigger function - توليد رقم فاتورة تلقائي - مع search_path آمن';
