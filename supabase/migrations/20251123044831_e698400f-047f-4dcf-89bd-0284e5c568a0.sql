-- المرحلة الرابعة: إدارة التوزيعات والموافقات المتقدمة (مصححة)

-- جدول سندات الدفع
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number TEXT UNIQUE NOT NULL,
  voucher_type TEXT NOT NULL CHECK (voucher_type IN ('receipt', 'payment', 'journal')),
  distribution_id UUID REFERENCES distributions(id) ON DELETE SET NULL,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'cash', 'check', 'digital_wallet')),
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid', 'cancelled', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  paid_by TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_voucher_number ON payment_vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_distribution_id ON payment_vouchers(distribution_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_beneficiary_id ON payment_vouchers(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_created_at ON payment_vouchers(created_at DESC);

-- تفعيل RLS
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Users can view payment vouchers" ON payment_vouchers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can create payment vouchers" ON payment_vouchers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can update payment vouchers" ON payment_vouchers
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- جدول تفاصيل ملفات التحويل البنكي
CREATE TABLE IF NOT EXISTS bank_transfer_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_number TEXT UNIQUE NOT NULL,
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  file_format TEXT NOT NULL CHECK (file_format IN ('ISO20022', 'SWIFT_MT940', 'CSV', 'EXCEL')),
  total_amount DECIMAL(15,2) NOT NULL,
  total_transactions INTEGER NOT NULL,
  file_path TEXT,
  file_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent', 'processed', 'failed')),
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_bank_transfer_files_distribution_id ON bank_transfer_files(distribution_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_files_status ON bank_transfer_files(status);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_files_created_at ON bank_transfer_files(created_at DESC);

-- تفعيل RLS
ALTER TABLE bank_transfer_files ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Users can view bank transfer files" ON bank_transfer_files
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can create bank transfer files" ON bank_transfer_files
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can update bank transfer files" ON bank_transfer_files
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- جدول تفاصيل التحويلات البنكية
CREATE TABLE IF NOT EXISTS bank_transfer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_file_id UUID REFERENCES bank_transfer_files(id) ON DELETE CASCADE,
  payment_voucher_id UUID REFERENCES payment_vouchers(id) ON DELETE SET NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  beneficiary_name TEXT NOT NULL,
  iban TEXT NOT NULL,
  bank_name TEXT,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  reference_number TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'processed', 'failed', 'returned')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_bank_transfer_details_transfer_file_id ON bank_transfer_details(transfer_file_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_details_beneficiary_id ON bank_transfer_details(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_details_status ON bank_transfer_details(status);

-- تفعيل RLS
ALTER TABLE bank_transfer_details ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Users can view bank transfer details" ON bank_transfer_details
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can create bank transfer details" ON bank_transfer_details
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- دالة لتوليد رقم سند تلقائي
CREATE OR REPLACE FUNCTION generate_voucher_number(voucher_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  next_number INTEGER;
  year_part TEXT;
BEGIN
  prefix := CASE voucher_type
    WHEN 'receipt' THEN 'RC'
    WHEN 'payment' THEN 'PV'
    WHEN 'journal' THEN 'JV'
    ELSE 'VC'
  END;
  
  year_part := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(voucher_number FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1 INTO next_number
  FROM payment_vouchers
  WHERE voucher_number LIKE prefix || year_part || '%';
  
  RETURN prefix || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- دالة لتوليد رقم ملف تحويل بنكي
CREATE OR REPLACE FUNCTION generate_transfer_file_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
  month_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YY');
  month_part := TO_CHAR(NOW(), 'MM');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(file_number FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1 INTO next_number
  FROM bank_transfer_files
  WHERE file_number LIKE 'BTF' || year_part || month_part || '%';
  
  RETURN 'BTF' || year_part || month_part || '-' || LPAD(next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_vouchers_updated_at ON payment_vouchers;
CREATE TRIGGER update_payment_vouchers_updated_at
  BEFORE UPDATE ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_transfer_files_updated_at ON bank_transfer_files;
CREATE TRIGGER update_bank_transfer_files_updated_at
  BEFORE UPDATE ON bank_transfer_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View لعرض سندات الدفع مع تفاصيل إضافية
CREATE OR REPLACE VIEW payment_vouchers_with_details AS
SELECT 
  pv.*,
  b.full_name as beneficiary_name,
  b.national_id as beneficiary_national_id,
  ba.bank_name,
  ba.account_number,
  ba.iban as bank_iban,
  d.id as distribution_id_ref,
  d.total_amount as distribution_total_amount
FROM payment_vouchers pv
LEFT JOIN beneficiaries b ON pv.beneficiary_id = b.id
LEFT JOIN bank_accounts ba ON pv.bank_account_id = ba.id
LEFT JOIN distributions d ON pv.distribution_id = d.id;

-- View لإحصائيات التوزيعات
CREATE OR REPLACE VIEW distribution_statistics AS
SELECT 
  d.id,
  d.total_amount,
  d.status,
  d.distribution_date,
  COUNT(DISTINCT dd.id) as total_beneficiaries,
  COUNT(DISTINCT pv.id) as total_vouchers,
  COALESCE(SUM(pv.amount), 0) as total_paid,
  d.total_amount - COALESCE(SUM(pv.amount), 0) as remaining_amount,
  CASE 
    WHEN d.total_amount > 0 THEN (COALESCE(SUM(pv.amount), 0) / d.total_amount * 100)
    ELSE 0
  END as completion_percentage
FROM distributions d
LEFT JOIN distribution_details dd ON d.id = dd.distribution_id
LEFT JOIN payment_vouchers pv ON d.id = pv.distribution_id AND pv.status = 'paid'
GROUP BY d.id, d.total_amount, d.status, d.distribution_date;