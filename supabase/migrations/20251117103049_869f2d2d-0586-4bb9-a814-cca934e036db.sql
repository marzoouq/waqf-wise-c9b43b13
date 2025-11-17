-- جدول إعدادات التوزيع
CREATE TABLE IF NOT EXISTS waqf_distribution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waqf_unit_id UUID REFERENCES waqf_units(id) ON DELETE CASCADE,
  
  -- تكرار التوزيع
  distribution_frequency TEXT CHECK (distribution_frequency IN (
    'شهري',
    'ربع_سنوي',
    'نصف_سنوي',
    'سنوي'
  )) DEFAULT 'شهري',
  
  -- الشهور المحددة للتوزيع
  distribution_months INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  
  -- هل التوزيع تلقائي؟
  auto_distribution BOOLEAN DEFAULT false,
  
  -- يوم التوزيع في الشهر
  distribution_day_of_month INTEGER DEFAULT 1,
  
  -- نسب الاستقطاعات (من صافي الإيرادات بعد المصروفات)
  nazer_percentage NUMERIC(5,2) DEFAULT 10.00,  -- حصة الناظر
  waqif_charity_percentage NUMERIC(5,2) DEFAULT 5.00,  -- صدقة الواقف
  waqf_corpus_percentage NUMERIC(5,2) DEFAULT 0.00,  -- رقبة الوقف (متغيرة)
  
  -- قاعدة التوزيع للمستفيدين
  distribution_rule TEXT CHECK (distribution_rule IN (
    'شرعي',  -- للذكر مثل حظ الأنثيين + الزوجة ثمن
    'متساوي',
    'مخصص'
  )) DEFAULT 'شرعي',
  
  -- نسبة الزوجات (ثمن = 12.5%)
  wives_share_ratio NUMERIC(5,2) DEFAULT 12.50,
  
  -- تفعيل الإشعارات
  notify_beneficiaries BOOLEAN DEFAULT true,
  notify_nazer BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تفاصيل التوزيع لكل مستفيد
CREATE TABLE IF NOT EXISTS distribution_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id),
  
  -- تصنيف المستفيد
  beneficiary_type TEXT CHECK (beneficiary_type IN (
    'واقف',
    'ولد',
    'بنت',
    'زوجة',
    'حفيد',
    'ناظر',
    'أخرى'
  )),
  
  -- المبالغ
  allocated_amount NUMERIC(10,2) NOT NULL DEFAULT 0,  -- المبلغ المخصص
  
  -- معلومات الدفع
  payment_status TEXT DEFAULT 'معلق' CHECK (payment_status IN ('معلق', 'مدفوع', 'ملغي')),
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إضافة حقول للتوزيعات
ALTER TABLE distributions 
ADD COLUMN IF NOT EXISTS distribution_type TEXT CHECK (distribution_type IN (
  'شهري', 'ربع_سنوي', 'نصف_سنوي', 'سنوي'
)) DEFAULT 'شهري',
ADD COLUMN IF NOT EXISTS period_start DATE,
ADD COLUMN IF NOT EXISTS period_end DATE,
ADD COLUMN IF NOT EXISTS total_revenues NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_expenses NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_revenues NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS nazer_share NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS waqif_charity NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS waqf_corpus NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS distributable_amount NUMERIC(12,2) DEFAULT 0;

-- إضافة حقل beneficiary_type للمستفيدين
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS beneficiary_type TEXT 
CHECK (beneficiary_type IN ('واقف', 'ولد', 'بنت', 'زوجة', 'حفيد', 'أخرى'));

-- تحديث البيانات الموجودة
UPDATE beneficiaries 
SET beneficiary_type = CASE
  WHEN relationship = 'رب الأسرة' THEN 'واقف'
  WHEN relationship = 'زوجة' THEN 'زوجة'
  WHEN gender = 'ذكر' AND (relationship = 'ابن' OR relationship IS NULL) THEN 'ولد'
  WHEN gender = 'أنثى' AND (relationship = 'ابنة' OR relationship IS NULL) THEN 'بنت'
  ELSE 'أخرى'
END
WHERE beneficiary_type IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_distribution_settings_waqf_unit ON waqf_distribution_settings(waqf_unit_id);
CREATE INDEX IF NOT EXISTS idx_distribution_details_distribution ON distribution_details(distribution_id);
CREATE INDEX IF NOT EXISTS idx_distribution_details_beneficiary ON distribution_details(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_distributions_type ON distributions(distribution_type);
CREATE INDEX IF NOT EXISTS idx_distributions_period ON distributions(period_start, period_end);

-- RLS Policies
ALTER TABLE waqf_distribution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة إعدادات التوزيع"
ON waqf_distribution_settings FOR SELECT
USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة إعدادات التوزيع"
ON waqf_distribution_settings FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "الجميع يمكنهم قراءة تفاصيل التوزيع"
ON distribution_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE beneficiaries.id = distribution_details.beneficiary_id 
    AND beneficiaries.user_id = auth.uid()
  ) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "المسؤولون يمكنهم إدارة تفاصيل التوزيع"
ON distribution_details FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);