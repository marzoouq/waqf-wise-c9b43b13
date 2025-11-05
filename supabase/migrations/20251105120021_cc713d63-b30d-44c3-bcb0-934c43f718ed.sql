-- إنشاء نوع enum لأنواع الحسابات
CREATE TYPE public.account_type AS ENUM (
  'asset',           -- أصول
  'liability',       -- خصوم
  'equity',          -- حقوق ملكية
  'revenue',         -- إيرادات
  'expense'          -- مصروفات
);

-- إنشاء نوع enum لطبيعة الحساب
CREATE TYPE public.account_nature AS ENUM (
  'debit',   -- مدين
  'credit'   -- دائن
);

-- إنشاء نوع enum لحالة القيد
CREATE TYPE public.entry_status AS ENUM (
  'draft',     -- مسودة
  'posted',    -- مرحّل
  'cancelled'  -- ملغى
);

-- جدول شجرة الحسابات
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  parent_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  account_type account_type NOT NULL,
  account_nature account_nature NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_header BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول السنوات المالية
CREATE TABLE public.fiscal_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول القيود المحاسبية
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_number TEXT NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  fiscal_year_id UUID REFERENCES public.fiscal_years(id) ON DELETE RESTRICT NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  status entry_status NOT NULL DEFAULT 'draft',
  posted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول تفاصيل القيود المحاسبية
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT NOT NULL,
  description TEXT,
  debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_debit_or_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0)
  )
);

-- جدول الميزانيات
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fiscal_year_id UUID REFERENCES public.fiscal_years(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT NOT NULL,
  period_type TEXT NOT NULL, -- monthly, quarterly, yearly
  period_number INTEGER,
  budgeted_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  variance_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fiscal_year_id, account_id, period_type, period_number)
);

-- إنشاء الفهارس
CREATE INDEX idx_accounts_parent ON public.accounts(parent_id);
CREATE INDEX idx_accounts_type ON public.accounts(account_type);
CREATE INDEX idx_accounts_code ON public.accounts(code);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON public.journal_entries(status);
CREATE INDEX idx_journal_entries_fiscal_year ON public.journal_entries(fiscal_year_id);
CREATE INDEX idx_journal_entry_lines_entry ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account ON public.journal_entry_lines(account_id);
CREATE INDEX idx_budgets_fiscal_year ON public.budgets(fiscal_year_id);
CREATE INDEX idx_budgets_account ON public.budgets(account_id);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- سياسات RLS - السماح بالقراءة للجميع المصادق عليهم
CREATE POLICY "Allow authenticated read on accounts"
  ON public.accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on fiscal_years"
  ON public.fiscal_years FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on journal_entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on journal_entry_lines"
  ON public.journal_entry_lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read on budgets"
  ON public.budgets FOR SELECT
  TO authenticated
  USING (true);

-- سياسات للإضافة والتعديل (يمكن تخصيصها لاحقاً حسب الصلاحيات)
CREATE POLICY "Allow authenticated insert on accounts"
  ON public.accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on accounts"
  ON public.accounts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on fiscal_years"
  ON public.fiscal_years FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on fiscal_years"
  ON public.fiscal_years FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on journal_entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on journal_entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on journal_entry_lines"
  ON public.journal_entry_lines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on journal_entry_lines"
  ON public.journal_entry_lines FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on budgets"
  ON public.budgets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on budgets"
  ON public.budgets FOR UPDATE
  TO authenticated
  USING (true);

-- دالة لتحديث تاريخ التحديث تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fiscal_years_updated_at
  BEFORE UPDATE ON public.fiscal_years
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إدراج بيانات أولية لشجرة الحسابات الأساسية
INSERT INTO public.accounts (code, name_ar, name_en, account_type, account_nature, is_header) VALUES
-- الأصول
('1', 'الأصول', 'Assets', 'asset', 'debit', true),
('11', 'أصول متداولة', 'Current Assets', 'asset', 'debit', true),
('111', 'النقدية والبنوك', 'Cash and Banks', 'asset', 'debit', false),
('112', 'المدينون', 'Accounts Receivable', 'asset', 'debit', false),
('12', 'أصول ثابتة', 'Fixed Assets', 'asset', 'debit', true),
('121', 'العقارات', 'Real Estate', 'asset', 'debit', false),
('122', 'الأثاث والمعدات', 'Furniture and Equipment', 'asset', 'debit', false),

-- الخصوم
('2', 'الخصوم', 'Liabilities', 'liability', 'credit', true),
('21', 'خصوم متداولة', 'Current Liabilities', 'liability', 'credit', true),
('211', 'الدائنون', 'Accounts Payable', 'liability', 'credit', false),
('212', 'مصروفات مستحقة', 'Accrued Expenses', 'liability', 'credit', false),

-- حقوق الملكية
('3', 'حقوق الملكية', 'Equity', 'equity', 'credit', true),
('31', 'رأس المال', 'Capital', 'equity', 'credit', false),
('32', 'الأرباح المحتجزة', 'Retained Earnings', 'equity', 'credit', false),

-- الإيرادات
('4', 'الإيرادات', 'Revenue', 'revenue', 'credit', true),
('41', 'إيرادات الوقف', 'Waqf Revenue', 'revenue', 'credit', true),
('411', 'إيرادات الإيجارات', 'Rental Income', 'revenue', 'credit', false),
('412', 'إيرادات الاستثمارات', 'Investment Income', 'revenue', 'credit', false),

-- المصروفات
('5', 'المصروفات', 'Expenses', 'expense', 'debit', true),
('51', 'مصروفات إدارية', 'Administrative Expenses', 'expense', 'debit', true),
('511', 'رواتب وأجور', 'Salaries and Wages', 'expense', 'debit', false),
('512', 'مصروفات صيانة', 'Maintenance Expenses', 'expense', 'debit', false),
('52', 'مصروفات الوقف', 'Waqf Expenses', 'expense', 'debit', true),
('521', 'توزيعات على المستفيدين', 'Distributions to Beneficiaries', 'expense', 'debit', false);

-- إدراج سنة مالية افتراضية
INSERT INTO public.fiscal_years (name, start_date, end_date, is_active) VALUES
('السنة المالية 2024', '2024-01-01', '2024-12-31', true);