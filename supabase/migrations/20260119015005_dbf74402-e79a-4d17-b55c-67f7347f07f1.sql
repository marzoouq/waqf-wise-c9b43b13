
-- ============================================
-- 🔐 تأمين الدوال المالية المتبقية - الجزء 7 (بسيط)
-- الفحص الجنائي 2026-01-19
-- تأمين الدوال التي لا تحتاج تغيير توقيع
-- ============================================

-- 1. تأمين دالة calculate_account_balance
CREATE OR REPLACE FUNCTION public.calculate_account_balance(account_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_balance numeric;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'غير مصرح: حساب رصيد الحساب يتطلب صلاحية مالية';
  END IF;

  SELECT COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0)
  INTO v_balance
  FROM journal_entry_lines
  WHERE account_id = account_uuid;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

-- 2. تأمين دالة calculate_tenant_balance
CREATE OR REPLACE FUNCTION public.calculate_tenant_balance(p_tenant_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_balance numeric;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
  LIMIT 1;
  
  IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'غير مصرح: حساب رصيد المستأجر يتطلب صلاحية مالية';
  END IF;

  SELECT COALESCE(account_balance, 0) INTO v_balance
  FROM tenants WHERE id = p_tenant_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

-- 3. تأمين دالة create_journal_entry_for_payment
CREATE OR REPLACE FUNCTION public.create_journal_entry_for_payment(p_payment_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_entry_id uuid;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'غير مصرح: إنشاء قيد للدفعة يتطلب صلاحية مالية';
  END IF;

  INSERT INTO journal_entries (
    entry_number, entry_date, description, status, reference_type, reference_id
  )
  VALUES (
    'JE-PAY-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
    CURRENT_DATE,
    'قيد دفعة رقم: ' || p_payment_id,
    'draft',
    'payment',
    p_payment_id
  )
  RETURNING id INTO v_entry_id;
  
  RETURN v_entry_id;
END;
$$;

-- 4. تأمين دالة create_journal_entry_from_voucher
CREATE OR REPLACE FUNCTION public.create_journal_entry_from_voucher(p_voucher_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_entry_id uuid;
  v_voucher RECORD;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'غير مصرح: إنشاء قيد من السند يتطلب صلاحية مالية';
  END IF;

  SELECT * INTO v_voucher FROM payment_vouchers WHERE id = p_voucher_id;
  
  IF v_voucher IS NULL THEN
    RAISE EXCEPTION 'السند غير موجود';
  END IF;

  INSERT INTO journal_entries (
    entry_number, entry_date, description, status, reference_type, reference_id, total_debit, total_credit
  )
  VALUES (
    'JE-VCH-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
    CURRENT_DATE,
    'قيد سند رقم: ' || v_voucher.voucher_number,
    'draft',
    'payment_voucher',
    p_voucher_id,
    v_voucher.amount,
    v_voucher.amount
  )
  RETURNING id INTO v_entry_id;
  
  RETURN v_entry_id;
END;
$$;

-- 5. تأمين دالة check_journal_entry_balance
CREATE OR REPLACE FUNCTION public.check_journal_entry_balance(p_entry_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_total_debits numeric;
  v_total_credits numeric;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'غير مصرح: فحص توازن القيد يتطلب صلاحية مالية';
  END IF;

  SELECT COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)
  INTO v_total_debits, v_total_credits
  FROM journal_entry_lines
  WHERE journal_entry_id = p_entry_id;
  
  RETURN v_total_debits = v_total_credits;
END;
$$;

-- 6. تأمين دالة create_invoice_from_rental_payment
CREATE OR REPLACE FUNCTION public.create_invoice_from_rental_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_invoice_number text;
BEGIN
  -- فحص للمبالغ الكبيرة
  IF NEW.amount > 10000 AND auth.uid() IS NOT NULL THEN
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
    LIMIT 1;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'إنشاء فاتورة من الدفعة للمبالغ الكبيرة يتطلب صلاحية مالية';
    END IF;
  END IF;

  v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || 
                     LPAD((COALESCE((SELECT COUNT(*) FROM invoices WHERE DATE(created_at) = CURRENT_DATE), 0) + 1)::text, 4, '0');

  INSERT INTO invoices (
    invoice_number, invoice_date, amount, status, contract_id, tenant_id
  )
  VALUES (
    v_invoice_number,
    CURRENT_DATE,
    NEW.amount,
    'pending',
    NEW.contract_id,
    NEW.tenant_id
  );

  RETURN NEW;
END;
$$;

-- إضافة تعليقات للتوثيق
COMMENT ON FUNCTION calculate_account_balance(uuid) IS '🔐 مؤمنة - حساب رصيد الحساب - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION calculate_tenant_balance(uuid) IS '🔐 مؤمنة - حساب رصيد المستأجر - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION create_journal_entry_for_payment(uuid) IS '🔐 مؤمنة - إنشاء قيد للدفعة - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION create_journal_entry_from_voucher(uuid) IS '🔐 مؤمنة - إنشاء قيد من السند - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION check_journal_entry_balance(uuid) IS '🔐 مؤمنة - فحص توازن القيد - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION create_invoice_from_rental_payment IS '🔐 مؤمنة - إنشاء فاتورة من الدفعة - الفحص الجنائي 2026-01-19';
