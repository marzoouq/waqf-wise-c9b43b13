# 🗄️ مخطط قاعدة البيانات

> توثيق شامل لقاعدة بيانات نظام إدارة الوقف

---

## 📊 الإحصائيات

| الفئة | العدد |
|-------|-------|
| **الجداول** | 231 |
| **سياسات RLS** | 682 |
| **Triggers** | 192 |
| **Functions** | 264 |
| **Views** | 29 |

---

## 📋 الجداول حسب الفئة

### 👥 المستفيدين (Beneficiaries)

#### جدول `beneficiaries` - المستفيدين الأساسي

```sql
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  
  -- البيانات الشخصية
  date_of_birth DATE,
  gender TEXT,
  marital_status TEXT,
  nationality TEXT,
  
  -- العائلة
  family_id UUID REFERENCES families(id),
  family_name TEXT,
  is_head_of_family BOOLEAN DEFAULT false,
  number_of_wives INTEGER,
  number_of_sons INTEGER,
  number_of_daughters INTEGER,
  family_size INTEGER,
  
  -- البنك
  bank_name TEXT,
  bank_account_number TEXT,
  iban TEXT,
  
  -- الحساب
  user_id UUID,
  username TEXT,
  can_login BOOLEAN DEFAULT false,
  
  -- الأرصدة
  account_balance NUMERIC DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  pending_amount NUMERIC DEFAULT 0,
  
  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ
);
```

#### جداول المستفيدين الأخرى

| الجدول | الوصف | العلاقة |
|--------|-------|---------|
| `beneficiary_requests` | طلبات المستفيدين | `beneficiaries.id` |
| `beneficiary_attachments` | مرفقات المستفيدين | `beneficiaries.id` |
| `beneficiary_activity_log` | سجل النشاط | `beneficiaries.id` |
| `beneficiary_sessions` | جلسات الدخول | `beneficiaries.id` |
| `beneficiary_tags` | تصنيفات المستفيد | `beneficiaries.id` |
| `beneficiary_categories` | فئات المستفيدين | - |
| `beneficiary_changes_log` | سجل التغييرات | `beneficiaries.id` |

---

### 👨‍👩‍👧‍👦 العائلات (Families)

#### جدول `families` - العائلات

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  family_code TEXT UNIQUE,
  head_of_family_id UUID REFERENCES beneficiaries(id),
  tribe TEXT,
  
  -- الإحصائيات
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  
  -- الحالة
  status TEXT DEFAULT 'active',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `tribes` - القبائل

```sql
CREATE TABLE tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  families_count INTEGER DEFAULT 0,
  beneficiaries_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 🏠 العقارات (Properties)

#### جدول `properties` - العقارات

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_number TEXT UNIQUE,
  name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  
  -- الموقع
  address TEXT,
  city TEXT,
  district TEXT,
  coordinates JSONB,
  
  -- التفاصيل
  total_area NUMERIC,
  land_area NUMERIC,
  building_area NUMERIC,
  floors_count INTEGER,
  units_count INTEGER DEFAULT 0,
  
  -- القيمة
  purchase_value NUMERIC,
  current_value NUMERIC,
  annual_revenue NUMERIC,
  
  -- الحالة
  status TEXT DEFAULT 'active',
  ownership_type TEXT,
  deed_number TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `property_units` - الوحدات العقارية

```sql
CREATE TABLE property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  
  -- التفاصيل
  floor_number INTEGER,
  area NUMERIC,
  rooms_count INTEGER,
  bathrooms_count INTEGER,
  
  -- الإيجار
  monthly_rent NUMERIC,
  annual_rent NUMERIC,
  
  -- الحالة
  status TEXT DEFAULT 'available',
  tenant_id UUID REFERENCES tenants(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `tenants` - المستأجرين

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  national_id TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  
  -- العنوان
  address TEXT,
  city TEXT,
  
  -- البنك
  bank_name TEXT,
  iban TEXT,
  
  -- الحالة
  status TEXT DEFAULT 'active',
  tenant_type TEXT,
  
  -- الأرصدة
  total_due NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `contracts` - العقود

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE,
  unit_id UUID REFERENCES property_units(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  
  -- التواريخ
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- القيم
  monthly_rent NUMERIC NOT NULL,
  annual_rent NUMERIC NOT NULL,
  deposit_amount NUMERIC,
  
  -- الشروط
  payment_frequency TEXT DEFAULT 'monthly',
  payment_day INTEGER,
  
  -- الحالة
  status TEXT DEFAULT 'active',
  renewal_status TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 💰 المحاسبة (Accounting)

#### جدول `accounts` - دليل الحسابات

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  
  -- التصنيف
  account_type account_type NOT NULL,
  account_nature account_nature NOT NULL,
  parent_id UUID REFERENCES accounts(id),
  
  -- الحالة
  is_header BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  current_balance NUMERIC DEFAULT 0,
  
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `journal_entries` - القيود اليومية

```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT UNIQUE,
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  
  -- التفاصيل
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  
  -- المبالغ
  total_debit NUMERIC NOT NULL,
  total_credit NUMERIC NOT NULL,
  
  -- الحالة
  status TEXT DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  -- البيانات الإضافية
  attachments JSONB,
  metadata JSONB,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `journal_entry_lines` - سطور القيد

```sql
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id) NOT NULL,
  account_id UUID REFERENCES accounts(id) NOT NULL,
  
  description TEXT,
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  
  cost_center TEXT,
  project_code TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `fiscal_years` - السنوات المالية

```sql
CREATE TABLE fiscal_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  status TEXT DEFAULT 'open',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  published_by UUID,
  
  opening_balance NUMERIC DEFAULT 0,
  closing_balance NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 📊 التوزيعات (Distributions)

#### جدول `distributions` - التوزيعات

```sql
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_number TEXT UNIQUE,
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  
  -- التفاصيل
  distribution_date DATE NOT NULL,
  distribution_type TEXT NOT NULL,
  description TEXT,
  
  -- المبالغ
  total_amount NUMERIC NOT NULL,
  beneficiaries_count INTEGER,
  
  -- الحالة
  status TEXT DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `heir_distributions` - توزيعات الورثة

```sql
CREATE TABLE heir_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id) NOT NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id) NOT NULL,
  
  amount NUMERIC NOT NULL,
  percentage NUMERIC,
  
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 🏦 البنوك (Banking)

#### جدول `bank_accounts` - الحسابات البنكية

```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  swift_code TEXT,
  
  currency TEXT DEFAULT 'SAR',
  current_balance NUMERIC DEFAULT 0,
  
  account_id UUID REFERENCES accounts(id),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `payment_vouchers` - سندات الصرف

```sql
CREATE TABLE payment_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number TEXT UNIQUE,
  
  beneficiary_id UUID REFERENCES beneficiaries(id),
  distribution_id UUID REFERENCES distributions(id),
  
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE,
  
  bank_account_id UUID REFERENCES bank_accounts(id),
  check_number TEXT,
  transfer_reference TEXT,
  
  status TEXT DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 🏛️ الحوكمة (Governance)

#### جدول `governance_decisions` - قرارات الحوكمة

```sql
CREATE TABLE governance_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  
  decision_type TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'normal',
  
  status TEXT DEFAULT 'draft',
  voting_status TEXT,
  
  proposed_by UUID,
  proposed_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  
  attachments JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `annual_disclosures` - الإفصاحات السنوية

```sql
CREATE TABLE annual_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  waqf_name TEXT NOT NULL,
  
  -- الإيرادات والمصروفات
  total_revenues NUMERIC NOT NULL,
  total_expenses NUMERIC NOT NULL,
  net_income NUMERIC NOT NULL,
  
  -- التوزيعات
  total_beneficiaries INTEGER,
  sons_count INTEGER,
  daughters_count INTEGER,
  wives_count INTEGER,
  
  -- النسب
  nazer_percentage NUMERIC,
  nazer_share NUMERIC,
  charity_percentage NUMERIC,
  charity_share NUMERIC,
  corpus_percentage NUMERIC,
  corpus_share NUMERIC,
  
  -- الحالة
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  published_by UUID,
  
  disclosure_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 👤 المستخدمين (Users)

#### جدول `profiles` - ملفات المستخدمين

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  role TEXT,
  is_active BOOLEAN DEFAULT true,
  
  preferences JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### جدول `user_roles` - أدوار المستخدمين

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, role)
);
```

---

### 📝 سجلات النظام (System Logs)

#### جدول `audit_logs` - سجلات التدقيق

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID,
  user_email TEXT,
  
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  
  old_values JSONB,
  new_values JSONB,
  
  description TEXT,
  severity TEXT DEFAULT 'info',
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 👁️ العروض (Views)

### العروض الرئيسية

| العرض | الوصف |
|-------|-------|
| `beneficiaries_overview` | نظرة عامة على المستفيدين مع الإحصائيات |
| `beneficiaries_masked` | بيانات المستفيدين مع إخفاء المعلومات الحساسة |
| `beneficiary_statistics` | إحصائيات تفصيلية للمستفيدين |
| `beneficiary_account_statement` | كشف حساب المستفيد |
| `general_ledger` | الدفتر العام |
| `journal_entries_with_lines` | القيود مع السطور |
| `accounts_hierarchy` | شجرة الحسابات |
| `distribution_statistics` | إحصائيات التوزيعات |
| `distributions_summary` | ملخص التوزيعات |
| `payment_vouchers_with_details` | سندات الصرف التفصيلية |
| `unmatched_bank_transactions` | المعاملات البنكية غير المطابقة |
| `pending_approvals_view` | الموافقات المعلقة |

---

## 🔗 الملفات ذات الصلة

- [سياسات الأمان](../security/RLS_POLICIES.md)
- [Edge Functions](../edge-functions/README.md)
- [التوثيق الشامل](../COMPLETE_DOCUMENTATION.md)
