-- المرحلة الثالثة: المحاسبة المتكاملة
-- إنشاء جداول الحسابات البنكية والتسوية والتدفقات النقدية

-- 1. جدول الحسابات البنكية
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  swift_code TEXT,
  currency TEXT NOT NULL DEFAULT 'SAR',
  current_balance NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_number, bank_name)
);

-- 2. جدول كشوفات البنوك
CREATE TABLE IF NOT EXISTS public.bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  opening_balance NUMERIC NOT NULL,
  closing_balance NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. جدول حركات البنك
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.bank_statements(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL,
  is_matched BOOLEAN NOT NULL DEFAULT false,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. جدول التدفقات النقدية
CREATE TABLE IF NOT EXISTS public.cash_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_id UUID NOT NULL REFERENCES public.fiscal_years(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  operating_activities NUMERIC NOT NULL DEFAULT 0,
  investing_activities NUMERIC NOT NULL DEFAULT 0,
  financing_activities NUMERIC NOT NULL DEFAULT 0,
  net_cash_flow NUMERIC NOT NULL DEFAULT 0,
  opening_cash NUMERIC NOT NULL DEFAULT 0,
  closing_cash NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. تحسين دالة القيود التلقائية
CREATE OR REPLACE FUNCTION public.create_auto_journal_entry(
  p_trigger_event TEXT,
  p_reference_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_transaction_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
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
      
    WHEN 'invoice_issued' THEN
      -- فاتورة: مدين عملاء / دائن مبيعات
      SELECT id INTO v_debit_account FROM accounts WHERE code = '1.2.1' LIMIT 1;
      SELECT id INTO v_credit_account FROM accounts WHERE code = '4.1.3' LIMIT 1;
      
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

-- 6. RLS Policies
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on bank_accounts"
  ON public.bank_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on bank_accounts"
  ON public.bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on bank_accounts"
  ON public.bank_accounts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on bank_statements"
  ON public.bank_statements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on bank_statements"
  ON public.bank_statements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on bank_statements"
  ON public.bank_statements FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on bank_transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on bank_transactions"
  ON public.bank_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on bank_transactions"
  ON public.bank_transactions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on cash_flows"
  ON public.cash_flows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on cash_flows"
  ON public.cash_flows FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on cash_flows"
  ON public.cash_flows FOR UPDATE
  TO authenticated
  USING (true);

-- 7. Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_id ON public.bank_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_bank_account_id ON public.bank_statements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_date ON public.bank_statements(statement_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement_id ON public.bank_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_matched ON public.bank_transactions(is_matched);
CREATE INDEX IF NOT EXISTS idx_cash_flows_fiscal_year ON public.cash_flows(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_cash_flows_period ON public.cash_flows(period_start, period_end);

-- 8. Triggers لتحديث updated_at
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_statements_updated_at
  BEFORE UPDATE ON public.bank_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_flows_updated_at
  BEFORE UPDATE ON public.cash_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. إضافة بيانات أولية للحسابات البنكية (إذا لم تكن موجودة)
INSERT INTO public.accounts (code, name_ar, name_en, account_type, account_nature, is_header, is_active)
VALUES 
  ('1.1.2', 'البنوك', 'Banks', 'asset', 'debit', true, true),
  ('1.1.2.1', 'البنك الأهلي', 'Al Ahli Bank', 'asset', 'debit', false, true),
  ('1.1.2.2', 'بنك الراجحي', 'Al Rajhi Bank', 'asset', 'debit', false, true),
  ('4.1.2', 'إيرادات الإيجارات', 'Rental Income', 'revenue', 'credit', false, true),
  ('5.2.1', 'مصروفات الصيانة', 'Maintenance Expenses', 'expense', 'debit', false, true),
  ('5.3.1', 'مصروفات التوزيع', 'Distribution Expenses', 'expense', 'debit', false, true),
  ('4.1.3', 'إيرادات المبيعات', 'Sales Revenue', 'revenue', 'credit', false, true),
  ('1.2.1', 'العملاء', 'Accounts Receivable', 'asset', 'debit', false, true)
ON CONFLICT (code) DO NOTHING;