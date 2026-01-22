
-- إصلاح دالة إنشاء القيد التلقائي للسندات
CREATE OR REPLACE FUNCTION public.auto_create_journal_for_voucher()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role text;
    v_entry_id uuid;
    v_entry_number text;
    v_fiscal_year_id uuid;
BEGIN
    -- فحص الصلاحيات للسندات الكبيرة
    IF NEW.amount > 10000 AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'السندات أكبر من 10,000 ريال تتطلب صلاحية مالية';
      END IF;
    END IF;

    -- استخدام is_active بدلاً من status
    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
    
    v_entry_number := 'JE-VCH-' || to_char(now(), 'YYYYMMDD') || '-' || 
                     LPAD(nextval('journal_entry_number_seq')::text, 6, '0');
    
    INSERT INTO journal_entries (
        entry_number,
        entry_date,
        description,
        reference_type,
        reference_id,
        status,
        fiscal_year_id,
        total_debit,
        total_credit
    ) VALUES (
        v_entry_number,
        CURRENT_DATE,
        'قيد سند رقم: ' || NEW.voucher_number,
        'payment_voucher',
        NEW.id,
        'draft',
        v_fiscal_year_id,
        NEW.amount,
        NEW.amount
    ) RETURNING id INTO v_entry_id;
    
    NEW.journal_entry_id := v_entry_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
