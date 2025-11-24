-- جدول جدولة المدفوعات (Payment Schedules)
CREATE TABLE IF NOT EXISTS payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_amount NUMERIC NOT NULL CHECK (scheduled_amount > 0),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'failed', 'cancelled')),
  batch_number TEXT,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_payment_schedules_distribution ON payment_schedules(distribution_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_date ON payment_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules(status);

-- تفعيل RLS
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "الأدوار المالية يمكنها قراءة جدولة المدفوعات"
  ON payment_schedules FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role IN ('admin', 'nazer', 'accountant', 'cashier')
    )
  );

CREATE POLICY "المحاسبون يمكنهم إضافة جدولة المدفوعات"
  ON payment_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role IN ('admin', 'accountant')
    )
  );

CREATE POLICY "المحاسبون يمكنهم تحديث جدولة المدفوعات"
  ON payment_schedules FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role IN ('admin', 'accountant', 'cashier')
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER update_payment_schedules_updated_at
  BEFORE UPDATE ON payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تعليق على الجدول
COMMENT ON TABLE payment_schedules IS 'جدول جدولة المدفوعات - لتقسيم التوزيعات إلى دفعات مجدولة';
