-- المرحلة 6: إدارة العقود والإيجارات

-- 1. جدول العقود
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  tenant_phone TEXT NOT NULL,
  tenant_id_number TEXT NOT NULL,
  tenant_email TEXT,
  
  contract_type TEXT NOT NULL CHECK (contract_type IN ('إيجار', 'بيع', 'صيانة', 'خدمات')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  monthly_rent NUMERIC(15,2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(15,2) DEFAULT 0,
  payment_frequency TEXT NOT NULL DEFAULT 'شهري' CHECK (payment_frequency IN ('شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي')),
  
  status TEXT NOT NULL DEFAULT 'نشط' CHECK (status IN ('مسودة', 'نشط', 'منتهي', 'ملغي', 'متأخر')),
  is_renewable BOOLEAN DEFAULT true,
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 60,
  
  terms_and_conditions TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- 2. جدول الدفعات الإيجارية
CREATE TABLE IF NOT EXISTS public.rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT NOT NULL UNIQUE,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  
  due_date DATE NOT NULL,
  payment_date DATE,
  amount_due NUMERIC(15,2) NOT NULL,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'مدفوع جزئياً', 'مدفوع', 'متأخر', 'ملغي')),
  payment_method TEXT CHECK (payment_method IN ('نقدي', 'تحويل بنكي', 'شيك', 'بطاقة')),
  
  late_fee NUMERIC(15,2) DEFAULT 0,
  discount NUMERIC(15,2) DEFAULT 0,
  
  receipt_number TEXT,
  notes TEXT,
  
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. جدول طلبات الصيانة
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'عادية' CHECK (priority IN ('منخفضة', 'عادية', 'عالية', 'عاجلة')),
  category TEXT NOT NULL CHECK (category IN ('كهرباء', 'سباكة', 'تكييف', 'نظافة', 'أمن', 'أخرى')),
  
  status TEXT NOT NULL DEFAULT 'جديد' CHECK (status IN ('جديد', 'قيد المراجعة', 'معتمد', 'قيد التنفيذ', 'مكتمل', 'ملغي')),
  
  requested_by TEXT NOT NULL,
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  completed_date DATE,
  
  estimated_cost NUMERIC(15,2),
  actual_cost NUMERIC(15,2),
  
  assigned_to TEXT,
  vendor_name TEXT,
  
  notes TEXT,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. جدول مرفقات العقود
CREATE TABLE IF NOT EXISTS public.contract_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 5. جدول تجديدات العقود
CREATE TABLE IF NOT EXISTS public.contract_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  new_contract_id UUID REFERENCES public.contracts(id),
  
  renewal_date DATE NOT NULL,
  new_start_date DATE NOT NULL,
  new_end_date DATE NOT NULL,
  new_monthly_rent NUMERIC(15,2) NOT NULL,
  
  rent_increase_percentage NUMERIC(5,2),
  rent_increase_amount NUMERIC(15,2),
  
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'معتمد', 'مرفوض', 'مكتمل')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes للأداء
CREATE INDEX idx_contracts_property ON public.contracts(property_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX idx_rental_payments_contract ON public.rental_payments(contract_id);
CREATE INDEX idx_rental_payments_due_date ON public.rental_payments(due_date);
CREATE INDEX idx_rental_payments_status ON public.rental_payments(status);
CREATE INDEX idx_maintenance_property ON public.maintenance_requests(property_id);
CREATE INDEX idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON public.maintenance_requests(priority);

-- Functions
-- دالة لتوليد رقم عقد تلقائي
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM contracts
  WHERE contract_number LIKE 'CON-' || year_suffix || '-%';
  
  NEW.contract_number := 'CON-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة لتوليد رقم دفعة إيجار
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM rental_payments
  WHERE payment_number LIKE 'PAY-' || year_suffix || '-%';
  
  NEW.payment_number := 'PAY-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة لتوليد رقم طلب صيانة
CREATE OR REPLACE FUNCTION generate_maintenance_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM maintenance_requests
  WHERE request_number LIKE 'MNT-' || year_suffix || '-%';
  
  NEW.request_number := 'MNT-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة لتحديث حالة العقد بناءً على التاريخ
CREATE OR REPLACE FUNCTION update_contract_status()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا انتهى العقد
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'نشط' THEN
    NEW.status := 'منتهي';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث حالة الدفعات المتأخرة
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تأخرت الدفعة
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'معلق' THEN
    NEW.status := 'متأخر';
    -- احتساب غرامة تأخير (1% من المبلغ المستحق عن كل يوم)
    NEW.late_fee := (CURRENT_DATE - NEW.due_date) * (NEW.amount_due * 0.01);
  END IF;
  
  -- إذا تم الدفع كاملاً
  IF NEW.amount_paid >= NEW.amount_due AND NEW.status != 'مدفوع' THEN
    NEW.status := 'مدفوع';
    NEW.payment_date := CURRENT_DATE;
  -- إذا تم دفع جزء
  ELSIF NEW.amount_paid > 0 AND NEW.amount_paid < NEW.amount_due THEN
    NEW.status := 'مدفوع جزئياً';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER set_contract_number
  BEFORE INSERT ON public.contracts
  FOR EACH ROW
  WHEN (NEW.contract_number IS NULL)
  EXECUTE FUNCTION generate_contract_number();

CREATE TRIGGER set_payment_number
  BEFORE INSERT ON public.rental_payments
  FOR EACH ROW
  WHEN (NEW.payment_number IS NULL)
  EXECUTE FUNCTION generate_payment_number();

CREATE TRIGGER set_maintenance_number
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL)
  EXECUTE FUNCTION generate_maintenance_number();

CREATE TRIGGER check_contract_status
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_status();

CREATE TRIGGER check_payment_status
  BEFORE INSERT OR UPDATE ON public.rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_status();

CREATE TRIGGER update_contracts_timestamp
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_timestamp
  BEFORE UPDATE ON public.rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_timestamp
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_renewals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view contracts"
  ON public.contracts FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contracts"
  ON public.contracts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contracts"
  ON public.contracts FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view payments"
  ON public.rental_payments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage payments"
  ON public.rental_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view maintenance"
  ON public.maintenance_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create maintenance"
  ON public.maintenance_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage maintenance"
  ON public.maintenance_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view attachments"
  ON public.contract_attachments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage attachments"
  ON public.contract_attachments FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view renewals"
  ON public.contract_renewals FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage renewals"
  ON public.contract_renewals FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));