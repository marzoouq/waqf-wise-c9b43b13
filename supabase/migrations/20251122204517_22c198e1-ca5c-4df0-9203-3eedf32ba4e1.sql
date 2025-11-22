-- المرحلة 1: تحديث هيكل قاعدة البيانات لربط دفعات الإيجار بالفواتير وسندات القبض

-- 1. إضافة أعمدة للربط في جدول rental_payments
ALTER TABLE public.rental_payments
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS receipt_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-- 2. إضافة عمود للربط في جدول invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS rental_payment_id UUID REFERENCES public.rental_payments(id) ON DELETE CASCADE;

-- 3. إضافة عمود للربط في جدول payments (سندات القبض)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS rental_payment_id UUID REFERENCES public.rental_payments(id) ON DELETE CASCADE;

-- 4. إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_rental_payments_invoice_id ON public.rental_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_receipt_id ON public.rental_payments(receipt_id);
CREATE INDEX IF NOT EXISTS idx_invoices_rental_payment_id ON public.invoices(rental_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_rental_payment_id ON public.payments(rental_payment_id);

-- 5. إضافة تعليقات توضيحية
COMMENT ON COLUMN public.rental_payments.invoice_id IS 'معرف الفاتورة المرتبطة بدفعة الإيجار';
COMMENT ON COLUMN public.rental_payments.receipt_id IS 'معرف سند القبض المرتبط بدفعة الإيجار';
COMMENT ON COLUMN public.invoices.rental_payment_id IS 'معرف دفعة الإيجار إذا كانت الفاتورة للإيجار';
COMMENT ON COLUMN public.payments.rental_payment_id IS 'معرف دفعة الإيجار إذا كان السند للإيجار';

-- ========================================
-- المرحلة 2: إنشاء دالة تلقائية لإصدار الفاتورة وسند القبض
-- ========================================

CREATE OR REPLACE FUNCTION public.create_rental_invoice_and_receipt(
  p_rental_payment_id UUID,
  p_contract_id UUID,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_payment_method TEXT DEFAULT 'نقدي',
  p_tenant_name TEXT DEFAULT NULL,
  p_tenant_id TEXT DEFAULT NULL,
  p_tenant_email TEXT DEFAULT NULL,
  p_tenant_phone TEXT DEFAULT NULL,
  p_property_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  invoice_id UUID,
  receipt_id UUID,
  journal_entry_id UUID,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_invoice_id UUID;
  v_receipt_id UUID;
  v_journal_entry_id UUID;
  v_fiscal_year_id UUID;
  v_invoice_number TEXT;
  v_receipt_number TEXT;
  v_entry_number TEXT;
  v_debit_account UUID;
  v_credit_account UUID;
  v_tenant_name TEXT;
  v_tenant_id TEXT;
  v_tenant_email TEXT;
  v_tenant_phone TEXT;
  v_property_name TEXT;
  v_payment_number TEXT;
BEGIN
  -- التحقق من وجود دفعة الإيجار
  IF NOT EXISTS(SELECT 1 FROM rental_payments WHERE id = p_rental_payment_id) THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::UUID, 
      false, 'دفعة الإيجار غير موجودة';
    RETURN;
  END IF;

  -- الحصول على السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE is_active = true
  LIMIT 1;

  IF v_fiscal_year_id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::UUID,
      false, 'لا توجد سنة مالية نشطة';
    RETURN;
  END IF;

  -- جلب بيانات المستأجر من العقد إذا لم يتم تمريرها
  IF p_tenant_name IS NULL OR p_tenant_id IS NULL THEN
    SELECT 
      c.tenant_name, 
      c.tenant_id_number,
      c.tenant_email,
      c.tenant_phone,
      p.name
    INTO v_tenant_name, v_tenant_id, v_tenant_email, v_tenant_phone, v_property_name
    FROM contracts c
    LEFT JOIN properties p ON p.id = c.property_id
    WHERE c.id = p_contract_id;
  ELSE
    v_tenant_name := p_tenant_name;
    v_tenant_id := p_tenant_id;
    v_tenant_email := p_tenant_email;
    v_tenant_phone := p_tenant_phone;
    v_property_name := p_property_name;
  END IF;

  -- الحصول على payment_number
  SELECT payment_number INTO v_payment_number
  FROM rental_payments
  WHERE id = p_rental_payment_id;

  -- تحديد الحسابات المحاسبية
  -- حساب نقدية (مدين)
  SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
  -- حساب إيرادات إيجار (دائن)
  SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.2' LIMIT 1;

  IF v_debit_account IS NULL OR v_credit_account IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::UUID,
      false, 'الحسابات المحاسبية غير موجودة';
    RETURN;
  END IF;

  -- ========================================
  -- 1. إنشاء الفاتورة (ZATCA Compliant)
  -- ========================================
  
  -- توليد رقم الفاتورة
  v_invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM invoices WHERE invoice_date = p_payment_date)::TEXT, 4, '0');

  INSERT INTO invoices (
    invoice_number,
    invoice_date,
    due_date,
    customer_name,
    customer_email,
    customer_phone,
    subtotal,
    tax_amount,
    total_amount,
    status,
    notes,
    rental_payment_id,
    invoice_type,
    zatca_uuid,
    zatca_hash
  ) VALUES (
    v_invoice_number,
    p_payment_date,
    p_payment_date,
    v_tenant_name,
    v_tenant_email,
    v_tenant_phone,
    ROUND(p_amount / 1.15, 2), -- المبلغ قبل الضريبة
    ROUND(p_amount - (p_amount / 1.15), 2), -- ضريبة القيمة المضافة 15%
    p_amount,
    'paid',
    'فاتورة إيجار - ' || v_property_name || ' - ' || v_payment_number,
    p_rental_payment_id,
    'tax_invoice',
    gen_random_uuid()::TEXT, -- ZATCA UUID
    encode(sha256(v_invoice_number::bytea), 'hex') -- ZATCA Hash
  ) RETURNING id INTO v_invoice_id;

  -- إضافة بند الفاتورة
  INSERT INTO invoice_lines (
    invoice_id,
    line_number,
    description,
    quantity,
    unit_price,
    line_total
  ) VALUES (
    v_invoice_id,
    1,
    'إيجار عقار - ' || v_property_name,
    1,
    ROUND(p_amount / 1.15, 2),
    ROUND(p_amount / 1.15, 2)
  );

  -- ========================================
  -- 2. إنشاء سند القبض
  -- ========================================
  
  -- توليد رقم سند القبض
  v_receipt_number := 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM payments WHERE payment_date = p_payment_date)::TEXT, 4, '0');

  INSERT INTO payments (
    payment_number,
    payment_type,
    payment_date,
    amount,
    payment_method,
    payer_name,
    description,
    status,
    rental_payment_id,
    reference_number
  ) VALUES (
    v_receipt_number,
    'receipt',
    p_payment_date,
    p_amount,
    p_payment_method,
    v_tenant_name,
    'سند قبض إيجار - ' || v_property_name || ' - ' || v_payment_number,
    'completed',
    p_rental_payment_id,
    v_invoice_number
  ) RETURNING id INTO v_receipt_id;

  -- ========================================
  -- 3. إنشاء القيد اليومية الموحد
  -- ========================================
  
  -- توليد رقم القيد
  v_entry_number := 'JE-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || 
    LPAD((SELECT COUNT(*) + 1 FROM journal_entries)::TEXT, 6, '0');

  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    description,
    fiscal_year_id,
    reference_type,
    reference_id,
    status,
    posted_at
  ) VALUES (
    v_entry_number,
    p_payment_date,
    'إيراد إيجار - ' || v_property_name || ' - فاتورة ' || v_invoice_number,
    v_fiscal_year_id,
    'rental_payment_received',
    p_rental_payment_id,
    'posted',
    NOW()
  ) RETURNING id INTO v_journal_entry_id;

  -- إضافة بند مدين (نقدية)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_journal_entry_id,
    v_debit_account,
    1,
    'نقدية من إيجار',
    p_amount,
    0
  );

  -- إضافة بند دائن (إيرادات إيجار)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    line_number,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_journal_entry_id,
    v_credit_account,
    2,
    'إيراد إيجار',
    0,
    p_amount
  );

  -- ========================================
  -- 4. تحديث دفعة الإيجار بالمعرفات
  -- ========================================
  
  UPDATE rental_payments
  SET 
    invoice_id = v_invoice_id,
    receipt_id = v_receipt_id,
    journal_entry_id = v_journal_entry_id,
    updated_at = NOW()
  WHERE id = p_rental_payment_id;

  -- إرجاع النتيجة
  RETURN QUERY SELECT 
    v_invoice_id,
    v_receipt_id,
    v_journal_entry_id,
    true,
    'تم إصدار الفاتورة وسند القبض والقيد المحاسبي بنجاح';
END;
$function$;

-- إضافة تعليق على الدالة
COMMENT ON FUNCTION public.create_rental_invoice_and_receipt IS 'دالة تلقائية لإصدار فاتورة ZATCA وسند قبض وقيد محاسبي عند تسديد دفعة إيجار';