-- المرحلة 1: تحديث قاعدة البيانات لنظام الفواتير الضريبية المتوافق مع ZATCA

-- 1.1 إنشاء جدول إعدادات المنشأة
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name_ar TEXT NOT NULL,
  organization_name_en TEXT,
  vat_registration_number TEXT NOT NULL,
  commercial_registration_number TEXT NOT NULL,
  address_ar TEXT NOT NULL,
  address_en TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'المملكة العربية السعودية',
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- قيود: رقم ضريبي صحيح (15 رقم يبدأ بـ 3)
ALTER TABLE organization_settings 
ADD CONSTRAINT valid_vat_number 
CHECK (vat_registration_number ~ '^3[0-9]{14}$');

-- تفعيل RLS
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- سياسة: السماح للمصادقين بالقراءة
CREATE POLICY "Allow authenticated read on organization_settings"
ON organization_settings FOR SELECT
TO authenticated
USING (true);

-- سياسة: السماح للمصادقين بالإضافة
CREATE POLICY "Allow authenticated insert on organization_settings"
ON organization_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- سياسة: السماح للمصادقين بالتحديث
CREATE POLICY "Allow authenticated update on organization_settings"
ON organization_settings FOR UPDATE
TO authenticated
USING (true);

-- 1.2 تحديث جدول الفواتير
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_time TIME DEFAULT CURRENT_TIME;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_vat_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_commercial_registration TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_city TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 15.00;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS qr_code_data TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_hash TEXT;

-- 1.3 تحديث جدول بنود الفاتورة
ALTER TABLE invoice_lines ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 15.00;
ALTER TABLE invoice_lines ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
ALTER TABLE invoice_lines ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;

-- تحديث البيانات الموجودة لحساب الضريبة والمجاميع الفرعية
UPDATE invoice_lines 
SET 
  subtotal = quantity * unit_price,
  tax_amount = (quantity * unit_price) * (COALESCE(tax_rate, 15.00) / 100)
WHERE subtotal IS NULL OR tax_amount IS NULL;