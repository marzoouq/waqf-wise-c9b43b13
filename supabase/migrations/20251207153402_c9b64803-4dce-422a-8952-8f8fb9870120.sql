
-- =============================================
-- المرحلة 1: إنشاء جدول المستأجرين
-- =============================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_number VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  id_type VARCHAR(50) DEFAULT 'national_id',
  id_number VARCHAR(50) NOT NULL,
  tax_number VARCHAR(50),
  commercial_register VARCHAR(50),
  national_address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  address TEXT,
  tenant_type VARCHAR(50) DEFAULT 'individual',
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- المرحلة 2: إنشاء سجل حساب المستأجر
-- =============================================
CREATE TABLE IF NOT EXISTS public.tenant_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type VARCHAR(50) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  reference_number VARCHAR(100),
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) DEFAULT 0,
  property_id UUID REFERENCES public.properties(id),
  contract_id UUID REFERENCES public.contracts(id),
  fiscal_year_id UUID REFERENCES public.fiscal_years(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- =============================================
-- المرحلة 3: إضافة حسابات الذمم المدينة
-- =============================================
INSERT INTO public.accounts (code, name_ar, name_en, account_type, account_nature, is_header, parent_id, is_active)
SELECT '1.2', 'الذمم المدينة', 'Accounts Receivable', 'asset', 'debit', true, 
  (SELECT id FROM public.accounts WHERE code = '1'),
  true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '1.2');

INSERT INTO public.accounts (code, name_ar, name_en, account_type, account_nature, is_header, parent_id, is_active)
SELECT '1.2.1', 'ذمم المستأجرين', 'Tenants Receivable', 'asset', 'debit', false, 
  (SELECT id FROM public.accounts WHERE code = '1.2'),
  true
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE code = '1.2.1');

-- =============================================
-- المرحلة 4: تعديل جدول العقود
-- =============================================
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- =============================================
-- المرحلة 5: تعديل جدول الفواتير
-- =============================================
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS customer_national_address TEXT,
ADD COLUMN IF NOT EXISTS customer_tax_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_commercial_register VARCHAR(50);

-- =============================================
-- المرحلة 6: الفهارس
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tenants_id_number ON public.tenants(id_number);
CREATE INDEX IF NOT EXISTS idx_tenants_tax_number ON public.tenants(tax_number);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_ledger_tenant_id ON public.tenant_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_ledger_transaction_date ON public.tenant_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON public.invoices(tenant_id);

-- =============================================
-- المرحلة 7: RLS
-- =============================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view tenants" ON public.tenants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier'))
  );

CREATE POLICY "Staff can insert tenants" ON public.tenants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'nazer', 'accountant'))
  );

CREATE POLICY "Staff can update tenants" ON public.tenants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'nazer', 'accountant'))
  );

CREATE POLICY "Staff can delete tenants" ON public.tenants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'nazer'))
  );

CREATE POLICY "Staff can view tenant ledger" ON public.tenant_ledger
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'nazer', 'accountant', 'cashier'))
  );

CREATE POLICY "Staff can insert tenant ledger" ON public.tenant_ledger
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'nazer', 'accountant'))
  );

-- =============================================
-- المرحلة 8: دوال مساعدة
-- =============================================
CREATE OR REPLACE FUNCTION public.calculate_tenant_balance(p_tenant_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0)
  INTO v_balance
  FROM public.tenant_ledger
  WHERE tenant_id = p_tenant_id;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_tenant_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_running_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0)
  INTO v_running_balance
  FROM public.tenant_ledger
  WHERE tenant_id = NEW.tenant_id
  AND (transaction_date < NEW.transaction_date 
       OR (transaction_date = NEW.transaction_date AND created_at < NEW.created_at));
  
  NEW.balance := v_running_balance + NEW.debit_amount - NEW.credit_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tenant_ledger_balance ON public.tenant_ledger;
CREATE TRIGGER trigger_update_tenant_ledger_balance
  BEFORE INSERT ON public.tenant_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tenant_ledger_balance();

CREATE OR REPLACE FUNCTION public.generate_tenant_number()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_year TEXT;
BEGIN
  IF NEW.tenant_number IS NULL THEN
    v_year := TO_CHAR(CURRENT_DATE, 'YY');
    SELECT COUNT(*) + 1 INTO v_count FROM public.tenants;
    NEW.tenant_number := 'T' || v_year || LPAD(v_count::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_tenant_number ON public.tenants;
CREATE TRIGGER trigger_generate_tenant_number
  BEFORE INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_tenant_number();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_ledger;
