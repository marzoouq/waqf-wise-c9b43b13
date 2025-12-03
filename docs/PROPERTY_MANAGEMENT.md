# 🏢 نظام إدارة العقارات | Property Management

**الإصدار:** 2.6.5 | **آخر تحديث:** 2025-12-03

---

## 📋 نظرة عامة

نظام شامل لإدارة جميع الأصول العقارية التابعة للوقف، يشمل:
- إدارة العقارات والوحدات
- إدارة العقود والإيجارات
- متابعة الصيانة
- التكامل المحاسبي الكامل
- استخراج بيانات العقود بالذكاء الاصطناعي

---

## 🏗️ هيكل قاعدة البيانات

### جدول العقارات

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR, -- building, land, apartment, shop, farm
  address TEXT,
  city VARCHAR,
  district VARCHAR,
  size_sqm DECIMAL(10,2),
  deed_number VARCHAR,
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  current_value DECIMAL(12,2),
  occupancy_status VARCHAR, -- occupied, vacant, maintenance
  tax_percentage DECIMAL(5,2) DEFAULT 15,
  account_id UUID REFERENCES accounts(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### جدول الوحدات

```sql
CREATE TABLE property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  unit_number VARCHAR NOT NULL,
  unit_type VARCHAR, -- apartment, office, shop, warehouse
  floor_number INTEGER,
  size_sqm DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  status VARCHAR DEFAULT 'vacant', -- vacant, occupied, maintenance
  monthly_rent DECIMAL(10,2),
  annual_rent DECIMAL(12,2),
  notes TEXT
);
```

### جدول العقود

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR UNIQUE,
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES property_units(id),
  tenant_name VARCHAR NOT NULL,
  tenant_id_number VARCHAR,
  tenant_phone VARCHAR,
  tenant_email VARCHAR,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2),
  annual_rent DECIMAL(12,2),
  payment_frequency VARCHAR DEFAULT 'monthly',
  deposit_amount DECIMAL(10,2),
  status VARCHAR DEFAULT 'active', -- draft, active, expired, terminated
  auto_renew BOOLEAN DEFAULT false,
  renewal_terms TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### جدول الإيجارات

```sql
CREATE TABLE rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id),
  period_start DATE,
  period_end DATE,
  amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(12,2),
  due_date DATE,
  paid_date DATE,
  payment_method VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending, paid, overdue, partial
  invoice_id UUID,
  receipt_id UUID,
  journal_entry_id UUID,
  notes TEXT
);
```

---

## 🔄 أنواع العقارات

| النوع | الرمز | الوصف |
|-------|-------|-------|
| مبنى | `building` | مبنى سكني أو تجاري |
| أرض | `land` | أرض فضاء |
| شقة | `apartment` | وحدة سكنية |
| محل | `shop` | محل تجاري |
| مزرعة | `farm` | أرض زراعية |

---

## 💰 التكامل المحاسبي

### تسجيل دفعة إيجار

عند تسجيل دفعة إيجار، يتم تلقائياً:

1. **حساب الضريبة** (15% VAT)
2. **إنشاء فاتورة ZATCA** مع QR Code
3. **إنشاء سند قبض**
4. **إنشاء قيد محاسبي**

```typescript
// مثال: إيجار 10,000 ر.س
const processRentalPayment = async (payment: RentalPayment) => {
  const taxRate = property.tax_percentage / 100; // 0.15
  const taxAmount = payment.amount * taxRate; // 1,500
  const netAmount = payment.amount; // 10,000
  const totalAmount = payment.amount + taxAmount; // 11,500

  // إنشاء القيد المحاسبي
  // مدين: النقدية 11,500
  // دائن: إيرادات الإيجار 10,000
  // دائن: ضريبة القيمة المضافة 1,500
};
```

### القيد المحاسبي للإيجار

| الحساب | مدين | دائن |
|--------|------|------|
| النقدية / البنك | 11,500 | - |
| إيرادات الإيجار | - | 10,000 |
| ضريبة القيمة المضافة المستحقة | - | 1,500 |

---

## 🤖 استخراج بيانات العقود بالـ AI

### Edge Function: extract-contract-data

```typescript
// استخراج البيانات من نص العقد
const extractedData = await supabase.functions.invoke('extract-contract-data', {
  body: { contractText: 'نص العقد...' }
});

// البيانات المستخرجة
{
  tenant_name: 'اسم المستأجر',
  tenant_id: 'رقم الهوية',
  tenant_phone: 'رقم الجوال',
  property_address: 'العنوان',
  monthly_rent: 5000,
  start_date: '2025-01-01',
  end_date: '2026-01-01',
  deposit: 5000
}
```

### استخدام الـ AI Extractor

```tsx
import { AIContractExtractor } from '@/components/contracts/AIContractExtractor';

<AIContractExtractor
  onDataExtracted={(data) => {
    // تعبئة النموذج بالبيانات المستخرجة
    form.reset(data);
  }}
/>
```

---

## ⏰ تنبيهات تجديد العقود

### Edge Function: contract-renewal-alerts

تعمل يومياً للتحقق من:
- عقود تنتهي خلال 30 يوم
- عقود تنتهي خلال 60 يوم
- عقود منتهية تحتاج إجراء

```typescript
// cron: كل يوم الساعة 8 صباحاً
export const contractRenewalAlerts = async () => {
  // عقود تنتهي قريباً
  const { data: expiringContracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('status', 'active')
    .lte('end_date', addDays(new Date(), 30));

  for (const contract of expiringContracts) {
    await sendNotification({
      type: 'contract_expiring',
      recipientRole: 'nazer',
      data: contract
    });
  }
};
```

---

## 📊 التقارير العقارية

### KPIs الرئيسية

| المؤشر | الوصف |
|--------|-------|
| معدل الإشغال | نسبة الوحدات المؤجرة |
| العائد السنوي | إجمالي الإيجارات السنوية |
| المتأخرات | إيجارات غير مسددة |
| العقود المنتهية | عقود تحتاج تجديد |

### تقرير الإشغال

```sql
SELECT 
  p.name as property_name,
  COUNT(pu.id) as total_units,
  COUNT(CASE WHEN pu.status = 'occupied' THEN 1 END) as occupied,
  COUNT(CASE WHEN pu.status = 'vacant' THEN 1 END) as vacant,
  ROUND(
    COUNT(CASE WHEN pu.status = 'occupied' THEN 1 END)::numeric / 
    COUNT(pu.id) * 100, 2
  ) as occupancy_rate
FROM properties p
LEFT JOIN property_units pu ON pu.property_id = p.id
GROUP BY p.id, p.name;
```

### تقرير العوائد

```sql
SELECT 
  DATE_TRUNC('month', rp.period_start) as month,
  SUM(rp.amount) as rent_revenue,
  SUM(rp.tax_amount) as tax_collected,
  SUM(rp.total_amount) as total_collected
FROM rental_payments rp
WHERE rp.status = 'paid'
GROUP BY DATE_TRUNC('month', rp.period_start)
ORDER BY month DESC;
```

---

## 🔧 إدارة الصيانة

### جدول طلبات الصيانة

```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES property_units(id),
  request_type VARCHAR, -- routine, emergency, repair
  description TEXT,
  priority VARCHAR DEFAULT 'normal',
  status VARCHAR DEFAULT 'pending',
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  assigned_to VARCHAR,
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMP DEFAULT now()
);
```

### أنواع الصيانة

| النوع | الوصف | الأولوية |
|-------|-------|----------|
| دورية | صيانة وقائية منتظمة | عادية |
| إصلاح | إصلاح أعطال | متوسطة |
| طارئة | حالات عاجلة | عالية |

---

## 🔐 سياسات RLS

```sql
-- ورثة الوقف يرون جميع العقارات
CREATE POLICY "waqf_heirs_view_all_properties"
ON properties FOR SELECT
USING (
  public.is_waqf_heir(auth.uid())
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'admin')
);

-- المستأجرين يرون عقودهم فقط
CREATE POLICY "tenants_view_own_contracts"
ON contracts FOR SELECT
USING (
  tenant_id_number = (
    SELECT national_id FROM beneficiaries WHERE user_id = auth.uid()
  )
);
```

---

## 💻 الـ Hooks المستخدمة

```typescript
// إدارة العقارات
import { useProperties, useProperty } from '@/hooks/properties/useProperties';

const { data: properties } = useProperties();
const { data: property } = useProperty(propertyId);

// إدارة العقود
import { useContracts, useContractDetails } from '@/hooks/contracts/useContracts';

const { data: contracts } = useContracts({ propertyId });
const { data: contract } = useContractDetails(contractId);

// إدارة الإيجارات
import { useRentalPayments } from '@/hooks/useRentalPayments';

const { data: payments, createPayment } = useRentalPayments(contractId);
```

---

## 🖥️ واجهات المستخدم

### الصفحات الرئيسية
- `src/pages/Properties.tsx` - قائمة العقارات
- `src/pages/Contracts.tsx` - إدارة العقود
- `src/components/properties/PropertyDetails.tsx` - تفاصيل العقار

### المكونات
- `PropertyCard` - بطاقة عرض العقار
- `ContractDialog` - نموذج إضافة/تعديل عقد
- `RentalPaymentForm` - نموذج تسجيل دفعة
- `AIContractExtractor` - استخراج بيانات بالـ AI
- `PropertyStatsCards` - إحصائيات العقارات

---

## 📈 الإحصائيات الحالية

| المقياس | القيمة |
|---------|--------|
| إجمالي العقارات | 3+ |
| الوحدات المؤجرة | - |
| العقود النشطة | - |
| العائد الشهري | - |

---

## 📝 ملاحظات مهمة

1. **التكامل مع ZATCA** - جميع الفواتير تتضمن QR Code متوافق
2. **الضريبة** - يتم حساب VAT 15% تلقائياً
3. **القيود التلقائية** - كل دفعة تُنشئ قيد محاسبي
4. **التنبيهات** - إشعارات تلقائية لتجديد العقود

---

**الحالة:** ✅ النظام يعمل بكفاءة
