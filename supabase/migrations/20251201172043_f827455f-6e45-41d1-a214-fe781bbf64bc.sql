-- إنشاء جدول الفواتير التاريخية
CREATE TABLE historical_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_tax_id TEXT,
  invoice_date DATE NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  description TEXT,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  document_path TEXT,
  fiscal_year_id UUID REFERENCES fiscal_years(id) ON DELETE CASCADE,
  is_historical BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_historical_invoices_fiscal_year ON historical_invoices(fiscal_year_id);
CREATE INDEX idx_historical_invoices_date ON historical_invoices(invoice_date);

-- إنشاء جدول الأرصدة الافتتاحية
CREATE TABLE opening_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_id UUID REFERENCES fiscal_years(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  opening_balance NUMERIC DEFAULT 0,
  closing_balance NUMERIC DEFAULT 0,
  balance_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fiscal_year_id, account_id)
);

CREATE INDEX idx_opening_balances_fiscal_year ON opening_balances(fiscal_year_id);

-- إنشاء جدول توزيعات الورثة
CREATE TABLE heir_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_id UUID REFERENCES fiscal_years(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  heir_type TEXT NOT NULL CHECK (heir_type IN ('ابن', 'ابنة', 'زوجة')),
  share_amount NUMERIC NOT NULL DEFAULT 0,
  distribution_date DATE NOT NULL,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  is_historical BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_heir_distributions_fiscal_year ON heir_distributions(fiscal_year_id);
CREATE INDEX idx_heir_distributions_beneficiary ON heir_distributions(beneficiary_id);

-- RLS
ALTER TABLE historical_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE heir_distributions ENABLE ROW LEVEL SECURITY;