# 📋 خطة تحويل التطبيق إلى SaaS متعدد المشتركين

## الإصدار: 1.0.0
## التاريخ: 2025-12-10
## الحالة: مرحلة التوثيق

---

# الفهرس

1. [نظرة عامة](#1-نظرة-عامة)
2. [المتطلبات التقنية](#2-المتطلبات-التقنية)
3. [البنية المعمارية](#3-البنية-المعمارية)
4. [قاعدة البيانات](#4-قاعدة-البيانات)
5. [الأمان والعزل](#5-الأمان-والعزل)
6. [الأداء والفهرسة](#6-الأداء-والفهرسة)
7. [التوجيه والمسارات](#7-التوجيه-والمسارات)
8. [الاشتراكات والفوترة](#8-الاشتراكات-والفوترة)
9. [لوحة Super Admin](#9-لوحة-super-admin)
10. [الهيكل الملفي](#10-الهيكل-الملفي)
11. [الجدول الزمني](#11-الجدول-الزمني)
12. [الاختبار والجودة](#12-الاختبار-والجودة)
13. [النشر والصيانة](#13-النشر-والصيانة)

---

# 1. نظرة عامة

## 1.1 الهدف
تحويل تطبيق إدارة الوقف الحالي (Single-Tenant) إلى نظام SaaS متعدد المشتركين (Multi-Tenant) يسمح لكل وقف بالاشتراك والحصول على نسخة معزولة من التطبيق.

## 1.2 النموذج المختار
| البند | القيمة | السبب |
|-------|--------|-------|
| **نوع العزل** | Single Database + Row-Level Security | تكلفة أقل، صيانة أسهل، أداء أفضل |
| **نوع التوجيه** | Path-Based (`/tenant-slug/...`) | متوافق مع Lovable، لا يتطلب DNS |
| **الفوترة** | Stripe Subscriptions | موثوق، آمن، متكامل |

## 1.3 المخرجات المتوقعة
- كل مشترك له مسار فرعي خاص: `waqfapp.com/ahmed`, `waqfapp.com/mohammed`
- عزل كامل للبيانات بين المشتركين
- لوحة تحكم Super Admin لإدارة جميع المشتركين
- نظام اشتراكات شهرية مع خطط متعددة
- نظام مراقبة وتنبيهات لكل مشترك

---

# 2. المتطلبات التقنية

## 2.1 البنية التحتية الحالية
```
التقنيات الموجودة:
├── Frontend: React 18 + TypeScript + Vite
├── Styling: Tailwind CSS + Shadcn UI
├── State: React Query + Context API
├── Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
├── Database: 191 جدول + 724 سياسة RLS
└── Services: 52 خدمة + 170+ hook
```

## 2.2 المتطلبات الجديدة

### 2.2.1 قاعدة البيانات
| المتطلب | التفاصيل |
|---------|----------|
| جداول جديدة | 5 جداول (tenants, subscription_plans, tenant_users, tenant_settings, tenant_billing) |
| أعمدة جديدة | إضافة `tenant_id` لـ 50+ جدول |
| سياسات RLS | تحديث 724 سياسة + إضافة سياسات جديدة |
| فهارس | إضافة 60+ فهرس مركب |
| دوال | إضافة 15+ دالة جديدة |

### 2.2.2 الواجهة الأمامية
| المتطلب | التفاصيل |
|---------|----------|
| Context جديد | TenantContext لإدارة حالة المشترك |
| Middleware | TenantMiddleware لاستخراج tenant من URL |
| صفحات جديدة | 10+ صفحات Super Admin |
| مكونات جديدة | 15+ مكون للإدارة والاشتراكات |

### 2.2.3 الخدمات
| المتطلب | التفاصيل |
|---------|----------|
| Services جديدة | 5 خدمات (tenant, subscription, billing, super-admin, tenant-health) |
| Hooks جديدة | 12+ hook لإدارة المشتركين |
| Edge Functions | 3 وظائف (webhook-stripe, tenant-cleanup, health-check) |

---

# 3. البنية المعمارية

## 3.1 المخطط العام

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            طبقة العرض (Presentation Layer)              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Landing Page    │  │ Tenant App      │  │ Super Admin Dashboard   │  │
│  │ /               │  │ /:slug/*        │  │ /super-admin/*          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         طبقة التوجيه (Routing Layer)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      TenantMiddleware                           │    │
│  │  • استخراج slug من URL                                          │    │
│  │  • التحقق من وجود المشترك                                       │    │
│  │  • التحقق من حالة الاشتراك                                      │    │
│  │  • تحميل إعدادات المشترك                                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          طبقة السياق (Context Layer)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ AuthContext  │  │TenantContext │  │ QueryClient  │  │ThemeContext │  │
│  │ (المصادقة)   │  │ (المشترك)    │  │ (البيانات)   │  │ (التصميم)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          طبقة الخدمات (Service Layer)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    خدمات المشتركين (Tenant Services)             │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  TenantService      │ إدارة المشتركين CRUD                       │   │
│  │  SubscriptionService│ إدارة الاشتراكات والخطط                    │   │
│  │  BillingService     │ الفوترة والمدفوعات                         │   │
│  │  TenantHealthService│ مراقبة صحة المشتركين                       │   │
│  │  SuperAdminService  │ عمليات المسؤول العام                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                 الخدمات الموجودة (معدلة لـ tenant_id)            │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  BeneficiaryService │ PropertyService │ AccountingService │ ...  │   │
│  │  (جميعها تستقبل tenant_id كمعامل)                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        طبقة قاعدة البيانات (Database Layer)             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                          Supabase                                │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │  Tables    │  │    RLS     │  │  Indexes   │  │ Functions  │  │   │
│  │  │ +tenant_id │  │ +tenant    │  │ +composite │  │ +tenant    │  │   │
│  │  │  filtering │  │  policies  │  │  indexes   │  │  helpers   │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.2 تدفق البيانات

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         تدفق طلب المستخدم                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. المستخدم يدخل: waqfapp.com/ahmed/beneficiaries                     │
│                          │                                              │
│                          ▼                                              │
│  2. TenantMiddleware:                                                   │
│     ├── استخراج slug = "ahmed"                                         │
│     ├── SELECT * FROM tenants WHERE slug = 'ahmed'                     │
│     ├── التحقق: status = 'active' ✓                                    │
│     ├── التحقق: subscription_expires_at > NOW() ✓                      │
│     └── تحميل: TenantContext.tenant = {...}                            │
│                          │                                              │
│                          ▼                                              │
│  3. AuthMiddleware:                                                     │
│     ├── التحقق من تسجيل الدخول                                         │
│     ├── SELECT * FROM tenant_users WHERE user_id AND tenant_id         │
│     └── التحقق من انتماء المستخدم للمشترك ✓                            │
│                          │                                              │
│                          ▼                                              │
│  4. React Component:                                                    │
│     ├── const { tenant } = useTenant()                                  │
│     ├── useQuery(['beneficiaries', tenant.id], ...)                    │
│     └── BeneficiaryService.getAll(tenant.id)                           │
│                          │                                              │
│                          ▼                                              │
│  5. Supabase Query:                                                     │
│     ├── SELECT * FROM beneficiaries                                    │
│     ├── RLS Policy: tenant_id = get_user_tenant_id() ✓                 │
│     └── إرجاع البيانات المفلترة فقط                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.3 مخطط العلاقات

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           نموذج العلاقات                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ┌──────────────────┐                             │
│                        │     tenants      │                             │
│                        │    (المشتركين)   │                             │
│                        └────────┬─────────┘                             │
│                                 │                                       │
│           ┌─────────────────────┼─────────────────────┐                 │
│           │                     │                     │                 │
│           ▼                     ▼                     ▼                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  tenant_users   │  │tenant_settings  │  │ tenant_billing  │         │
│  │(مستخدمي المشترك)│  │(إعدادات المشترك)│  │(فواتير المشترك) │         │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘         │
│           │                                                             │
│           │ user_id                                                     │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │   auth.users    │                                                    │
│  │   (المستخدمين)  │                                                    │
│  └─────────────────┘                                                    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  جميع الجداول الأخرى تحتوي على tenant_id:                              │
│                                                                         │
│  beneficiaries ──┐                                                      │
│  properties    ──┼── tenant_id ──► tenants.id                          │
│  contracts     ──┤                                                      │
│  payments      ──┤                                                      │
│  journal_entries─┤                                                      │
│  ...50+ جدول  ──┘                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 4. قاعدة البيانات

## 4.1 الجداول الجديدة

### 4.1.1 جدول المشتركين (tenants)
```sql
CREATE TABLE public.tenants (
  -- المعرفات
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                    -- المسار الفرعي: ahmed, mohammed
  
  -- معلومات المشترك
  name TEXT NOT NULL,                           -- اسم الوقف
  name_ar TEXT,                                 -- الاسم بالعربية
  description TEXT,                             -- وصف الوقف
  logo_url TEXT,                                -- شعار الوقف
  
  -- معلومات الاتصال
  owner_email TEXT NOT NULL,                    -- بريد المالك
  owner_phone TEXT,                             -- هاتف المالك
  owner_name TEXT,                              -- اسم المالك
  
  -- الاشتراك
  plan_id UUID REFERENCES subscription_plans(id),
  subscription_status TEXT DEFAULT 'trial',     -- trial, active, suspended, cancelled
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- الحدود
  max_beneficiaries INTEGER DEFAULT 50,
  max_properties INTEGER DEFAULT 10,
  max_users INTEGER DEFAULT 5,
  max_storage_mb INTEGER DEFAULT 1024,
  
  -- الاستخدام الحالي
  current_beneficiaries INTEGER DEFAULT 0,
  current_properties INTEGER DEFAULT 0,
  current_users INTEGER DEFAULT 0,
  current_storage_mb INTEGER DEFAULT 0,
  
  -- الحالة
  status TEXT DEFAULT 'active',                 -- active, suspended, deleted
  suspended_reason TEXT,
  suspended_at TIMESTAMPTZ,
  
  -- الإعدادات
  settings JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',                  -- الميزات المفعلة
  
  -- البيانات الوصفية
  metadata JSONB DEFAULT '{}',
  
  -- التتبع
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  
  -- القيود
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT slug_min_length CHECK (length(slug) >= 3),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'deleted')),
  CONSTRAINT valid_subscription_status CHECK (
    subscription_status IN ('trial', 'active', 'suspended', 'cancelled', 'expired')
  )
);

-- الفهارس
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX idx_tenants_plan_id ON tenants(plan_id);
CREATE INDEX idx_tenants_expires_at ON tenants(subscription_expires_at);

-- تحديث updated_at تلقائياً
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### 4.1.2 جدول خطط الاشتراك (subscription_plans)
```sql
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الخطة
  name TEXT NOT NULL,                           -- Basic, Pro, Enterprise
  name_ar TEXT NOT NULL,                        -- أساسية، متقدمة، مؤسسية
  description TEXT,
  description_ar TEXT,
  
  -- التسعير
  price_monthly NUMERIC(10,2) NOT NULL,         -- السعر الشهري
  price_yearly NUMERIC(10,2),                   -- السعر السنوي (خصم)
  currency TEXT DEFAULT 'SAR',
  
  -- الحدود
  max_beneficiaries INTEGER NOT NULL,
  max_properties INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  max_storage_mb INTEGER NOT NULL,
  
  -- الميزات
  features JSONB DEFAULT '[]',                  -- قائمة الميزات
  features_ar JSONB DEFAULT '[]',
  
  -- Stripe
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  
  -- الترتيب والعرض
  display_order INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,             -- الخطة الموصى بها
  is_active BOOLEAN DEFAULT true,
  
  -- التتبع
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- البيانات الافتراضية
INSERT INTO subscription_plans (name, name_ar, price_monthly, max_beneficiaries, max_properties, max_users, max_storage_mb, features, display_order) VALUES
('Basic', 'أساسية', 99, 50, 10, 5, 1024, 
 '["إدارة المستفيدين", "إدارة العقارات", "التقارير الأساسية", "الدعم عبر البريد"]', 1),
('Pro', 'متقدمة', 299, 200, 50, 15, 5120, 
 '["جميع ميزات الأساسية", "التقارير المتقدمة", "التوزيعات الآلية", "الدعم الهاتفي", "API Access"]', 2),
('Enterprise', 'مؤسسية', 599, -1, -1, -1, -1, 
 '["جميع ميزات المتقدمة", "غير محدود", "مدير حساب خاص", "تخصيص كامل", "SLA مضمون"]', 3);
```

### 4.1.3 جدول مستخدمي المشترك (tenant_users)
```sql
CREATE TABLE public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- العلاقات
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- الدور داخل المشترك
  role app_role NOT NULL DEFAULT 'user',
  
  -- الحالة
  status TEXT DEFAULT 'active',                 -- active, suspended, pending
  
  -- الدعوة
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  invitation_token TEXT,
  invitation_expires_at TIMESTAMPTZ,
  
  -- التتبع
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- القيود
  CONSTRAINT unique_tenant_user UNIQUE (tenant_id, user_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'pending'))
);

-- الفهارس
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);
CREATE INDEX idx_tenant_users_status ON tenant_users(status);
```

### 4.1.4 جدول إعدادات المشترك (tenant_settings)
```sql
CREATE TABLE public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- الإعدادات العامة
  timezone TEXT DEFAULT 'Asia/Riyadh',
  language TEXT DEFAULT 'ar',
  date_format TEXT DEFAULT 'YYYY-MM-DD',
  currency TEXT DEFAULT 'SAR',
  
  -- إعدادات الوقف
  waqf_name TEXT,
  waqf_registration_number TEXT,
  nazer_name TEXT,
  nazer_percentage NUMERIC(5,2) DEFAULT 10,
  charity_percentage NUMERIC(5,2) DEFAULT 5,
  
  -- إعدادات التوزيع
  distribution_settings JSONB DEFAULT '{}',
  
  -- إعدادات الإشعارات
  notification_settings JSONB DEFAULT '{
    "email_enabled": true,
    "sms_enabled": false,
    "push_enabled": true
  }',
  
  -- إعدادات المظهر
  theme_settings JSONB DEFAULT '{
    "primary_color": "#10b981",
    "logo_url": null
  }',
  
  -- إعدادات التقارير
  report_settings JSONB DEFAULT '{}',
  
  -- التتبع
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_tenant_settings UNIQUE (tenant_id)
);
```

### 4.1.5 جدول فواتير المشترك (tenant_billing)
```sql
CREATE TABLE public.tenant_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- معلومات الفاتورة
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- المبالغ
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  
  -- الدفع
  status TEXT DEFAULT 'pending',                -- pending, paid, overdue, cancelled
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  
  -- Stripe
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- التفاصيل
  line_items JSONB DEFAULT '[]',
  billing_period_start DATE,
  billing_period_end DATE,
  
  -- التتبع
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_billing_status CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'))
);

-- الفهارس
CREATE INDEX idx_tenant_billing_tenant_id ON tenant_billing(tenant_id);
CREATE INDEX idx_tenant_billing_status ON tenant_billing(status);
CREATE INDEX idx_tenant_billing_due_date ON tenant_billing(due_date);
```

## 4.2 تعديل الجداول الموجودة

### 4.2.1 قائمة الجداول المطلوب تعديلها
```sql
-- الجداول التي تحتاج إضافة tenant_id (50+ جدول)
ALTER TABLE beneficiaries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE properties ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE contracts ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE rental_payments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE tenants_table ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE tenant_ledger ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE journal_entries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE journal_entry_lines ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE accounts ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE fiscal_years ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE distributions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE distribution_details ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE loans ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE loan_installments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE emergency_aid_requests ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE payments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE invoices ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE documents ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE families ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE funds ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE notifications ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE beneficiary_requests ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE bank_accounts ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE property_units ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE maintenance_requests ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE annual_disclosures ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- ... باقي الجداول
```

### 4.2.2 سكريبت الترحيل الكامل
```sql
-- ملف: migrations/001_add_tenant_id_to_all_tables.sql

-- 1. إنشاء الجداول الجديدة أولاً
-- (كما هو موضح أعلاه)

-- 2. إضافة tenant_id لجميع الجداول
DO $$
DECLARE
  table_name TEXT;
  tables_to_update TEXT[] := ARRAY[
    'beneficiaries', 'properties', 'contracts', 'rental_payments',
    'tenants', 'tenant_ledger', 'journal_entries', 'journal_entry_lines',
    'accounts', 'fiscal_years', 'distributions', 'distribution_details',
    'loans', 'loan_installments', 'emergency_aid_requests', 'payments',
    'invoices', 'documents', 'families', 'funds', 'notifications',
    'beneficiary_requests', 'bank_accounts', 'property_units',
    'maintenance_requests', 'annual_disclosures', 'heir_distributions',
    'opening_balances', 'waqf_distribution_settings', 'cashier_shifts',
    'pos_transactions', 'support_tickets', 'knowledge_base_articles',
    'custom_reports', 'report_templates', 'approval_workflows',
    'beneficiary_attachments', 'beneficiary_activity_log',
    'beneficiary_categories', 'beneficiary_tags', 'contract_units',
    'bank_statements', 'bank_transactions', 'bank_transfer_files',
    'payment_vouchers', 'receipt_vouchers'
    -- إضافة باقي الجداول
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_update LOOP
    EXECUTE format('
      ALTER TABLE %I 
      ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
    ', table_name);
    
    -- إنشاء فهرس
    EXECUTE format('
      CREATE INDEX IF NOT EXISTS idx_%s_tenant_id 
      ON %I(tenant_id);
    ', table_name, table_name);
  END LOOP;
END $$;

-- 3. إنشاء فهارس مركبة للأداء
CREATE INDEX idx_beneficiaries_tenant_status ON beneficiaries(tenant_id, status);
CREATE INDEX idx_properties_tenant_status ON properties(tenant_id, status);
CREATE INDEX idx_contracts_tenant_status ON contracts(tenant_id, status);
CREATE INDEX idx_payments_tenant_date ON rental_payments(tenant_id, payment_date);
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, entry_date);
CREATE INDEX idx_distributions_tenant_fiscal ON distributions(tenant_id, fiscal_year_id);
```

## 4.3 الدوال المساعدة

### 4.3.1 دالة استخراج tenant_id للمستخدم الحالي
```sql
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM tenant_users 
  WHERE user_id = auth.uid() 
    AND status = 'active'
  LIMIT 1;
$$;
```

### 4.3.2 دالة التحقق من انتماء المستخدم للمشترك
```sql
CREATE OR REPLACE FUNCTION user_belongs_to_tenant(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM tenant_users 
    WHERE user_id = auth.uid() 
      AND tenant_id = p_tenant_id
      AND status = 'active'
  );
$$;
```

### 4.3.3 دالة التحقق من Super Admin
```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
  );
$$;
```

### 4.3.4 دالة التحقق من حدود الخطة
```sql
CREATE OR REPLACE FUNCTION check_tenant_limit(
  p_tenant_id UUID,
  p_resource_type TEXT  -- 'beneficiaries', 'properties', 'users', 'storage'
)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INTEGER,
  max_allowed INTEGER,
  percentage_used NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current INTEGER;
  v_max INTEGER;
BEGIN
  -- جلب الحد الأقصى من الخطة
  SELECT 
    CASE p_resource_type
      WHEN 'beneficiaries' THEN t.max_beneficiaries
      WHEN 'properties' THEN t.max_properties
      WHEN 'users' THEN t.max_users
      WHEN 'storage' THEN t.max_storage_mb
    END
  INTO v_max
  FROM tenants t
  WHERE t.id = p_tenant_id;
  
  -- جلب العدد الحالي
  SELECT 
    CASE p_resource_type
      WHEN 'beneficiaries' THEN t.current_beneficiaries
      WHEN 'properties' THEN t.current_properties
      WHEN 'users' THEN t.current_users
      WHEN 'storage' THEN t.current_storage_mb
    END
  INTO v_current
  FROM tenants t
  WHERE t.id = p_tenant_id;
  
  RETURN QUERY SELECT 
    (v_max = -1 OR v_current < v_max) AS allowed,
    v_current AS current_count,
    v_max AS max_allowed,
    CASE WHEN v_max > 0 THEN (v_current::NUMERIC / v_max * 100) ELSE 0 END AS percentage_used;
END;
$$;
```

### 4.3.5 دالة تحديث عدادات المشترك
```sql
CREATE OR REPLACE FUNCTION update_tenant_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'beneficiaries' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE tenants SET current_beneficiaries = current_beneficiaries + 1 
      WHERE id = NEW.tenant_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE tenants SET current_beneficiaries = current_beneficiaries - 1 
      WHERE id = OLD.tenant_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'properties' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE tenants SET current_properties = current_properties + 1 
      WHERE id = NEW.tenant_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE tenants SET current_properties = current_properties - 1 
      WHERE id = OLD.tenant_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- تطبيق التريجر
CREATE TRIGGER trigger_update_beneficiaries_counter
  AFTER INSERT OR DELETE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_tenant_counters();

CREATE TRIGGER trigger_update_properties_counter
  AFTER INSERT OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_tenant_counters();
```

---

# 5. الأمان والعزل

## 5.1 سياسات RLS الجديدة

### 5.1.1 نمط السياسة الموحد
```sql
-- نمط موحد لجميع الجداول
-- يضمن أن المستخدم يرى فقط بيانات المشترك الذي ينتمي إليه

-- 1. سياسة للقراءة
CREATE POLICY "tenant_isolation_select" ON [table_name]
FOR SELECT
TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin()
);

-- 2. سياسة للإضافة
CREATE POLICY "tenant_isolation_insert" ON [table_name]
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = get_user_tenant_id()
);

-- 3. سياسة للتحديث
CREATE POLICY "tenant_isolation_update" ON [table_name]
FOR UPDATE
TO authenticated
USING (tenant_id = get_user_tenant_id())
WITH CHECK (tenant_id = get_user_tenant_id());

-- 4. سياسة للحذف
CREATE POLICY "tenant_isolation_delete" ON [table_name]
FOR DELETE
TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  AND is_admin_or_nazer()
);
```

### 5.1.2 سكريبت تطبيق السياسات على جميع الجداول
```sql
-- ملف: migrations/002_apply_tenant_rls_policies.sql

DO $$
DECLARE
  table_name TEXT;
  tables_with_tenant_id TEXT[] := ARRAY[
    'beneficiaries', 'properties', 'contracts', 'rental_payments',
    'journal_entries', 'accounts', 'distributions', 'loans', 
    'payments', 'invoices', 'documents', 'families', 'funds',
    'notifications', 'bank_accounts', 'property_units'
    -- ... باقي الجداول
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_with_tenant_id LOOP
    -- حذف السياسات القديمة
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_select" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_insert" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_update" ON %I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_delete" ON %I', table_name);
    
    -- إنشاء السياسات الجديدة
    EXECUTE format('
      CREATE POLICY "tenant_isolation_select" ON %I
      FOR SELECT TO authenticated
      USING (tenant_id = get_user_tenant_id() OR is_super_admin())
    ', table_name);
    
    EXECUTE format('
      CREATE POLICY "tenant_isolation_insert" ON %I
      FOR INSERT TO authenticated
      WITH CHECK (tenant_id = get_user_tenant_id())
    ', table_name);
    
    EXECUTE format('
      CREATE POLICY "tenant_isolation_update" ON %I
      FOR UPDATE TO authenticated
      USING (tenant_id = get_user_tenant_id())
      WITH CHECK (tenant_id = get_user_tenant_id())
    ', table_name);
    
    EXECUTE format('
      CREATE POLICY "tenant_isolation_delete" ON %I
      FOR DELETE TO authenticated
      USING (tenant_id = get_user_tenant_id() AND is_admin_or_nazer())
    ', table_name);
  END LOOP;
END $$;
```

### 5.1.3 سياسات خاصة لجداول النظام
```sql
-- جدول المشتركين: يراه Super Admin فقط
CREATE POLICY "tenants_super_admin_only" ON tenants
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- جدول خطط الاشتراك: قراءة للجميع، تعديل للـ Super Admin
CREATE POLICY "plans_read_all" ON subscription_plans
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "plans_admin_modify" ON subscription_plans
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- جدول مستخدمي المشترك
CREATE POLICY "tenant_users_own_tenant" ON tenant_users
FOR SELECT
TO authenticated
USING (
  tenant_id = get_user_tenant_id() 
  OR user_id = auth.uid()
  OR is_super_admin()
);

CREATE POLICY "tenant_users_admin_modify" ON tenant_users
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND is_admin_or_nazer())
  OR is_super_admin()
);
```

## 5.2 طبقات الأمان

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           طبقات الأمان (4 طبقات)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  الطبقة 1: التحقق من URL (Middleware)                                   │
│  ════════════════════════════════════                                   │
│  • استخراج slug من URL                                                  │
│  • التحقق من وجود المشترك                                               │
│  • التحقق من حالة الاشتراك (active, not expired)                        │
│  • رفض الطلب إذا لم يتحقق أي شرط                                        │
│                          │                                              │
│                          ▼                                              │
│  الطبقة 2: التحقق من الجلسة (Context)                                   │
│  ═════════════════════════════════════                                  │
│  • التحقق من تسجيل دخول المستخدم                                        │
│  • التحقق من انتماء المستخدم للمشترك                                    │
│  • تحميل أدوار وصلاحيات المستخدم                                        │
│  • تخزين tenant_id في Context                                           │
│                          │                                              │
│                          ▼                                              │
│  الطبقة 3: التحقق من الصلاحيات (Hooks/Services)                         │
│  ══════════════════════════════════════════════                         │
│  • التحقق من صلاحية الوصول للعملية المطلوبة                             │
│  • التحقق من حدود الخطة (قبل الإضافة)                                   │
│  • تمرير tenant_id مع كل استعلام                                        │
│                          │                                              │
│                          ▼                                              │
│  الطبقة 4: التحقق من قاعدة البيانات (RLS)                               │
│  ════════════════════════════════════════                               │
│  • RLS يضمن عدم الوصول لبيانات مشترك آخر                                │
│  • حتى لو تم تجاوز الطبقات السابقة                                      │
│  • الطبقة الأخيرة والأهم                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 5.3 سجل التدقيق

```sql
-- جدول سجل عمليات المشتركين
CREATE TABLE public.tenant_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- تفاصيل العملية
  action TEXT NOT NULL,                         -- create, update, delete, login, etc.
  resource_type TEXT NOT NULL,                  -- beneficiary, property, etc.
  resource_id UUID,
  
  -- البيانات
  old_values JSONB,
  new_values JSONB,
  
  -- معلومات الطلب
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- التتبع
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهارس للبحث السريع
CREATE INDEX idx_tenant_audit_tenant_id ON tenant_audit_logs(tenant_id);
CREATE INDEX idx_tenant_audit_user_id ON tenant_audit_logs(user_id);
CREATE INDEX idx_tenant_audit_action ON tenant_audit_logs(action);
CREATE INDEX idx_tenant_audit_created_at ON tenant_audit_logs(created_at);

-- دالة تسجيل العمليات
CREATE OR REPLACE FUNCTION log_tenant_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO tenant_audit_logs (
    tenant_id, user_id, action, resource_type, 
    resource_id, old_values, new_values
  ) VALUES (
    get_user_tenant_id(), auth.uid(), p_action, p_resource_type,
    p_resource_id, p_old_values, p_new_values
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;
```

---

# 6. الأداء والفهرسة

## 6.1 استراتيجية الفهرسة

### 6.1.1 فهارس مركبة لكل جدول
```sql
-- الفهارس المركبة تضمن أداء عالي مع tenant_id

-- المستفيدين
CREATE INDEX idx_beneficiaries_tenant_status ON beneficiaries(tenant_id, status);
CREATE INDEX idx_beneficiaries_tenant_category ON beneficiaries(tenant_id, category);
CREATE INDEX idx_beneficiaries_tenant_family ON beneficiaries(tenant_id, family_id);
CREATE INDEX idx_beneficiaries_tenant_created ON beneficiaries(tenant_id, created_at DESC);

-- العقارات
CREATE INDEX idx_properties_tenant_status ON properties(tenant_id, status);
CREATE INDEX idx_properties_tenant_type ON properties(tenant_id, property_type);
CREATE INDEX idx_properties_tenant_city ON properties(tenant_id, city);

-- العقود
CREATE INDEX idx_contracts_tenant_status ON contracts(tenant_id, status);
CREATE INDEX idx_contracts_tenant_dates ON contracts(tenant_id, start_date, end_date);
CREATE INDEX idx_contracts_tenant_property ON contracts(tenant_id, property_id);

-- المدفوعات
CREATE INDEX idx_rental_payments_tenant_date ON rental_payments(tenant_id, payment_date DESC);
CREATE INDEX idx_rental_payments_tenant_status ON rental_payments(tenant_id, status);
CREATE INDEX idx_rental_payments_tenant_contract ON rental_payments(tenant_id, contract_id);

-- القيود اليومية
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, entry_date DESC);
CREATE INDEX idx_journal_entries_tenant_fiscal ON journal_entries(tenant_id, fiscal_year_id);
CREATE INDEX idx_journal_entries_tenant_status ON journal_entries(tenant_id, status);

-- التوزيعات
CREATE INDEX idx_distributions_tenant_fiscal ON distributions(tenant_id, fiscal_year_id);
CREATE INDEX idx_distributions_tenant_status ON distributions(tenant_id, status);
CREATE INDEX idx_distributions_tenant_date ON distributions(tenant_id, distribution_date DESC);
```

### 6.1.2 فهارس جزئية للاستعلامات الشائعة
```sql
-- فهارس جزئية للسجلات النشطة فقط (أكثر كفاءة)
CREATE INDEX idx_beneficiaries_active ON beneficiaries(tenant_id, full_name)
WHERE status = 'نشط';

CREATE INDEX idx_contracts_active ON contracts(tenant_id, end_date)
WHERE status = 'نشط';

CREATE INDEX idx_loans_active ON loans(tenant_id, remaining_balance)
WHERE status IN ('pending', 'approved', 'نشط');
```

## 6.2 تحسينات React Query

### 6.2.1 مفاتيح الاستعلام مع tenant_id
```typescript
// src/lib/query-keys-tenant.ts

export const TENANT_QUERY_KEYS = {
  // المشترك
  tenant: (slug: string) => ['tenant', slug] as const,
  tenantSettings: (tenantId: string) => ['tenant', tenantId, 'settings'] as const,
  tenantUsers: (tenantId: string) => ['tenant', tenantId, 'users'] as const,
  tenantLimits: (tenantId: string) => ['tenant', tenantId, 'limits'] as const,
  
  // البيانات المفلترة بالمشترك
  beneficiaries: (tenantId: string) => ['tenant', tenantId, 'beneficiaries'] as const,
  properties: (tenantId: string) => ['tenant', tenantId, 'properties'] as const,
  contracts: (tenantId: string) => ['tenant', tenantId, 'contracts'] as const,
  payments: (tenantId: string) => ['tenant', tenantId, 'payments'] as const,
  
  // KPIs
  dashboardKPIs: (tenantId: string) => ['tenant', tenantId, 'dashboard', 'kpis'] as const,
  
  // Super Admin
  allTenants: () => ['super-admin', 'tenants'] as const,
  tenantDetails: (tenantId: string) => ['super-admin', 'tenant', tenantId] as const,
  tenantHealth: (tenantId: string) => ['super-admin', 'tenant', tenantId, 'health'] as const,
  subscriptionPlans: () => ['super-admin', 'plans'] as const,
  billing: () => ['super-admin', 'billing'] as const,
};
```

### 6.2.2 إعدادات التخزين المؤقت
```typescript
// src/lib/query-config-tenant.ts

export const TENANT_QUERY_CONFIG = {
  // بيانات المشترك الأساسية - تخزين طويل
  tenant: {
    staleTime: 10 * 60 * 1000,      // 10 دقائق
    gcTime: 30 * 60 * 1000,         // 30 دقيقة
    refetchOnWindowFocus: false,
  },
  
  // إعدادات المشترك - تخزين متوسط
  settings: {
    staleTime: 5 * 60 * 1000,       // 5 دقائق
    gcTime: 15 * 60 * 1000,         // 15 دقيقة
  },
  
  // البيانات التشغيلية - تخزين قصير
  operational: {
    staleTime: 2 * 60 * 1000,       // 2 دقيقة
    gcTime: 10 * 60 * 1000,         // 10 دقائق
    refetchOnWindowFocus: true,
  },
  
  // الخطط والأسعار - تخزين طويل جداً
  plans: {
    staleTime: 60 * 60 * 1000,      // 1 ساعة
    gcTime: 24 * 60 * 60 * 1000,    // 24 ساعة
    refetchOnWindowFocus: false,
  },
};
```

## 6.3 الاشتراكات في الوقت الحقيقي

```typescript
// src/hooks/tenant/useTenantRealtime.ts

export function useTenantRealtime(tenantId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!tenantId) return;
    
    const channel = supabase
      .channel(`tenant-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const table = payload.table;
          
          // إبطال الكاش المناسب
          queryClient.invalidateQueries({
            queryKey: ['tenant', tenantId, table],
          });
          
          // إبطال KPIs إذا كان الجدول مؤثراً
          if (['beneficiaries', 'properties', 'payments', 'contracts'].includes(table)) {
            queryClient.invalidateQueries({
              queryKey: ['tenant', tenantId, 'dashboard', 'kpis'],
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);
}
```

---

# 7. التوجيه والمسارات

## 7.1 هيكل المسارات

```
المسارات العامة (بدون مصادقة):
├── /                           → الصفحة الرئيسية
├── /login                      → تسجيل الدخول
├── /register                   → التسجيل (إنشاء وقف جديد)
├── /pricing                    → الأسعار والخطط
└── /about                      → عن المنصة

مسارات المشترك (تتطلب مصادقة + انتماء للمشترك):
├── /:slug/                     → لوحة التحكم
├── /:slug/beneficiaries        → إدارة المستفيدين
├── /:slug/beneficiaries/:id    → تفاصيل مستفيد
├── /:slug/properties           → إدارة العقارات
├── /:slug/properties/:id       → تفاصيل عقار
├── /:slug/contracts            → إدارة العقود
├── /:slug/accounting           → المحاسبة
├── /:slug/distributions        → التوزيعات
├── /:slug/loans                → القروض
├── /:slug/reports              → التقارير
├── /:slug/archive              → الأرشيف
├── /:slug/settings             → الإعدادات
└── /:slug/users                → إدارة المستخدمين

مسارات Super Admin:
├── /super-admin/               → لوحة التحكم الرئيسية
├── /super-admin/tenants        → إدارة المشتركين
├── /super-admin/tenants/:id    → تفاصيل مشترك
├── /super-admin/plans          → إدارة الخطط
├── /super-admin/billing        → الفواتير
├── /super-admin/analytics      → التحليلات
└── /super-admin/settings       → الإعدادات
```

## 7.2 مكون TenantMiddleware

```typescript
// src/middleware/TenantMiddleware.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useTenantBySlug } from '@/hooks/tenant/useTenantBySlug';
import { TenantContext } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { TenantSuspendedPage } from '@/pages/errors/TenantSuspendedPage';
import { TenantExpiredPage } from '@/pages/errors/TenantExpiredPage';
import { TenantNotFoundPage } from '@/pages/errors/TenantNotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function TenantMiddleware() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoading: authLoading } = useAuth();
  
  const { 
    data: tenant, 
    isLoading: tenantLoading, 
    error 
  } = useTenantBySlug(slug!);
  
  // حالة التحميل
  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }
  
  // المستخدم غير مسجل
  if (!user) {
    return <Navigate to="/login" state={{ from: `/${slug}` }} replace />;
  }
  
  // المشترك غير موجود
  if (error || !tenant) {
    return <TenantNotFoundPage slug={slug!} />;
  }
  
  // المشترك معلق
  if (tenant.status === 'suspended') {
    return <TenantSuspendedPage 
      tenant={tenant} 
      reason={tenant.suspended_reason} 
    />;
  }
  
  // الاشتراك منتهي
  if (tenant.subscription_status === 'expired' || 
      (tenant.subscription_expires_at && new Date(tenant.subscription_expires_at) < new Date())) {
    return <TenantExpiredPage tenant={tenant} />;
  }
  
  // التحقق من انتماء المستخدم للمشترك
  const userBelongsToTenant = tenant.users?.some(u => u.user_id === user.id);
  if (!userBelongsToTenant) {
    return <UnauthorizedPage tenant={tenant} />;
  }
  
  // كل شيء صحيح - تمرير البيانات للسياق
  return (
    <TenantContext.Provider value={{
      tenant,
      tenantId: tenant.id,
      slug: tenant.slug,
      settings: tenant.settings,
      plan: tenant.plan,
      limits: {
        beneficiaries: { current: tenant.current_beneficiaries, max: tenant.max_beneficiaries },
        properties: { current: tenant.current_properties, max: tenant.max_properties },
        users: { current: tenant.current_users, max: tenant.max_users },
        storage: { current: tenant.current_storage_mb, max: tenant.max_storage_mb },
      },
    }}>
      <Outlet />
    </TenantContext.Provider>
  );
}
```

## 7.3 TenantContext

```typescript
// src/contexts/TenantContext.tsx

import React, { createContext, useContext } from 'react';

interface TenantLimits {
  beneficiaries: { current: number; max: number };
  properties: { current: number; max: number };
  users: { current: number; max: number };
  storage: { current: number; max: number };
}

interface TenantPlan {
  id: string;
  name: string;
  name_ar: string;
  price_monthly: number;
  features: string[];
}

interface TenantSettings {
  timezone?: string;
  language?: string;
  currency?: string;
  waqf_name?: string;
  nazer_name?: string;
  nazer_percentage?: number;
  [key: string]: any;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  name_ar?: string;
  logo_url?: string;
  status: 'active' | 'suspended' | 'deleted';
  subscription_status: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  subscription_expires_at?: string;
  [key: string]: any;
}

interface TenantContextValue {
  tenant: Tenant;
  tenantId: string;
  slug: string;
  settings: TenantSettings;
  plan: TenantPlan | null;
  limits: TenantLimits;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantMiddleware');
  }
  return context;
}

export function useTenantId() {
  const { tenantId } = useTenant();
  return tenantId;
}

export function useTenantLimits() {
  const { limits } = useTenant();
  return limits;
}

export function useCanAddResource(resourceType: keyof TenantLimits) {
  const { limits } = useTenant();
  const limit = limits[resourceType];
  
  // -1 يعني غير محدود
  if (limit.max === -1) return true;
  
  return limit.current < limit.max;
}

export { TenantContext };
```

## 7.4 تحديث App.tsx

```typescript
// src/App.tsx (الجزء المتعلق بالمسارات)

import { TenantMiddleware } from '@/middleware/TenantMiddleware';
import { SuperAdminMiddleware } from '@/middleware/SuperAdminMiddleware';

// المسارات
<Routes>
  {/* المسارات العامة */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/pricing" element={<PricingPage />} />
  
  {/* مسارات Super Admin */}
  <Route path="/super-admin" element={<SuperAdminMiddleware />}>
    <Route index element={<SuperAdminDashboard />} />
    <Route path="tenants" element={<TenantsListPage />} />
    <Route path="tenants/:id" element={<TenantDetailsPage />} />
    <Route path="plans" element={<PlansManagementPage />} />
    <Route path="billing" element={<BillingPage />} />
    <Route path="analytics" element={<AnalyticsPage />} />
    <Route path="settings" element={<SuperAdminSettingsPage />} />
  </Route>
  
  {/* مسارات المشترك */}
  <Route path="/:slug" element={<TenantMiddleware />}>
    <Route element={<MainLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="beneficiaries" element={<BeneficiariesPage />} />
      <Route path="beneficiaries/:id" element={<BeneficiaryDetailsPage />} />
      <Route path="properties" element={<PropertiesPage />} />
      <Route path="properties/:id" element={<PropertyDetailsPage />} />
      <Route path="contracts" element={<ContractsPage />} />
      <Route path="accounting" element={<AccountingPage />} />
      <Route path="distributions" element={<DistributionsPage />} />
      <Route path="loans" element={<LoansPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="archive" element={<ArchivePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="users" element={<UsersManagementPage />} />
    </Route>
  </Route>
  
  {/* صفحة 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

# 8. الاشتراكات والفوترة

## 8.1 تكامل Stripe

### 8.1.1 Edge Function لـ Webhook
```typescript
// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('tenants')
        .update({
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status === 'active' ? 'active' : 'suspended',
          subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', subscription.customer);
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('tenants')
        .update({
          subscription_status: 'cancelled',
        })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // إنشاء سجل فاتورة
      await supabase
        .from('tenant_billing')
        .insert({
          tenant_id: await getTenantIdByStripeCustomer(invoice.customer as string),
          invoice_number: invoice.number,
          invoice_date: new Date(invoice.created * 1000).toISOString(),
          due_date: new Date(invoice.due_date! * 1000).toISOString(),
          subtotal: invoice.subtotal / 100,
          tax_amount: invoice.tax ? invoice.tax / 100 : 0,
          total_amount: invoice.total / 100,
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_invoice_id: invoice.id,
        });
      
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // تعليق الاشتراك
      await supabase
        .from('tenants')
        .update({
          subscription_status: 'suspended',
          suspended_reason: 'فشل الدفع',
          suspended_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', invoice.customer);
      
      break;
    }
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function getTenantIdByStripeCustomer(customerId: string) {
  const { data } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  return data?.id;
}
```

### 8.1.2 خدمة الاشتراكات
```typescript
// src/services/subscription.service.ts

import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

export class SubscriptionService {
  private static stripe = new Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  
  // إنشاء جلسة دفع
  static async createCheckoutSession(
    tenantId: string,
    planId: string,
    billingPeriod: 'monthly' | 'yearly'
  ) {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { tenantId, planId, billingPeriod },
    });
    
    if (error) throw error;
    return data;
  }
  
  // إنشاء بوابة إدارة الاشتراك
  static async createBillingPortalSession(tenantId: string) {
    const { data, error } = await supabase.functions.invoke('create-billing-portal', {
      body: { tenantId },
    });
    
    if (error) throw error;
    return data;
  }
  
  // تغيير الخطة
  static async changePlan(tenantId: string, newPlanId: string) {
    const { data, error } = await supabase.functions.invoke('change-subscription-plan', {
      body: { tenantId, newPlanId },
    });
    
    if (error) throw error;
    return data;
  }
  
  // إلغاء الاشتراك
  static async cancelSubscription(tenantId: string) {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { tenantId },
    });
    
    if (error) throw error;
    return data;
  }
  
  // جلب الفواتير
  static async getInvoices(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_billing')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('invoice_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
  
  // جلب الخطط المتاحة
  static async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    return data;
  }
}
```

## 8.2 صفحة الأسعار

```typescript
// src/pages/public/PricingPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '@/services/subscription.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';

export function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => SubscriptionService.getPlans(),
  });
  
  const handleSelectPlan = (planId: string) => {
    navigate(`/register?plan=${planId}&billing=${billingPeriod}`);
  };
  
  return (
    <div className="container mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">اختر الخطة المناسبة لك</h1>
        <p className="text-muted-foreground text-lg mb-8">
          جميع الخطط تشمل فترة تجريبية 14 يوم مجاناً
        </p>
        
        {/* اختيار نوع الفوترة */}
        <div className="flex items-center justify-center gap-4">
          <span className={billingPeriod === 'monthly' ? 'font-bold' : ''}>شهري</span>
          <Switch
            checked={billingPeriod === 'yearly'}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
          />
          <span className={billingPeriod === 'yearly' ? 'font-bold' : ''}>
            سنوي
            <span className="text-green-500 text-sm mr-1">(خصم 20%)</span>
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans?.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.is_popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                الأكثر شيوعاً
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name_ar}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {billingPeriod === 'monthly' 
                    ? plan.price_monthly 
                    : Math.round(plan.price_yearly! / 12)}
                </span>
                <span className="text-muted-foreground"> ر.س/شهرياً</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm text-muted-foreground">
                  يُدفع {plan.price_yearly} ر.س سنوياً
                </p>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    {plan.max_beneficiaries === -1 
                      ? 'مستفيدين غير محدود' 
                      : `حتى ${plan.max_beneficiaries} مستفيد`}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    {plan.max_properties === -1 
                      ? 'عقارات غير محدودة' 
                      : `حتى ${plan.max_properties} عقار`}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>
                    {plan.max_users === -1 
                      ? 'مستخدمين غير محدود' 
                      : `حتى ${plan.max_users} مستخدم`}
                  </span>
                </li>
                {(plan.features as string[])?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={plan.is_popular ? 'default' : 'outline'}
                onClick={() => handleSelectPlan(plan.id)}
              >
                ابدأ الآن
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

# 9. لوحة Super Admin

## 9.1 هيكل الصفحات

```
src/pages/super-admin/
├── SuperAdminDashboard.tsx      # الصفحة الرئيسية
├── TenantsListPage.tsx          # قائمة المشتركين
├── TenantDetailsPage.tsx        # تفاصيل مشترك
├── PlansManagementPage.tsx      # إدارة الخطط
├── BillingPage.tsx              # الفواتير
├── AnalyticsPage.tsx            # التحليلات
└── SuperAdminSettingsPage.tsx   # الإعدادات
```

## 9.2 لوحة التحكم الرئيسية

```typescript
// src/pages/super-admin/SuperAdminDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuperAdminStats } from '@/hooks/super-admin/useSuperAdminStats';
import { useRecentTenants } from '@/hooks/super-admin/useRecentTenants';
import { useBillingOverview } from '@/hooks/super-admin/useBillingOverview';
import { TenantHealthOverview } from '@/components/super-admin/TenantHealthOverview';
import { RevenueChart } from '@/components/super-admin/RevenueChart';
import { AlertsPanel } from '@/components/super-admin/AlertsPanel';

export function SuperAdminDashboard() {
  const { stats, isLoading: statsLoading } = useSuperAdminStats();
  const { tenants, isLoading: tenantsLoading } = useRecentTenants(5);
  const { overview, isLoading: billingLoading } = useBillingOverview();
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">لوحة تحكم المسؤول</h1>
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المشتركين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalTenants || 0}</div>
            <p className="text-xs text-green-500">+{stats?.newTenantsThisMonth || 0} هذا الشهر</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">المشتركين النشطين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeTenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.trialTenants || 0} في الفترة التجريبية
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview?.monthlyRevenue?.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-green-500">
              +{overview?.revenueGrowth || 0}% عن الشهر السابق
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">الفواتير المتأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {overview?.overdueInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview?.overdueAmount?.toLocaleString()} ر.س
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* المخططات والتنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>التنبيهات</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsPanel />
          </CardContent>
        </Card>
      </div>
      
      {/* صحة المشتركين */}
      <Card>
        <CardHeader>
          <CardTitle>صحة المشتركين</CardTitle>
        </CardHeader>
        <CardContent>
          <TenantHealthOverview />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 9.3 قائمة المشتركين

```typescript
// src/pages/super-admin/TenantsListPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllTenants } from '@/hooks/super-admin/useAllTenants';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Search } from 'lucide-react';

export function TenantsListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { tenants, isLoading } = useAllTenants({
    search,
    status: statusFilter,
  });
  
  const columns = [
    {
      accessorKey: 'name_ar',
      header: 'اسم الوقف',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.logo_url && (
            <img 
              src={row.original.logo_url} 
              alt={row.original.name} 
              className="h-8 w-8 rounded-full"
            />
          )}
          <div>
            <div className="font-medium">{row.original.name_ar || row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.slug}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'owner_email',
      header: 'البريد الإلكتروني',
    },
    {
      accessorKey: 'plan',
      header: 'الخطة',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.plan?.name_ar || 'بدون خطة'}</Badge>
      ),
    },
    {
      accessorKey: 'subscription_status',
      header: 'حالة الاشتراك',
      cell: ({ row }) => {
        const statusMap = {
          trial: { label: 'تجريبي', variant: 'secondary' },
          active: { label: 'نشط', variant: 'success' },
          suspended: { label: 'معلق', variant: 'warning' },
          cancelled: { label: 'ملغي', variant: 'destructive' },
          expired: { label: 'منتهي', variant: 'destructive' },
        };
        const status = statusMap[row.original.subscription_status] || { label: 'غير معروف', variant: 'secondary' };
        return <Badge variant={status.variant as any}>{status.label}</Badge>;
      },
    },
    {
      accessorKey: 'stats',
      header: 'الاستخدام',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.current_beneficiaries}/{row.original.max_beneficiaries} مستفيد</div>
          <div className="text-muted-foreground">
            {row.original.current_properties}/{row.original.max_properties} عقار
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'تاريخ التسجيل',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('ar-SA'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/super-admin/tenants/${row.original.id}`)}>
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/${row.original.slug}`, '_blank')}>
              فتح التطبيق
            </DropdownMenuItem>
            <DropdownMenuItem>تغيير الخطة</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">تعليق الاشتراك</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المشتركين</h1>
        <Button onClick={() => navigate('/super-admin/tenants/new')}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مشترك
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">جميع الحالات</option>
          <option value="trial">تجريبي</option>
          <option value="active">نشط</option>
          <option value="suspended">معلق</option>
          <option value="expired">منتهي</option>
        </select>
      </div>
      
      <DataTable columns={columns} data={tenants || []} isLoading={isLoading} />
    </div>
  );
}
```

---

# 10. الهيكل الملفي

## 10.1 الملفات الجديدة (ملخص)

```
src/
├── contexts/
│   └── TenantContext.tsx                    # سياق المشترك
│
├── middleware/
│   ├── TenantMiddleware.tsx                 # التحقق من المشترك
│   └── SuperAdminMiddleware.tsx             # التحقق من Super Admin
│
├── hooks/
│   └── tenant/
│       ├── index.ts                         # تصدير جميع الـ hooks
│       ├── useTenant.ts                     # جلب بيانات المشترك الحالي
│       ├── useTenantBySlug.ts               # جلب مشترك بالـ slug
│       ├── useTenantUsers.ts                # مستخدمي المشترك
│       ├── useTenantSettings.ts             # إعدادات المشترك
│       ├── useTenantLimits.ts               # حدود الخطة
│       ├── useTenantRealtime.ts             # اشتراكات Realtime
│       ├── useCanAddResource.ts             # التحقق من الحدود
│       └── useTenantHealth.ts               # صحة المشترك
│   └── super-admin/
│       ├── index.ts
│       ├── useAllTenants.ts                 # جميع المشتركين
│       ├── useTenantDetails.ts              # تفاصيل مشترك
│       ├── useSuperAdminStats.ts            # إحصائيات عامة
│       ├── useBillingOverview.ts            # ملخص الفوترة
│       └── useRecentTenants.ts              # المشتركين الجدد
│
├── services/
│   ├── tenant.service.ts                    # خدمة المشتركين
│   ├── subscription.service.ts              # خدمة الاشتراكات
│   ├── billing.service.ts                   # خدمة الفوترة
│   ├── super-admin.service.ts               # خدمة Super Admin
│   └── tenant-health.service.ts             # خدمة المراقبة
│
├── pages/
│   ├── public/
│   │   ├── LandingPage.tsx                  # الصفحة الرئيسية
│   │   ├── PricingPage.tsx                  # الأسعار
│   │   └── RegisterPage.tsx                 # التسجيل
│   ├── super-admin/
│   │   ├── SuperAdminDashboard.tsx          # لوحة التحكم
│   │   ├── TenantsListPage.tsx              # قائمة المشتركين
│   │   ├── TenantDetailsPage.tsx            # تفاصيل مشترك
│   │   ├── PlansManagementPage.tsx          # إدارة الخطط
│   │   ├── BillingPage.tsx                  # الفواتير
│   │   ├── AnalyticsPage.tsx                # التحليلات
│   │   └── SuperAdminSettingsPage.tsx       # الإعدادات
│   └── errors/
│       ├── TenantNotFoundPage.tsx           # المشترك غير موجود
│       ├── TenantSuspendedPage.tsx          # المشترك معلق
│       ├── TenantExpiredPage.tsx            # الاشتراك منتهي
│       └── UnauthorizedPage.tsx             # غير مصرح
│
├── components/
│   ├── tenant/
│   │   ├── TenantSwitcher.tsx               # تبديل المشتركين
│   │   ├── PlanLimitWarning.tsx             # تحذير الحدود
│   │   ├── SubscriptionCard.tsx             # بطاقة الاشتراك
│   │   └── TenantLogo.tsx                   # شعار المشترك
│   └── super-admin/
│       ├── TenantHealthOverview.tsx         # صحة المشتركين
│       ├── RevenueChart.tsx                 # مخطط الإيرادات
│       ├── AlertsPanel.tsx                  # لوحة التنبيهات
│       ├── TenantActionsDropdown.tsx        # إجراءات المشترك
│       └── PlanComparisonTable.tsx          # مقارنة الخطط
│
├── lib/
│   ├── query-keys-tenant.ts                 # مفاتيح الاستعلام
│   ├── query-config-tenant.ts               # إعدادات التخزين
│   └── tenant-utils.ts                      # دوال مساعدة
│
└── types/
    └── tenant.ts                            # أنواع TypeScript

supabase/
└── functions/
    ├── stripe-webhook/
    │   └── index.ts                         # Webhook لـ Stripe
    ├── create-checkout-session/
    │   └── index.ts                         # إنشاء جلسة دفع
    ├── create-billing-portal/
    │   └── index.ts                         # بوابة الفوترة
    ├── tenant-health-check/
    │   └── index.ts                         # فحص صحة المشتركين
    └── tenant-cleanup/
        └── index.ts                         # تنظيف المشتركين المحذوفين
```

## 10.2 ملخص عدد الملفات

| النوع | العدد |
|-------|-------|
| Contexts | 1 |
| Middleware | 2 |
| Hooks (tenant) | 9 |
| Hooks (super-admin) | 6 |
| Services | 5 |
| Pages (public) | 3 |
| Pages (super-admin) | 7 |
| Pages (errors) | 4 |
| Components (tenant) | 4 |
| Components (super-admin) | 5 |
| Lib utilities | 3 |
| Types | 1 |
| Edge Functions | 5 |
| **الإجمالي** | **~55 ملف جديد** |

---

# 11. الجدول الزمني

## 11.1 المراحل التفصيلية

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    الجدول الزمني (4 أسابيع)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  الأسبوع 1: البنية التحتية                                              │
│  ════════════════════════                                               │
│  ├── يوم 1-2: إنشاء الجداول الجديدة                                    │
│  │   • tenants, subscription_plans, tenant_users                       │
│  │   • tenant_settings, tenant_billing                                 │
│  │                                                                      │
│  ├── يوم 3-4: إضافة tenant_id للجداول الموجودة                         │
│  │   • migrations للـ 50+ جدول                                         │
│  │   • إنشاء الفهارس المركبة                                           │
│  │                                                                      │
│  └── يوم 5: إنشاء الدوال المساعدة                                      │
│      • get_user_tenant_id()                                            │
│      • user_belongs_to_tenant()                                        │
│      • is_super_admin()                                                │
│      • check_tenant_limit()                                            │
│                                                                         │
│  الأسبوع 2: الأمان والتوجيه                                             │
│  ═════════════════════════                                              │
│  ├── يوم 1-2: تحديث سياسات RLS                                         │
│  │   • تطبيق النمط الموحد على 724 سياسة                                │
│  │   • اختبار العزل                                                    │
│  │                                                                      │
│  ├── يوم 3: إنشاء Contexts و Middleware                                │
│  │   • TenantContext                                                   │
│  │   • TenantMiddleware                                                │
│  │   • SuperAdminMiddleware                                            │
│  │                                                                      │
│  ├── يوم 4: تحديث التوجيه                                              │
│  │   • تعديل App.tsx                                                   │
│  │   • إنشاء صفحات الأخطاء                                             │
│  │                                                                      │
│  └── يوم 5: تحديث الخدمات والـ Hooks                                   │
│      • إضافة tenantId لجميع الخدمات                                    │
│      • تحديث مفاتيح React Query                                        │
│                                                                         │
│  الأسبوع 3: الاشتراكات والفوترة                                         │
│  ════════════════════════════                                           │
│  ├── يوم 1-2: تكامل Stripe                                             │
│  │   • إنشاء Edge Functions                                            │
│  │   • webhook معالجة الأحداث                                          │
│  │                                                                      │
│  ├── يوم 3: خدمات الاشتراك                                             │
│  │   • SubscriptionService                                             │
│  │   • BillingService                                                  │
│  │                                                                      │
│  └── يوم 4-5: صفحات الاشتراك                                           │
│      • PricingPage                                                     │
│      • RegisterPage (مع اختيار الخطة)                                  │
│      • صفحة إدارة الاشتراك                                             │
│                                                                         │
│  الأسبوع 4: Super Admin والاختبار                                       │
│  ════════════════════════════════                                       │
│  ├── يوم 1-2: لوحة Super Admin                                         │
│  │   • SuperAdminDashboard                                             │
│  │   • TenantsListPage                                                 │
│  │   • TenantDetailsPage                                               │
│  │                                                                      │
│  ├── يوم 3: إدارة الخطط والفوترة                                       │
│  │   • PlansManagementPage                                             │
│  │   • BillingPage                                                     │
│  │                                                                      │
│  └── يوم 4-5: الاختبار والتوثيق                                        │
│      • اختبار شامل للعزل                                               │
│      • اختبار الأداء                                                   │
│      • توثيق النشر                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 12. الاختبار والجودة

## 12.1 اختبارات العزل

```typescript
// tests/tenant-isolation.test.ts

describe('Tenant Isolation Tests', () => {
  const tenant1 = { id: 'tenant-1', slug: 'waqf-ahmed' };
  const tenant2 = { id: 'tenant-2', slug: 'waqf-mohammed' };
  
  test('User from tenant1 cannot see tenant2 beneficiaries', async () => {
    // تسجيل الدخول كمستخدم من tenant1
    await loginAs(tenant1.userId);
    
    // محاولة جلب مستفيدي tenant2
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('tenant_id', tenant2.id);
    
    // يجب أن تكون النتيجة فارغة بسبب RLS
    expect(data).toHaveLength(0);
  });
  
  test('User cannot insert data for another tenant', async () => {
    await loginAs(tenant1.userId);
    
    const { error } = await supabase
      .from('beneficiaries')
      .insert({
        tenant_id: tenant2.id,  // محاولة إدخال لمشترك آخر
        full_name: 'Test',
        // ...
      });
    
    expect(error).not.toBeNull();
    expect(error.code).toBe('42501');  // RLS violation
  });
  
  test('Super Admin can see all tenants data', async () => {
    await loginAsSuperAdmin();
    
    const { data } = await supabase
      .from('beneficiaries')
      .select('tenant_id');
    
    const uniqueTenants = [...new Set(data.map(d => d.tenant_id))];
    expect(uniqueTenants.length).toBeGreaterThan(1);
  });
});
```

## 12.2 اختبارات الأداء

```typescript
// tests/performance.test.ts

describe('Performance Tests', () => {
  test('Query with tenant_id index should be fast', async () => {
    const start = performance.now();
    
    await supabase
      .from('beneficiaries')
      .select('*')
      .eq('tenant_id', 'test-tenant-id')
      .limit(100);
    
    const duration = performance.now() - start;
    
    // يجب أن تكون أقل من 100ms
    expect(duration).toBeLessThan(100);
  });
  
  test('Dashboard KPIs should load within 2 seconds', async () => {
    const start = performance.now();
    
    await Promise.all([
      supabase.from('beneficiaries').select('count', { count: 'exact' }),
      supabase.from('properties').select('count', { count: 'exact' }),
      supabase.from('contracts').select('count', { count: 'exact' }),
    ]);
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
```

---

# 13. النشر والصيانة

## 13.1 خطوات النشر

```
1. إنشاء نسخة احتياطية كاملة من قاعدة البيانات
2. تنفيذ migrations بالترتيب:
   a. 001_create_tenant_tables.sql
   b. 002_add_tenant_id_columns.sql
   c. 003_create_tenant_functions.sql
   d. 004_apply_tenant_rls.sql
   e. 005_create_indexes.sql

3. ترحيل البيانات الموجودة:
   - إنشاء مشترك افتراضي للبيانات الحالية
   - تعيين tenant_id لجميع السجلات الموجودة

4. نشر Edge Functions:
   - stripe-webhook
   - create-checkout-session
   - create-billing-portal

5. تحديث إعدادات Stripe:
   - إضافة webhook URL
   - إنشاء المنتجات والأسعار

6. نشر الواجهة الأمامية

7. اختبار شامل في بيئة الإنتاج
```

## 13.2 المراقبة والصيانة

```typescript
// جدولة المهام الدورية

// 1. فحص صحة المشتركين - كل ساعة
cron('0 * * * *', async () => {
  await TenantHealthService.checkAllTenants();
});

// 2. تنظيف الجلسات المنتهية - يومياً
cron('0 3 * * *', async () => {
  await cleanupExpiredSessions();
});

// 3. تنبيه الاشتراكات المنتهية قريباً - يومياً
cron('0 9 * * *', async () => {
  await notifyExpiringSubscriptions(7); // 7 أيام قبل الانتهاء
});

// 4. تقرير الإيرادات - أسبوعياً
cron('0 10 * * 1', async () => {
  await generateWeeklyRevenueReport();
});
```

---

# ملحق: القرارات التقنية

| القرار | الخيارات | المختار | السبب |
|--------|----------|---------|-------|
| نموذج العزل | Multi-DB / Schema / Row | Row (RLS) | تكلفة أقل، صيانة أسهل |
| التوجيه | Subdomain / Path | Path | متوافق مع Lovable |
| الفوترة | Stripe / Paddle / Custom | Stripe | موثوق، API قوي |
| التخزين المؤقت | Redis / React Query | React Query | كافٍ، أسهل |
| المراقبة | Custom / External | Custom | متكامل مع النظام |

---

**نهاية الوثيقة**

الإصدار: 1.0.0
آخر تحديث: 2025-12-10
