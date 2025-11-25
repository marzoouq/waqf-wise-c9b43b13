-- ============================================
-- المرحلة الأولى: الإصلاحات الحرجة (مُصحّحة)
-- ============================================

-- 1️⃣ إصلاح RLS على جدول loans
DROP POLICY IF EXISTS "enable_all_loans" ON loans;
DROP POLICY IF EXISTS "enable_read_loans" ON loans;

CREATE POLICY "secure_loans_beneficiary_access" ON loans
FOR SELECT USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

CREATE POLICY "secure_loans_staff_access" ON loans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
);

-- 2️⃣ إنشاء Cron Job لتنظيف التنبيهات القديمة
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-old-alerts',
  '0 3 * * 0',
  $$
  UPDATE system_alerts 
  SET status = 'archived'
  WHERE status = 'active' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM system_alerts
  WHERE status = 'archived'
    AND created_at < NOW() - INTERVAL '90 days';
  $$
);

-- 3️⃣ إضافة Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_national_id ON beneficiaries(national_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_phone ON beneficiaries(phone);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_loans_beneficiary_id ON loans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);

-- 4️⃣ إصلاح RLS على contracts - إخفاء بيانات المستأجرين
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contracts;
CREATE POLICY "secure_contracts_staff_only" ON contracts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
);

-- 5️⃣ إصلاح RLS على invoices - إخفاء بيانات العملاء
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;
CREATE POLICY "secure_invoices_staff_only" ON invoices
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
);

-- 6️⃣ دمج سياسات bank_accounts المتداخلة
DROP POLICY IF EXISTS "Allow authenticated users to view bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_select_policy" ON bank_accounts;

CREATE POLICY "unified_bank_accounts_policy" ON bank_accounts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
);