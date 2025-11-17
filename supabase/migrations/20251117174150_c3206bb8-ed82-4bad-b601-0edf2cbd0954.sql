-- إضافة حقول جديدة لجدول distributions
ALTER TABLE distributions
ADD COLUMN IF NOT EXISTS waqf_name TEXT,
ADD COLUMN IF NOT EXISTS sons_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daughters_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wives_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nazer_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS charity_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS corpus_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expenses_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bank_statement_ref TEXT;

-- إنشاء جدول الإفصاح السنوي
CREATE TABLE IF NOT EXISTS annual_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_id UUID REFERENCES fiscal_years(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  waqf_name TEXT NOT NULL,
  disclosure_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- المعلومات المالية
  total_revenues NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_expenses NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_income NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- نسب التوزيع
  nazer_share NUMERIC(15,2) NOT NULL DEFAULT 0,
  nazer_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  charity_share NUMERIC(15,2) NOT NULL DEFAULT 0,
  charity_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  corpus_share NUMERIC(15,2) NOT NULL DEFAULT 0,
  corpus_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- المستفيدون
  total_beneficiaries INTEGER NOT NULL DEFAULT 0,
  sons_count INTEGER NOT NULL DEFAULT 0,
  daughters_count INTEGER NOT NULL DEFAULT 0,
  wives_count INTEGER NOT NULL DEFAULT 0,
  
  -- المصروفات
  maintenance_expenses NUMERIC(15,2) DEFAULT 0,
  administrative_expenses NUMERIC(15,2) DEFAULT 0,
  development_expenses NUMERIC(15,2) DEFAULT 0,
  other_expenses NUMERIC(15,2) DEFAULT 0,
  
  -- كشف الحساب البنكي
  opening_balance NUMERIC(15,2) DEFAULT 0,
  closing_balance NUMERIC(15,2) DEFAULT 0,
  bank_statement_url TEXT,
  
  -- تفاصيل المستفيدين (JSON)
  beneficiaries_details JSONB,
  expenses_breakdown JSONB,
  
  -- حالة الإفصاح
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  
  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- فهرس فريد للسنة
  UNIQUE(year)
);

-- إنشاء جدول تفاصيل الإفصاح للمستفيدين
CREATE TABLE IF NOT EXISTS disclosure_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disclosure_id UUID REFERENCES annual_disclosures(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  beneficiary_name TEXT NOT NULL,
  beneficiary_type TEXT NOT NULL,
  relationship TEXT,
  allocated_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  payments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_annual_disclosures_year ON annual_disclosures(year);
CREATE INDEX IF NOT EXISTS idx_annual_disclosures_status ON annual_disclosures(status);
CREATE INDEX IF NOT EXISTS idx_annual_disclosures_fiscal_year ON annual_disclosures(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_disclosure_beneficiaries_disclosure ON disclosure_beneficiaries(disclosure_id);
CREATE INDEX IF NOT EXISTS idx_disclosure_beneficiaries_beneficiary ON disclosure_beneficiaries(beneficiary_id);

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_annual_disclosure_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_annual_disclosures_updated_at
  BEFORE UPDATE ON annual_disclosures
  FOR EACH ROW
  EXECUTE FUNCTION update_annual_disclosure_timestamp();

-- تفعيل RLS
ALTER TABLE annual_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosure_beneficiaries ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للإفصاحات
CREATE POLICY "الجميع يمكنهم مشاهدة الإفصاحات المنشورة"
  ON annual_disclosures FOR SELECT
  USING (status = 'published' OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('nazer', 'admin', 'accountant')
  ));

CREATE POLICY "الناظر والمشرف يمكنهم إنشاء إفصاحات"
  ON annual_disclosures FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('nazer', 'admin', 'accountant')
  ));

CREATE POLICY "الناظر والمشرف يمكنهم تعديل الإفصاحات"
  ON annual_disclosures FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('nazer', 'admin', 'accountant')
  ));

-- سياسات RLS لتفاصيل المستفيدين
CREATE POLICY "الجميع يمكنهم مشاهدة المستفيدين في الإفصاحات المنشورة"
  ON disclosure_beneficiaries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM annual_disclosures 
    WHERE id = disclosure_beneficiaries.disclosure_id 
    AND (status = 'published' OR auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('nazer', 'admin', 'accountant')
    ))
  ));

CREATE POLICY "الناظر والمشرف يمكنهم إضافة مستفيدين للإفصاح"
  ON disclosure_beneficiaries FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('nazer', 'admin', 'accountant')
  ));

-- دالة لتوليد الإفصاح السنوي تلقائياً
CREATE OR REPLACE FUNCTION generate_annual_disclosure(
  p_year INTEGER,
  p_waqf_name TEXT
) RETURNS UUID AS $$
DECLARE
  v_disclosure_id UUID;
  v_fiscal_year_id UUID;
  v_total_revenues NUMERIC;
  v_total_expenses NUMERIC;
  v_nazer_share NUMERIC;
  v_charity_share NUMERIC;
  v_corpus_share NUMERIC;
  v_beneficiary RECORD;
BEGIN
  -- الحصول على السنة المالية
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE year = p_year
  LIMIT 1;
  
  -- حساب الإجماليات من القيود المحاسبية
  SELECT 
    COALESCE(SUM(CASE WHEN a.account_type = 'revenue' THEN jel.credit_amount - jel.debit_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN a.account_type = 'expense' THEN jel.debit_amount - jel.credit_amount ELSE 0 END), 0)
  INTO v_total_revenues, v_total_expenses
  FROM journal_entry_lines jel
  JOIN accounts a ON a.id = jel.account_id
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE EXTRACT(YEAR FROM je.entry_date) = p_year
    AND je.status = 'posted';
  
  -- حساب حصص التوزيع من التوزيعات
  SELECT 
    COALESCE(SUM(nazer_share), 0),
    COALESCE(SUM(waqif_charity), 0),
    COALESCE(SUM(waqf_corpus), 0)
  INTO v_nazer_share, v_charity_share, v_corpus_share
  FROM distributions
  WHERE EXTRACT(YEAR FROM distribution_date::DATE) = p_year
    AND status = 'معتمد';
  
  -- إنشاء الإفصاح
  INSERT INTO annual_disclosures (
    fiscal_year_id, year, waqf_name,
    total_revenues, total_expenses, net_income,
    nazer_share, charity_share, corpus_share,
    total_beneficiaries, sons_count, daughters_count, wives_count,
    status
  )
  SELECT 
    v_fiscal_year_id, p_year, p_waqf_name,
    v_total_revenues, v_total_expenses, v_total_revenues - v_total_expenses,
    v_nazer_share, v_charity_share, v_corpus_share,
    COUNT(DISTINCT b.id),
    COUNT(DISTINCT CASE WHEN b.beneficiary_type = 'ولد' THEN b.id END),
    COUNT(DISTINCT CASE WHEN b.beneficiary_type = 'بنت' THEN b.id END),
    COUNT(DISTINCT CASE WHEN b.beneficiary_type = 'زوجة' THEN b.id END),
    'draft'
  FROM beneficiaries b
  WHERE b.status = 'نشط'
  RETURNING id INTO v_disclosure_id;
  
  -- إضافة تفاصيل المستفيدين
  FOR v_beneficiary IN
    SELECT 
      b.id, b.full_name, b.beneficiary_type, b.relationship,
      COALESCE(SUM(dd.allocated_amount), 0) as total_allocated,
      COUNT(DISTINCT d.id) as payments_count
    FROM beneficiaries b
    LEFT JOIN distribution_details dd ON dd.beneficiary_id = b.id
    LEFT JOIN distributions d ON d.id = dd.distribution_id 
      AND EXTRACT(YEAR FROM d.distribution_date::DATE) = p_year
      AND d.status = 'معتمد'
    WHERE b.status = 'نشط'
    GROUP BY b.id, b.full_name, b.beneficiary_type, b.relationship
  LOOP
    INSERT INTO disclosure_beneficiaries (
      disclosure_id, beneficiary_id, beneficiary_name,
      beneficiary_type, relationship, allocated_amount, payments_count
    ) VALUES (
      v_disclosure_id, v_beneficiary.id, v_beneficiary.full_name,
      v_beneficiary.beneficiary_type, v_beneficiary.relationship,
      v_beneficiary.total_allocated, v_beneficiary.payments_count
    );
  END LOOP;
  
  RETURN v_disclosure_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;