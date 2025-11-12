-- المرحلة 1: إضافة journal_entry_id لجدول distributions
ALTER TABLE distributions 
ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES journal_entries(id);

-- إنشاء جدول موافقات التوزيعات
CREATE TABLE IF NOT EXISTS distribution_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
  level INTEGER NOT NULL, -- 1: محاسب, 2: مدير مالي, 3: ناظر
  approver_id UUID REFERENCES auth.users(id),
  approver_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'معلق', -- معلق، موافق، مرفوض
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index للأداء
CREATE INDEX IF NOT EXISTS idx_distribution_approvals_dist 
ON distribution_approvals(distribution_id);

CREATE INDEX IF NOT EXISTS idx_distribution_approvals_status 
ON distribution_approvals(status);

-- RLS Policies
ALTER TABLE distribution_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view approvals"
ON distribution_approvals FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage approvals"
ON distribution_approvals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- المرحلة 3: Trigger لتحديث أرصدة الحسابات تلقائياً
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- عند إنشاء سطر قيد جديد
  IF TG_OP = 'INSERT' THEN
    -- تحديث الحساب المدين
    IF NEW.debit_amount > 0 THEN
      UPDATE accounts 
      SET current_balance = COALESCE(current_balance, 0) + NEW.debit_amount
      WHERE id = NEW.account_id;
    END IF;
    
    -- تحديث الحساب الدائن
    IF NEW.credit_amount > 0 THEN
      UPDATE accounts 
      SET current_balance = COALESCE(current_balance, 0) - NEW.credit_amount
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_account_balance ON journal_entry_lines;
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- Trigger لتحديث حالة التوزيع عند اكتمال الموافقات
CREATE OR REPLACE FUNCTION check_distribution_approvals()
RETURNS TRIGGER AS $$
DECLARE
  v_all_approved BOOLEAN;
  v_distribution_id UUID;
  v_any_rejected BOOLEAN;
BEGIN
  v_distribution_id := NEW.distribution_id;
  
  -- التحقق من وجود رفض
  SELECT EXISTS(
    SELECT 1 FROM distribution_approvals
    WHERE distribution_id = v_distribution_id AND status = 'مرفوض'
  ) INTO v_any_rejected;
  
  IF v_any_rejected THEN
    UPDATE distributions
    SET status = 'مرفوض'
    WHERE id = v_distribution_id;
    RETURN NEW;
  END IF;
  
  -- التحقق من اكتمال جميع الموافقات (3 مستويات)
  SELECT COUNT(*) = 3 AND COUNT(*) FILTER (WHERE status = 'موافق') = 3
  INTO v_all_approved
  FROM distribution_approvals
  WHERE distribution_id = v_distribution_id;
  
  -- تحديث حالة التوزيع
  IF v_all_approved THEN
    UPDATE distributions
    SET status = 'معتمد'
    WHERE id = v_distribution_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_check_approvals ON distribution_approvals;
CREATE TRIGGER trigger_check_approvals
AFTER INSERT OR UPDATE ON distribution_approvals
FOR EACH ROW
EXECUTE FUNCTION check_distribution_approvals();

-- المرحلة 4: تحسين دالة create_auto_journal_entry
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
SET search_path = public
AS $$
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
      
    WHEN 'distribution_approved' THEN
      -- توزيع معتمد: مدين مصروف توزيع / دائن نقدية
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
      
    WHEN 'rental_payment_received' THEN
      -- دفعة إيجار مستلمة: مدين نقدية / دائن إيرادات إيجار
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.2' LIMIT 1;
      
    WHEN 'maintenance_completed' THEN
      -- صيانة مكتملة: مدين مصروف صيانة / دائن نقدية
      SELECT id INTO v_debit_account FROM accounts WHERE code = '5.2.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '1.1.1' LIMIT 1;
      
    WHEN 'general_payment' THEN
      -- دفعة عامة
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
$$;