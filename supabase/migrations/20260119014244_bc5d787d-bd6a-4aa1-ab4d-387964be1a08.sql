
-- ============================================
-- 🔐 تأمين الدوال المتبقية - الجزء 3
-- الفحص الجنائي 2026-01-19
-- ============================================

-- 1. تأمين دالة create_distribution_with_details (بالتوقيع الصحيح)
CREATE OR REPLACE FUNCTION public.create_distribution_with_details(
    p_distribution_date date,
    p_total_amount numeric,
    p_distribution_type text,
    p_waqf_name text,
    p_nazer_percentage numeric DEFAULT 10,
    p_charity_percentage numeric DEFAULT 5,
    p_corpus_percentage numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_distribution_id uuid;
    v_distribution_number text;
    v_fiscal_year_id uuid;
BEGIN
    -- ✅ فحص الصلاحيات
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin', 'accountant')
    LIMIT 1;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'غير مصرح: إنشاء التوزيع يتطلب صلاحية ناظر أو مدير أو محاسب';
    END IF;

    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE status = 'active' LIMIT 1;
    
    v_distribution_number := 'DIST-' || to_char(now(), 'YYYYMMDD') || '-' || 
                            LPAD((COALESCE((SELECT COUNT(*) FROM distributions WHERE DATE(created_at) = CURRENT_DATE), 0) + 1)::text, 4, '0');

    INSERT INTO distributions (
        distribution_number,
        distribution_date,
        total_amount,
        distribution_type,
        waqf_name,
        nazer_percentage,
        charity_percentage,
        corpus_percentage,
        fiscal_year_id,
        status,
        created_by
    ) VALUES (
        v_distribution_number,
        p_distribution_date,
        p_total_amount,
        p_distribution_type,
        p_waqf_name,
        p_nazer_percentage,
        p_charity_percentage,
        p_corpus_percentage,
        v_fiscal_year_id,
        'draft',
        auth.uid()
    ) RETURNING id INTO v_distribution_id;
    
    RETURN v_distribution_id;
END;
$$;

-- 2. تأمين دالة update_tenant_ledger_on_voucher (Trigger)
CREATE OR REPLACE FUNCTION public.update_tenant_ledger_on_voucher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- فحص للمبالغ الكبيرة
    IF NEW.amount > 20000 AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'تحديث دفتر المستأجر لمبالغ كبيرة يتطلب صلاحية مالية';
      END IF;
    END IF;

    IF NEW.tenant_id IS NOT NULL THEN
        IF NEW.type = 'receipt' THEN
            UPDATE tenants 
            SET account_balance = COALESCE(account_balance, 0) - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.tenant_id;
        ELSIF NEW.type = 'payment' THEN
            UPDATE tenants 
            SET account_balance = COALESCE(account_balance, 0) + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.tenant_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. تأمين دالة close_fiscal_year
CREATE OR REPLACE FUNCTION public.close_fiscal_year(p_fiscal_year_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- ✅ فحص الصلاحيات - إغلاق السنة المالية يتطلب ناظر أو مدير فقط
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin')
    LIMIT 1;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'غير مصرح: إغلاق السنة المالية يتطلب صلاحية ناظر أو مدير';
    END IF;

    UPDATE fiscal_years SET status = 'closed', closed_at = NOW() WHERE id = p_fiscal_year_id;
    
    INSERT INTO audit_logs (action_type, table_name, record_id, description, user_id)
    VALUES ('CLOSE_FISCAL_YEAR', 'fiscal_years', p_fiscal_year_id::text, 'إغلاق السنة المالية', auth.uid());
END;
$$;

-- 4. تأمين دالة update_beneficiary_account_balance (Trigger)
CREATE OR REPLACE FUNCTION public.update_beneficiary_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- فحص للمبالغ الكبيرة
    IF NEW.amount > 10000 AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'تحديث رصيد المستفيد لمبالغ كبيرة يتطلب صلاحية مالية';
      END IF;
    END IF;

    UPDATE beneficiaries 
    SET account_balance = COALESCE(account_balance, 0) + NEW.amount,
        total_received = COALESCE(total_received, 0) + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.beneficiary_id;
    
    RETURN NEW;
END;
$$;

-- 5. تأمين دالة process_payment_voucher
CREATE OR REPLACE FUNCTION public.process_payment_voucher(p_voucher_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_voucher RECORD;
BEGIN
    -- ✅ فحص الصلاحيات
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
    LIMIT 1;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'غير مصرح: معالجة السندات تتطلب صلاحية مالية';
    END IF;

    SELECT * INTO v_voucher FROM payment_vouchers WHERE id = p_voucher_id;
    
    IF v_voucher IS NULL THEN
      RAISE EXCEPTION 'السند غير موجود';
    END IF;
    
    UPDATE payment_vouchers 
    SET status = 'paid', 
        payment_date = NOW(),
        processed_by = auth.uid()
    WHERE id = p_voucher_id;
    
    INSERT INTO audit_logs (action_type, table_name, record_id, description, user_id)
    VALUES ('PROCESS_VOUCHER', 'payment_vouchers', p_voucher_id::text, 'معالجة السند رقم ' || v_voucher.voucher_number, auth.uid());
END;
$$;

-- إضافة تعليقات للتوثيق
COMMENT ON FUNCTION create_distribution_with_details(date, numeric, text, text, numeric, numeric, numeric) IS '🔐 مؤمنة - إنشاء التوزيع مع التفاصيل - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION update_tenant_ledger_on_voucher IS '🔐 مؤمنة - تحديث دفتر المستأجر - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION close_fiscal_year IS '🔐 مؤمنة - إغلاق السنة المالية - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION update_beneficiary_account_balance IS '🔐 مؤمنة - تحديث رصيد المستفيد - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION process_payment_voucher IS '🔐 مؤمنة - معالجة السندات - الفحص الجنائي 2026-01-19';
