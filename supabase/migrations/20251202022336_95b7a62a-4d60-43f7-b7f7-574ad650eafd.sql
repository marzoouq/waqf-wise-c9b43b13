-- المرحلة الأولى: تحديث قاعدة البيانات (مصحح)

-- 1. إضافة حساب الزكاة في شجرة الحسابات
INSERT INTO accounts (code, name_ar, name_en, account_type, account_nature, parent_id, is_header, is_active, description)
SELECT '5.4.5', 'الزكاة', 'Zakat', 'expense', 'debit', 
       (SELECT id FROM accounts WHERE code = '5.4' LIMIT 1),
       false, true, 'حساب الزكاة المستحقة على الوقف'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE code = '5.4.5');

-- 2. إنشاء جدول fiscal_year_closings لتسجيل عمليات الإقفال الشاملة
CREATE TABLE IF NOT EXISTS fiscal_year_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  closing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closing_type TEXT NOT NULL CHECK (closing_type IN ('manual', 'automatic')),
  
  -- الإيرادات
  total_revenues NUMERIC(15,2) NOT NULL DEFAULT 0,
  rental_revenues NUMERIC(15,2) DEFAULT 0,
  other_revenues NUMERIC(15,2) DEFAULT 0,
  
  -- المصروفات
  total_expenses NUMERIC(15,2) NOT NULL DEFAULT 0,
  administrative_expenses NUMERIC(15,2) DEFAULT 0,
  maintenance_expenses NUMERIC(15,2) DEFAULT 0,
  development_expenses NUMERIC(15,2) DEFAULT 0,
  other_expenses NUMERIC(15,2) DEFAULT 0,
  
  -- الحصص والاستقطاعات
  nazer_percentage NUMERIC(5,2) DEFAULT 10,
  nazer_share NUMERIC(15,2) DEFAULT 0,
  waqif_percentage NUMERIC(5,2) DEFAULT 5,
  waqif_share NUMERIC(15,2) DEFAULT 0,
  
  -- توزيعات المستفيدين
  total_beneficiary_distributions NUMERIC(15,2) DEFAULT 0,
  heirs_count INTEGER DEFAULT 0,
  
  -- الضرائب والزكاة
  total_vat_collected NUMERIC(15,2) DEFAULT 0,
  total_vat_paid NUMERIC(15,2) DEFAULT 0,
  net_vat NUMERIC(15,2) DEFAULT 0,
  zakat_amount NUMERIC(15,2) DEFAULT 0,
  
  -- رقبة الوقف (الفائض)
  net_income NUMERIC(15,2) NOT NULL DEFAULT 0,
  waqf_corpus NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- الأرصدة
  opening_balance NUMERIC(15,2) DEFAULT 0,
  closing_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- قيد الإقفال
  closing_journal_entry_id UUID REFERENCES journal_entries(id),
  
  -- البيانات التفصيلية (JSON)
  heir_distributions JSONB,
  expense_breakdown JSONB,
  revenue_breakdown JSONB,
  
  -- معلومات الإقفال
  closed_by UUID,
  closed_by_name TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_fiscal_year_closing UNIQUE(fiscal_year_id)
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_fiscal_year_closings_fiscal_year ON fiscal_year_closings(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_year_closings_date ON fiscal_year_closings(closing_date);

-- 3. إضافة عمود fiscal_year_id لجدول waqf_reserves
ALTER TABLE waqf_reserves 
ADD COLUMN IF NOT EXISTS fiscal_year_id UUID REFERENCES fiscal_years(id);

CREATE INDEX IF NOT EXISTS idx_waqf_reserves_fiscal_year ON waqf_reserves(fiscal_year_id);

-- 4. Trigger لحماية السنوات المغلقة من التعديل
CREATE OR REPLACE FUNCTION protect_closed_fiscal_years()
RETURNS TRIGGER AS $$
DECLARE
  v_is_closed BOOLEAN;
  v_fiscal_year_name TEXT;
BEGIN
  -- التحقق من حالة السنة المالية
  SELECT is_closed, name INTO v_is_closed, v_fiscal_year_name
  FROM fiscal_years
  WHERE id = NEW.fiscal_year_id;
  
  IF v_is_closed = true THEN
    RAISE EXCEPTION 'لا يمكن إضافة أو تعديل بيانات في السنة المالية المغلقة: %', v_fiscal_year_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- تطبيق الحماية على جدول journal_entries فقط
DROP TRIGGER IF EXISTS protect_journal_entries_closed_years ON journal_entries;
CREATE TRIGGER protect_journal_entries_closed_years
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION protect_closed_fiscal_years();

-- 5. Function لحساب ملخص السنة المالية
CREATE OR REPLACE FUNCTION calculate_fiscal_year_summary(p_fiscal_year_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- الحصول على تواريخ السنة المالية
  SELECT start_date, end_date INTO v_start_date, v_end_date
  FROM fiscal_years WHERE id = p_fiscal_year_id;
  
  SELECT jsonb_build_object(
    'total_revenues', COALESCE((
      SELECT SUM(jel.credit_amount)
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      INNER JOIN accounts a ON jel.account_id = a.id
      WHERE je.fiscal_year_id = p_fiscal_year_id
        AND je.status = 'posted'
        AND a.account_type = 'revenue'
    ), 0),
    
    'total_expenses', COALESCE((
      SELECT SUM(jel.debit_amount)
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      INNER JOIN accounts a ON jel.account_id = a.id
      WHERE je.fiscal_year_id = p_fiscal_year_id
        AND je.status = 'posted'
        AND a.account_type = 'expense'
    ), 0),
    
    'vat_collected', COALESCE((
      SELECT SUM(jel.credit_amount)
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
      INNER JOIN accounts a ON jel.account_id = a.id
      WHERE je.fiscal_year_id = p_fiscal_year_id
        AND je.status = 'posted'
        AND a.code LIKE '2.1.3%'
    ), 0),
    
    'beneficiary_distributions', COALESCE((
      SELECT SUM(allocated_amount)
      FROM distribution_details dd
      INNER JOIN distributions d ON dd.distribution_id = d.id
      INNER JOIN fiscal_years fy ON d.distribution_date BETWEEN fy.start_date AND fy.end_date
      WHERE fy.id = p_fiscal_year_id
        AND d.status = 'معتمد'
    ), 0)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 6. إضافة تعليقات للتوضيح
COMMENT ON TABLE fiscal_year_closings IS 'جدول لتسجيل عمليات إقفال السنوات المالية بكافة التفاصيل';
COMMENT ON COLUMN fiscal_year_closings.closing_type IS 'نوع الإقفال: يدوي أو تلقائي';
COMMENT ON COLUMN fiscal_year_closings.waqf_corpus IS 'رقبة الوقف (الفائض المرحل للاحتياطي)';
COMMENT ON FUNCTION protect_closed_fiscal_years IS 'دالة لحماية السنوات المالية المغلقة من التعديل';