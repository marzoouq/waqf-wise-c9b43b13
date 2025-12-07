
-- =====================================================
-- نظام نقطة البيع المتكامل - POS System
-- =====================================================

-- تسلسل لترقيم العمليات
CREATE SEQUENCE IF NOT EXISTS pos_transaction_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cashier_shift_seq START 1;

-- جدول ورديات أمين الصندوق
CREATE TABLE IF NOT EXISTS cashier_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_number TEXT UNIQUE NOT NULL,
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  cashier_name TEXT,
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(12,2),
  expected_balance NUMERIC(12,2),
  variance NUMERIC(12,2) DEFAULT 0,
  total_collections NUMERIC(12,2) DEFAULT 0,
  total_payments NUMERIC(12,2) DEFAULT 0,
  transactions_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'مفتوحة' CHECK (status IN ('مفتوحة', 'مغلقة', 'معلقة')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول عمليات نقطة البيع
CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL,
  shift_id UUID NOT NULL REFERENCES cashier_shifts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('تحصيل', 'صرف', 'تعديل')),
  rental_payment_id UUID REFERENCES rental_payments(id),
  contract_id UUID REFERENCES contracts(id),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  amount NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  net_amount NUMERIC(12,2),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('نقدي', 'شبكة', 'تحويل', 'شيك')),
  reference_number TEXT,
  payer_name TEXT,
  expense_category TEXT,
  description TEXT,
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  journal_entry_id UUID REFERENCES journal_entries(id),
  receipt_printed BOOLEAN DEFAULT false,
  voided BOOLEAN DEFAULT false,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES profiles(id),
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_cashier_shifts_status ON cashier_shifts(status);
CREATE INDEX IF NOT EXISTS idx_cashier_shifts_cashier ON cashier_shifts(cashier_id);
CREATE INDEX IF NOT EXISTS idx_cashier_shifts_date ON cashier_shifts(opened_at);
CREATE INDEX IF NOT EXISTS idx_pos_trans_shift ON pos_transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_pos_trans_type ON pos_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_pos_trans_date ON pos_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_trans_rental ON pos_transactions(rental_payment_id);

-- تفعيل RLS
ALTER TABLE cashier_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول للورديات
CREATE POLICY "pos_shifts_select" ON cashier_shifts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'accountant', 'cashier', 'admin')
  )
);

CREATE POLICY "pos_shifts_insert" ON cashier_shifts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'accountant', 'cashier', 'admin')
  )
);

CREATE POLICY "pos_shifts_update" ON cashier_shifts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'accountant', 'cashier', 'admin')
  )
);

-- سياسات الوصول للعمليات
CREATE POLICY "pos_trans_select" ON pos_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'accountant', 'cashier', 'admin')
  )
);

CREATE POLICY "pos_trans_insert" ON pos_transactions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'accountant', 'cashier', 'admin')
  )
);

CREATE POLICY "pos_trans_update" ON pos_transactions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'accountant', 'cashier', 'admin')
  )
);

-- دالة توليد رقم الوردية
CREATE OR REPLACE FUNCTION generate_shift_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM cashier_shifts 
  WHERE DATE(opened_at) = CURRENT_DATE;
  
  RETURN 'SH-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_count::TEXT, 3, '0');
END;
$$;

-- دالة توليد رقم عملية POS
CREATE OR REPLACE FUNCTION generate_pos_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'POS-' || TO_CHAR(now(), 'YYYYMMDD-HH24MISS') || '-' || LPAD(nextval('pos_transaction_seq')::TEXT, 4, '0');
END;
$$;

-- Trigger لتحديث إحصائيات الوردية عند إضافة عملية
CREATE OR REPLACE FUNCTION update_shift_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.voided = false THEN
    UPDATE cashier_shifts
    SET 
      total_collections = total_collections + CASE WHEN NEW.transaction_type = 'تحصيل' THEN NEW.amount ELSE 0 END,
      total_payments = total_payments + CASE WHEN NEW.transaction_type = 'صرف' THEN NEW.amount ELSE 0 END,
      transactions_count = transactions_count + 1,
      expected_balance = opening_balance + total_collections - total_payments + 
        CASE WHEN NEW.transaction_type = 'تحصيل' THEN NEW.amount ELSE -NEW.amount END,
      updated_at = now()
    WHERE id = NEW.shift_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_shift_stats
AFTER INSERT ON pos_transactions
FOR EACH ROW EXECUTE FUNCTION update_shift_stats();

-- Trigger لتحديث updated_at
CREATE TRIGGER update_cashier_shifts_updated_at
BEFORE UPDATE ON cashier_shifts
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- تفعيل Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cashier_shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_transactions;
