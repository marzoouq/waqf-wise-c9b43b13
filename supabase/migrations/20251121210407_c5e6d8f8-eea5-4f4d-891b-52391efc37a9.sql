-- إضافة حقول الحساب التسلسلي إلى جدول إعدادات التوزيع
ALTER TABLE waqf_distribution_settings
ADD COLUMN IF NOT EXISTS maintenance_percentage NUMERIC DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS calculation_order TEXT DEFAULT 'تسلسلي',
ADD COLUMN IF NOT EXISTS reserve_percentage NUMERIC DEFAULT 0.00;

-- إضافة حقول لحفظ المبالغ التسلسلية في جدول التوزيعات
ALTER TABLE distributions
ADD COLUMN IF NOT EXISTS maintenance_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserve_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS calculation_notes TEXT;

-- تحديث التوزيعات القديمة بملاحظة
UPDATE distributions
SET calculation_notes = 'تم الحساب بالطريقة القديمة (قبل التحديث الشرعي)'
WHERE calculation_notes IS NULL;

-- إنشاء جدول لتتبع الاحتياطيات
CREATE TABLE IF NOT EXISTS waqf_reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_type TEXT NOT NULL CHECK (reserve_type IN ('صيانة', 'احتياطي', 'تطوير', 'استثمار')),
  distribution_id UUID REFERENCES distributions(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء جدول لحركات الاحتياطيات
CREATE TABLE IF NOT EXISTS reserve_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id UUID REFERENCES waqf_reserves(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('إضافة', 'صرف')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_number TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إضافة RLS policies للاحتياطيات
ALTER TABLE waqf_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الأدوار المالية يمكنها قراءة الاحتياطيات"
  ON waqf_reserves FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'nazer') OR 
    has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "المحاسبون يمكنهم إضافة احتياطيات"
  ON waqf_reserves FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "الأدوار المالية يمكنها قراءة حركات الاحتياطيات"
  ON reserve_transactions FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'nazer') OR 
    has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "المحاسبون يمكنهم إضافة حركات احتياطيات"
  ON reserve_transactions FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant')
  );