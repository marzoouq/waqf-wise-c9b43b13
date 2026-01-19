
-- ============================================
-- 🔐 تأمين الدوال المالية المتبقية - الجزء 4
-- الفحص الجنائي 2026-01-19
-- ============================================

-- 1. تأمين دالة auto_create_distribution_approvals (Trigger)
CREATE OR REPLACE FUNCTION public.auto_create_distribution_approvals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- فحص الصلاحيات للتوزيعات الكبيرة
    IF NEW.total_amount > 20000 AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'إنشاء موافقات التوزيع للمبالغ الكبيرة يتطلب صلاحية مالية';
      END IF;
    END IF;

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

-- 2. تأمين دالة auto_update_distribution_status (Trigger)
CREATE OR REPLACE FUNCTION public.auto_update_distribution_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_all_approved boolean;
BEGIN
    -- فحص الصلاحيات
    IF auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant')
      LIMIT 1;
      
      IF v_user_role IS NULL AND NEW.status = 'approved' THEN
        RAISE EXCEPTION 'تحديث حالة التوزيع يتطلب صلاحية مالية';
      END IF;
    END IF;

    SELECT bool_and(status = 'approved') INTO v_all_approved
    FROM payment_approvals
    WHERE reference_id = NEW.distribution_id;
    
    IF v_all_approved THEN
        UPDATE distributions SET status = 'معتمد', updated_at = NOW() WHERE id = NEW.distribution_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. تأمين دالة calculate_distribution_shares (الأصلية)
CREATE OR REPLACE FUNCTION public.calculate_distribution_shares(
  p_total_amount NUMERIC,
  p_sons_count INTEGER,
  p_daughters_count INTEGER,
  p_wives_count INTEGER
)
RETURNS TABLE(son_share NUMERIC, daughter_share NUMERIC, wife_share NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_total_shares NUMERIC;
  v_son_ratio NUMERIC := 2.0;
  v_daughter_ratio NUMERIC := 1.0;
  v_wife_ratio NUMERIC := 1.0;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'غير مصرح: يتطلب صلاحية ناظر أو مدير أو محاسب';
  END IF;

  v_total_shares := (p_sons_count * v_son_ratio) + 
                    (p_daughters_count * v_daughter_ratio) + 
                    (p_wives_count * v_wife_ratio);
  
  IF v_total_shares = 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    ROUND((p_total_amount * v_son_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_daughter_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_wife_ratio / v_total_shares), 2);
END;
$$;

-- 4. تأمين دالة auto_approve_distribution (Trigger)
CREATE OR REPLACE FUNCTION public.auto_approve_distribution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_approval_count INTEGER;
  v_approved_count INTEGER;
  v_rejected_count INTEGER;
  v_distribution_amount NUMERIC;
BEGIN
  -- فحص الصلاحيات للتوزيعات الكبيرة (أكثر من 50,000)
  SELECT total_amount INTO v_distribution_amount FROM distributions WHERE id = NEW.distribution_id;
  
  IF v_distribution_amount > 50000 AND auth.uid() IS NOT NULL THEN
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin')
    LIMIT 1;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'التوزيعات أكبر من 50,000 ريال تتطلب موافقة الناظر أو المدير';
    END IF;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'موافق'), COUNT(*) FILTER (WHERE status = 'مرفوض')
  INTO v_approval_count, v_approved_count, v_rejected_count
  FROM distribution_approvals WHERE distribution_id = NEW.distribution_id;
  
  IF v_rejected_count > 0 THEN
    UPDATE distributions SET status = 'مرفوض', updated_at = NOW() WHERE id = NEW.distribution_id;
    RETURN NEW;
  END IF;
  
  IF v_approval_count >= 3 AND v_approved_count = 3 THEN
    UPDATE distributions SET status = 'معتمد', updated_at = NOW() WHERE id = NEW.distribution_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. تأمين دالة auto_create_journal_entry_for_payment (Trigger)
CREATE OR REPLACE FUNCTION public.auto_create_journal_entry_for_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
    v_entry_id uuid;
    v_entry_number text;
BEGIN
    -- فحص الصلاحيات للمدفوعات الكبيرة
    IF NEW.amount > 10000 AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'المدفوعات أكبر من 10,000 ريال تتطلب صلاحية مالية';
      END IF;
    END IF;

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
    
    NEW.journal_entry_id := v_entry_id;
    RETURN NEW;
END;
$$;

-- 6. تأمين دالة auto_create_journal_for_voucher (Trigger)
CREATE OR REPLACE FUNCTION public.auto_create_journal_for_voucher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE status = 'active' LIMIT 1;
    
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
$$;

-- 7. تأمين دالة auto_update_account_balance (Trigger)
CREATE OR REPLACE FUNCTION public.auto_update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- فحص للتحديثات الكبيرة
    IF (COALESCE(NEW.debit_amount, 0) > 50000 OR COALESCE(NEW.credit_amount, 0) > 50000) 
       AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'القيود أكبر من 50,000 ريال تتطلب صلاحية محاسبية عليا';
      END IF;
    END IF;

    UPDATE accounts
    SET current_balance = current_balance 
        + COALESCE(NEW.debit_amount, 0) 
        - COALESCE(NEW.credit_amount, 0),
        updated_at = NOW()
    WHERE id = NEW.account_id;
    
    RETURN NEW;
END;
$$;

-- إضافة تعليقات للتوثيق
COMMENT ON FUNCTION auto_create_distribution_approvals IS '🔐 مؤمنة - إنشاء موافقات التوزيع - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION auto_update_distribution_status IS '🔐 مؤمنة - تحديث حالة التوزيع - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION calculate_distribution_shares IS '🔐 مؤمنة - حساب حصص التوزيع - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION auto_approve_distribution IS '🔐 مؤمنة - الموافقة التلقائية - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION auto_create_journal_entry_for_payment IS '🔐 مؤمنة - إنشاء قيد للدفعة - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION auto_create_journal_for_voucher IS '🔐 مؤمنة - إنشاء قيد للسند - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION auto_update_account_balance IS '🔐 مؤمنة - تحديث رصيد الحساب - الفحص الجنائي 2026-01-19';
