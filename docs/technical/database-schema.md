# 🗄️ هيكل قاعدة البيانات | Database Schema

**الإصدار:** 2.9.90 | **آخر تحديث:** 2025-12-22

---

## 📊 نظرة عامة

| المقياس | القيمة |
|---------|--------|
| **إجمالي الجداول** | 231 جدول |
| **سياسات RLS** | 675 سياسة |
| **تغطية RLS** | 100% |
| **Database Triggers** | 200 trigger |
| **قاعدة البيانات** | PostgreSQL (Lovable Cloud) |
| **Realtime** | مفعّل على الجداول الرئيسية |

---

## 📑 فهرس الجداول

1. [المستخدمون والأدوار](#-المستخدمون-والأدوار)
2. [المستفيدون والعائلات](#-المستفيدون-والعائلات)
3. [العقارات والوحدات](#-العقارات-والوحدات)
4. [المستأجرون والعقود](#-المستأجرون-والعقود) ✨ جديد
5. [المحاسبة والمالية](#-المحاسبة-والمالية)
6. [التوزيعات والوقف](#-التوزيعات-والوقف)
7. [الأرشفة والإشعارات](#-الأرشفة-والإشعارات)
8. [الدوال والـ Triggers](#-الدوال-والـ-triggers)

---

## 👥 المستخدمون والأدوار

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### user_roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL, -- 'nazer', 'admin', 'accountant', 'cashier', 'archivist', 'beneficiary', 'waqf_heir'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### permissions
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT
);
```

### role_permissions
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID REFERENCES permissions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 👨‍👩‍👧‍👦 المستفيدون والعائلات

### beneficiaries
```sql
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL, -- 'son', 'daughter', 'wife'
  status TEXT DEFAULT 'active',
  family_id UUID REFERENCES families(id),
  user_id UUID REFERENCES auth.users,
  account_balance NUMERIC DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  total_payments NUMERIC DEFAULT 0,
  pending_amount NUMERIC DEFAULT 0,
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  nationality TEXT DEFAULT 'سعودي',
  city TEXT,
  address TEXT,
  bank_name TEXT,
  iban TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### families
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  head_id UUID REFERENCES beneficiaries(id),
  total_members INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### beneficiary_requests
```sql
CREATE TABLE beneficiary_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE,
  beneficiary_id UUID REFERENCES beneficiaries(id),
  request_type_id UUID REFERENCES request_types(id),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount NUMERIC,
  priority TEXT DEFAULT 'normal',
  assigned_to UUID,
  sla_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🏢 العقارات والوحدات

### properties
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  location TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  total_units INTEGER DEFAULT 1,
  monthly_rent NUMERIC DEFAULT 0,
  tax_percentage NUMERIC DEFAULT 15,
  waqf_unit_id UUID REFERENCES waqf_units(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### property_units
```sql
CREATE TABLE property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  unit_number TEXT NOT NULL,
  floor_number INTEGER,
  unit_type TEXT,
  area NUMERIC,
  monthly_rent NUMERIC,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🏪 المستأجرون والعقود

### tenants ✨ جديد
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_number TEXT UNIQUE NOT NULL, -- ترقيم تلقائي T-XXXX
  full_name TEXT NOT NULL,
  id_type TEXT DEFAULT 'national_id', -- 'national_id', 'iqama', 'passport', 'commercial_register'
  id_number TEXT NOT NULL,
  tax_number TEXT, -- الرقم الضريبي
  commercial_register TEXT, -- السجل التجاري
  national_address TEXT, -- العنوان الوطني
  phone TEXT NOT NULL,
  email TEXT,
  bank_name TEXT,
  iban TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### tenant_ledger ✨ جديد
```sql
CREATE TABLE tenant_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type TEXT NOT NULL, -- 'invoice', 'payment', 'adjustment', 'opening_balance'
  reference_type TEXT, -- 'invoice', 'receipt_voucher', 'journal_entry'
  reference_id UUID,
  reference_number TEXT,
  description TEXT,
  debit_amount NUMERIC DEFAULT 0, -- مدين (استحقاق)
  credit_amount NUMERIC DEFAULT 0, -- دائن (سداد)
  balance NUMERIC DEFAULT 0, -- الرصيد الجاري
  property_id UUID REFERENCES properties(id),
  contract_id UUID REFERENCES contracts(id),
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### contracts
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE,
  property_id UUID REFERENCES properties(id),
  tenant_id UUID REFERENCES tenants(id), -- ✨ ربط بجدول المستأجرين
  tenant_name TEXT NOT NULL,
  tenant_id_number TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  annual_rent NUMERIC,
  payment_frequency TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### rental_payments
```sql
CREATE TABLE rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  property_id UUID REFERENCES properties(id),
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  payment_date DATE,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 💰 المحاسبة والمالية

### accounts (شجرة الحسابات)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  account_type account_type NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
  account_nature account_nature NOT NULL, -- 'debit', 'credit'
  parent_id UUID REFERENCES accounts(id),
  is_header BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  current_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- الحسابات الجديدة للمستأجرين
-- 1.2 - الذمم المدينة (أصل)
-- 1.2.1 - ذمم المستأجرين (أصل)
```

### journal_entries
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT,
  total_debit NUMERIC NOT NULL,
  total_credit NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft',
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  reference_type TEXT,
  reference_id UUID,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### journal_entry_lines
```sql
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id),
  account_id UUID REFERENCES accounts(id),
  description TEXT,
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### fiscal_years
```sql
CREATE TABLE fiscal_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  customer_name TEXT NOT NULL,
  customer_tax_number TEXT, -- ✨ الرقم الضريبي
  customer_national_address TEXT, -- ✨ العنوان الوطني
  tenant_id UUID REFERENCES tenants(id), -- ✨ ربط بالمستأجر
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft',
  qr_code_data TEXT, -- ZATCA QR
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📤 التوزيعات والوقف

### waqf_units (أقلام الوقف)
```sql
CREATE TABLE waqf_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  annual_return NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### distributions
```sql
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_number TEXT UNIQUE,
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  waqf_unit_id UUID REFERENCES waqf_units(id),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### heir_distributions
```sql
CREATE TABLE heir_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  heir_type TEXT NOT NULL, -- 'wife', 'son', 'daughter'
  share_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📁 الأرشفة والإشعارات

### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  folder_id UUID REFERENCES document_folders(id),
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔧 الدوال والـ Triggers

### دوال المستأجرين ✨ جديد

```sql
-- توليد رقم المستأجر تلقائياً
CREATE OR REPLACE FUNCTION generate_tenant_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tenant_number := 'T-' || LPAD(nextval('tenant_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- حساب رصيد المستأجر
CREATE OR REPLACE FUNCTION calculate_tenant_balance(p_tenant_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0)
  INTO v_balance
  FROM tenant_ledger
  WHERE tenant_id = p_tenant_id;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- تحديث الرصيد الجاري في سجل المستأجر
CREATE OR REPLACE FUNCTION update_tenant_ledger_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.balance := calculate_tenant_balance(NEW.tenant_id) + 
                 NEW.debit_amount - NEW.credit_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### دوال الضريبة

```sql
-- حساب ضريبة الإيجار (طريقة الإضافة)
CREATE OR REPLACE FUNCTION calculate_rental_tax()
RETURNS TRIGGER AS $$
DECLARE
  property_tax_rate NUMERIC;
BEGIN
  SELECT COALESCE(tax_percentage, 15) INTO property_tax_rate
  FROM properties WHERE id = NEW.property_id;
  
  NEW.tax_amount := ROUND(NEW.amount_due * property_tax_rate / 100, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### دوال التحقق من الأدوار

```sql
-- التحقق من دور محدد
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 AND role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- التحقق من كون المستخدم موظف
CREATE OR REPLACE FUNCTION is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier', 'archivist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 الـ Views الرئيسية

### beneficiary_statistics
```sql
CREATE VIEW beneficiary_statistics AS
SELECT 
  b.id,
  b.full_name,
  b.category,
  b.total_received,
  b.account_balance,
  COUNT(DISTINCT hd.id) as distribution_count,
  MAX(hd.paid_at) as last_distribution_date
FROM beneficiaries b
LEFT JOIN heir_distributions hd ON b.id = hd.beneficiary_id
GROUP BY b.id;
```

### tenant_balance_summary ✨ جديد
```sql
CREATE VIEW tenant_balance_summary AS
SELECT 
  t.id,
  t.tenant_number,
  t.full_name,
  COALESCE(SUM(tl.debit_amount), 0) as total_debits,
  COALESCE(SUM(tl.credit_amount), 0) as total_credits,
  COALESCE(SUM(tl.debit_amount) - SUM(tl.credit_amount), 0) as current_balance
FROM tenants t
LEFT JOIN tenant_ledger tl ON t.id = tl.tenant_id
GROUP BY t.id;
```

---

**الحالة:** ✅ موثق ومحدّث | **الإصدار:** 2.6.42
