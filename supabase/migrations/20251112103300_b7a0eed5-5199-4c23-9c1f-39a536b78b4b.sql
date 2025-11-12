-- تحديث دالة create_auto_journal_entry لدعم أنواع إضافية
DROP FUNCTION IF EXISTS public.create_auto_journal_entry(text, uuid, numeric, text, date);

CREATE OR REPLACE FUNCTION public.create_auto_journal_entry(
  p_trigger_event text, 
  p_reference_id uuid, 
  p_amount numeric, 
  p_description text, 
  p_transaction_date date DEFAULT CURRENT_DATE
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_entry_id UUID;
  v_entry_number TEXT;
  v_fiscal_year_id UUID;
  v_debit_account UUID;
  v_credit_account UUID;
BEGIN
  -- الحصول على السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE is_active = true
  LIMIT 1;

  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'لا توجد سنة مالية نشطة';
  END IF;

  -- تحديد الحسابات بناءً على نوع العملية
  CASE p_trigger_event
    WHEN 'payment_receipt' THEN
      -- سند قبض: مدين نقدية / دائن إيرادات
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.1' LIMIT 1;
      
    WHEN 'payment_voucher' THEN
      -- سند صرف: مدين مصروفات / دائن نقدية
      SELECT id INTO v_debit_account FROM accounts WHERE code = '5.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      
    WHEN 'rental_payment' THEN
      -- دفعة إيجار: مدين نقدية / دائن إيرادات إيجار
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.2' LIMIT 1;
      
    WHEN 'maintenance_expense' THEN
      -- صيانة: مدين مصروف صيانة / دائن نقدية
      SELECT id INTO v_debit_account FROM accounts WHERE code = '5.2.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      
    WHEN 'distribution' THEN
      -- توزيع: مدين مصروف توزيع / دائن نقدية
      SELECT id INTO v_debit_account FROM accounts WHERE code = '5.3.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      
    WHEN 'invoice_issued' THEN
      -- فاتورة: مدين عملاء / دائن مبيعات
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.2.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.3' LIMIT 1;
      
    WHEN 'invoice_paid' THEN
      -- تحصيل فاتورة: مدين نقدية / دائن عملاء
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '1.2.1' LIMIT 1;
      
    WHEN 'general_payment' THEN
      -- دفعة عامة (تحدد الحسابات حسب نوع الدفعة)
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.1' LIMIT 1;
      
    ELSE
      RAISE EXCEPTION 'نوع عملية غير مدعوم: %', p_trigger_event;
  END CASE;

  IF v_debit_account IS NULL OR v_credit_account IS NULL THEN
    RAISE EXCEPTION 'الحسابات المحاسبية غير موجودة';
  END IF;

  -- إنشاء رقم القيد
  v_entry_number := 'JE-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM journal_entries)::TEXT, 6, '0');

  -- إنشاء القيد
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    description,
    fiscal_year_id,
    reference_type,
    reference_id,
    status
  ) VALUES (
    v_entry_number,
    p_transaction_date,
    p_description,
    v_fiscal_year_id,
    p_trigger_event,
    p_reference_id,
    'posted'
  ) RETURNING id INTO v_entry_id;

  -- إضافة بند مدين
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_entry_id,
    v_debit_account,
    1,
    p_description,
    p_amount,
    0
  );

  -- إضافة بند دائن
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_entry_id,
    v_credit_account,
    2,
    p_description,
    0,
    p_amount
  );

  RETURN v_entry_id;
END;
$function$;