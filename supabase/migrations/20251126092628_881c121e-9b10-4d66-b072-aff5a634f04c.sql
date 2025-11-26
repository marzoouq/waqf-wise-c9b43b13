-- المرحلة الثالثة والرابعة: استكمال البنية التحتية للمحاسبة والتوزيعات

-- =============================================
-- المرحلة الثالثة: تحسينات المحاسبة
-- =============================================

-- إضافة حقول مفقودة لجدول القيود
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS entry_type VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS posted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- إضافة حقول لربط القيود بالتوزيعات
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS distribution_id UUID REFERENCES distributions(id) ON DELETE SET NULL;

-- تحديث جدول الموازنات لدعم فترات متعددة
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS period_start_date DATE,
ADD COLUMN IF NOT EXISTS period_end_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =============================================
-- المرحلة الرابعة: نظام التوزيعات المتقدم
-- =============================================

-- جدول محاكاة التوزيعات (Simulation)
CREATE TABLE IF NOT EXISTS distribution_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_name VARCHAR(255) NOT NULL,
  fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
  total_amount DECIMAL(15,2) NOT NULL,
  simulation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- الاستقطاعات
  nazer_percentage DECIMAL(5,2) DEFAULT 0,
  nazer_amount DECIMAL(15,2) DEFAULT 0,
  reserve_percentage DECIMAL(5,2) DEFAULT 0,
  reserve_amount DECIMAL(15,2) DEFAULT 0,
  development_percentage DECIMAL(5,2) DEFAULT 0,
  development_amount DECIMAL(15,2) DEFAULT 0,
  maintenance_percentage DECIMAL(5,2) DEFAULT 0,
  maintenance_amount DECIMAL(15,2) DEFAULT 0,
  investment_percentage DECIMAL(5,2) DEFAULT 0,
  investment_amount DECIMAL(15,2) DEFAULT 0,
  
  -- المبلغ القابل للتوزيع
  distributable_amount DECIMAL(15,2) NOT NULL,
  
  -- عدد المستفيدين
  total_beneficiaries INTEGER DEFAULT 0,
  sons_count INTEGER DEFAULT 0,
  daughters_count INTEGER DEFAULT 0,
  wives_count INTEGER DEFAULT 0,
  
  -- الحصص
  son_share DECIMAL(15,2) DEFAULT 0,
  daughter_share DECIMAL(15,2) DEFAULT 0,
  wife_share DECIMAL(15,2) DEFAULT 0,
  
  status VARCHAR(50) DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تفاصيل محاكاة التوزيع للمستفيدين
CREATE TABLE IF NOT EXISTS simulation_beneficiary_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID REFERENCES distribution_simulations(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  beneficiary_type VARCHAR(50),
  calculated_share DECIMAL(15,2) NOT NULL,
  adjustments DECIMAL(15,2) DEFAULT 0,
  final_amount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تحديث جدول التوزيعات
ALTER TABLE distributions
ADD COLUMN IF NOT EXISTS simulation_id UUID REFERENCES distribution_simulations(id),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'bank_transfer',
ADD COLUMN IF NOT EXISTS bank_transfer_file_id UUID,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS executed_by UUID,
ADD COLUMN IF NOT EXISTS executed_at TIMESTAMP WITH TIME ZONE;

-- جدول سندات الصرف (Payment Vouchers)
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number VARCHAR(100) UNIQUE NOT NULL,
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  
  -- معلومات البنك
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  iban VARCHAR(50),
  
  -- الحالة
  status VARCHAR(50) DEFAULT 'pending',
  printed BOOLEAN DEFAULT false,
  printed_at TIMESTAMP WITH TIME ZONE,
  printed_by UUID,
  
  -- المعلومات المحاسبية
  journal_entry_id UUID REFERENCES journal_entries(id),
  
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تقارير التوزيع
CREATE TABLE IF NOT EXISTS distribution_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID,
  file_path TEXT
);

-- =============================================
-- Functions & Triggers
-- =============================================

-- Function: حساب التوزيع التلقائي
CREATE OR REPLACE FUNCTION calculate_distribution_shares(
  p_total_amount DECIMAL,
  p_sons_count INTEGER,
  p_daughters_count INTEGER,
  p_wives_count INTEGER
) RETURNS TABLE (
  son_share DECIMAL,
  daughter_share DECIMAL,
  wife_share DECIMAL
) AS $$
DECLARE
  v_total_shares DECIMAL;
  v_son_ratio DECIMAL := 2.0;
  v_daughter_ratio DECIMAL := 1.0;
  v_wife_ratio DECIMAL := 1.0;
BEGIN
  -- حساب مجموع الحصص (الابن = 2، البنت = 1، الزوجة = 1)
  v_total_shares := (p_sons_count * v_son_ratio) + 
                    (p_daughters_count * v_daughter_ratio) + 
                    (p_wives_count * v_wife_ratio);
  
  -- تجنب القسمة على صفر
  IF v_total_shares = 0 THEN
    RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- حساب حصة كل فئة
  RETURN QUERY SELECT 
    ROUND((p_total_amount * v_son_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_daughter_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_wife_ratio / v_total_shares), 2);
END;
$$ LANGUAGE plpgsql;

-- Function: إنشاء قيد محاسبي تلقائي للتوزيع
CREATE OR REPLACE FUNCTION auto_create_distribution_journal_entry(
  p_distribution_id UUID
) RETURNS UUID AS $$
DECLARE
  v_distribution RECORD;
  v_fiscal_year_id UUID;
  v_entry_id UUID;
  v_entry_number VARCHAR;
BEGIN
  -- جلب بيانات التوزيع
  SELECT * INTO v_distribution FROM distributions WHERE id = p_distribution_id;
  
  IF v_distribution IS NULL THEN
    RAISE EXCEPTION 'Distribution not found';
  END IF;
  
  -- جلب السنة المالية النشطة
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No active fiscal year found';
  END IF;
  
  -- إنشاء رقم القيد
  v_entry_number := 'JE-DIST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(p_distribution_id::TEXT, 1, 8);
  
  -- إنشاء القيد المحاسبي
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    fiscal_year_id,
    description,
    entry_type,
    reference_type,
    reference_id,
    status,
    distribution_id
  ) VALUES (
    v_entry_number,
    v_distribution.distribution_date,
    v_fiscal_year_id,
    'قيد توزيع - ' || v_distribution.distribution_name,
    'auto',
    'distribution',
    p_distribution_id,
    'draft',
    p_distribution_id
  ) RETURNING id INTO v_entry_id;
  
  -- تحديث التوزيع بربط القيد
  UPDATE distributions SET journal_entry_id = v_entry_id WHERE id = p_distribution_id;
  
  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: تحديث timestamps
CREATE OR REPLACE FUNCTION update_distribution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_distribution_simulations_timestamp ON distribution_simulations;
CREATE TRIGGER update_distribution_simulations_timestamp
  BEFORE UPDATE ON distribution_simulations
  FOR EACH ROW EXECUTE FUNCTION update_distribution_timestamp();

DROP TRIGGER IF EXISTS update_payment_vouchers_timestamp ON payment_vouchers;
CREATE TRIGGER update_payment_vouchers_timestamp
  BEFORE UPDATE ON payment_vouchers
  FOR EACH ROW EXECUTE FUNCTION update_distribution_timestamp();

-- =============================================
-- Indexes للأداء
-- =============================================

CREATE INDEX IF NOT EXISTS idx_distribution_simulations_status ON distribution_simulations(status);
CREATE INDEX IF NOT EXISTS idx_distribution_simulations_fund ON distribution_simulations(fund_id);
CREATE INDEX IF NOT EXISTS idx_simulation_beneficiary_details_simulation ON simulation_beneficiary_details(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_beneficiary_details_beneficiary ON simulation_beneficiary_details(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_distribution ON payment_vouchers(distribution_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_beneficiary ON payment_vouchers(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_voucher_number ON payment_vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_distribution_reports_distribution ON distribution_reports(distribution_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_distribution ON journal_entries(distribution_id);

-- =============================================
-- RLS Policies
-- =============================================

-- Distribution Simulations
ALTER TABLE distribution_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON distribution_simulations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON distribution_simulations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON distribution_simulations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON distribution_simulations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Simulation Beneficiary Details
ALTER TABLE simulation_beneficiary_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON simulation_beneficiary_details
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON simulation_beneficiary_details
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON simulation_beneficiary_details
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON simulation_beneficiary_details
  FOR DELETE USING (auth.role() = 'authenticated');

-- Payment Vouchers
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON payment_vouchers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON payment_vouchers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON payment_vouchers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON payment_vouchers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Distribution Reports
ALTER TABLE distribution_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON distribution_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON distribution_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');