# 🗄 هيكل قاعدة البيانات | Database Schema

**الإصدار:** 2.6.32 | **آخر تحديث:** 2025-12-07

---

## 📊 نظرة عامة

- **إجمالي الجداول:** 100+
- **تغطية RLS:** 100%
- **قاعدة البيانات:** PostgreSQL (Supabase)

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
  role TEXT NOT NULL,
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

---

## 👨‍👩‍👧‍👦 المستفيدون

### beneficiaries
```sql
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  family_id UUID REFERENCES families(id),
  user_id UUID REFERENCES auth.users,
  account_balance NUMERIC DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  -- ... المزيد من الحقول
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
  beneficiary_id UUID REFERENCES beneficiaries(id),
  request_type_id UUID,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount NUMERIC,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🏢 العقارات

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
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### contracts
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE,
  property_id UUID REFERENCES properties(id),
  tenant_name TEXT NOT NULL,
  tenant_id TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  annual_rent NUMERIC,
  payment_frequency TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 💰 المحاسبة

### accounts
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  account_type account_type NOT NULL,
  account_nature account_nature NOT NULL,
  parent_id UUID REFERENCES accounts(id),
  is_header BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  current_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
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
  created_by UUID,
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
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📤 التوزيعات

### distributions
```sql
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_number TEXT UNIQUE,
  fiscal_year_id UUID REFERENCES fiscal_years(id),
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
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### waqf_units
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

---

## 📁 الأرشفة

### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  folder_id UUID,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔔 الإشعارات

### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📊 Views

### beneficiary_statistics
```sql
CREATE VIEW beneficiary_statistics AS
SELECT 
  b.id,
  b.full_name,
  b.total_received,
  b.account_balance,
  COUNT(DISTINCT hd.id) as distribution_count
FROM beneficiaries b
LEFT JOIN heir_distributions hd ON b.id = hd.beneficiary_id
GROUP BY b.id;
```

### distribution_statistics
```sql
CREATE VIEW distribution_statistics AS
SELECT 
  d.id,
  d.total_amount,
  d.status,
  fy.name as fiscal_year,
  COUNT(hd.id) as beneficiary_count
FROM distributions d
JOIN fiscal_years fy ON d.fiscal_year_id = fy.id
LEFT JOIN heir_distributions hd ON d.id = hd.distribution_id
GROUP BY d.id, fy.name;
```

---

## 🔧 Functions

### حساب الضريبة
```sql
CREATE OR REPLACE FUNCTION calculate_rental_tax()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tax_amount := ROUND(NEW.amount_due * 
    (SELECT tax_percentage FROM properties WHERE id = NEW.property_id) / 100, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### التحقق من الدور
```sql
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = $1 AND role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

**الحالة:** ✅ موثق | **الإصدار:** 2.6.32
