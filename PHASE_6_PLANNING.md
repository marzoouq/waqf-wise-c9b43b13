# المرحلة السادسة - إدارة العقود والإيجارات المتقدمة

## 📋 نظرة عامة

المرحلة السادسة تركز على بناء نظام شامل لإدارة العقارات والعقود والإيجارات، مع تكامل كامل مع النظام المحاسبي والإشعارات.

---

## 🎯 الأهداف الرئيسية

### 1. نظام إدارة العقود الشامل
- إنشاء وتعديل وحذف العقود
- أنواع عقود متعددة (إيجار، صيانة، استثمار)
- حالات العقود (نشط، منتهي، معلق، ملغي)
- مرفقات العقود (نسخة PDF، مستندات داعمة)

### 2. متابعة الإيجارات والمتأخرات
- جدولة الدفعات الشهرية/السنوية
- تتبع المدفوعات والمتأخرات
- حساب تلقائي للغرامات
- تذكيرات تلقائية للمستأجرين

### 3. جدولة الصيانة الدورية
- إنشاء جداول صيانة وقائية
- تسجيل الصيانة الطارئة
- متابعة تكاليف الصيانة
- تقارير الصيانة الشهرية

### 4. تنبيهات تجديد العقود
- إشعارات قبل 90/60/30 يوم
- إشعارات للناظر والمستأجر
- قوالب تجديد تلقائية
- تاريخ العقود المنتهية

### 5. تقارير العوائد العقارية
- تقرير العوائد الشهرية/السنوية
- تحليل الأداء لكل عقار
- مقارنة العوائد المتوقعة vs الفعلية
- ROI لكل عقار

### 6. التكامل مع النظام المحاسبي
- قيود يومية تلقائية للإيجارات
- ربط المدفوعات بالحسابات البنكية
- تسجيل مصاريف الصيانة
- تقارير الأرباح والخسائر

---

## 🗄️ قاعدة البيانات المطلوبة

### جداول جديدة:

#### 1. `contracts` (العقود)
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  contract_type VARCHAR(50) NOT NULL, -- 'rent', 'maintenance', 'investment'
  tenant_name VARCHAR(255) NOT NULL,
  tenant_national_id VARCHAR(20),
  tenant_phone VARCHAR(20),
  tenant_email VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(12,2),
  annual_rent DECIMAL(12,2),
  payment_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'annually'
  payment_day INTEGER, -- يوم الدفع من الشهر
  security_deposit DECIMAL(12,2),
  late_fee_percentage DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'pending', 'cancelled'
  auto_renew BOOLEAN DEFAULT false,
  renewal_notification_days INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `contract_attachments` (مرفقات العقود)
```sql
CREATE TABLE contract_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `rental_payments` (دفعات الإيجار)
```sql
CREATE TABLE rental_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  payment_number VARCHAR(50),
  due_date DATE NOT NULL,
  payment_date DATE,
  amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  late_fee DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'overdue'
  payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'check', 'online'
  bank_reference VARCHAR(100),
  receipt_number VARCHAR(50),
  notes TEXT,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. `maintenance_schedules` (جدولة الصيانة)
```sql
CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  contract_id UUID REFERENCES contracts(id),
  maintenance_type VARCHAR(50) NOT NULL, -- 'preventive', 'emergency', 'routine'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  cost DECIMAL(12,2),
  vendor_name VARCHAR(255),
  vendor_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  notes TEXT,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. `contract_renewals` (تجديد العقود)
```sql
CREATE TABLE contract_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_contract_id UUID REFERENCES contracts(id),
  new_contract_id UUID REFERENCES contracts(id),
  renewal_date DATE NOT NULL,
  old_monthly_rent DECIMAL(12,2),
  new_monthly_rent DECIMAL(12,2),
  rent_increase_percentage DECIMAL(5,2),
  renewal_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔔 Triggers والإشعارات المطلوبة

### 1. Trigger لحساب الغرامات التلقائية
```sql
CREATE OR REPLACE FUNCTION calculate_late_fees()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
    -- حساب عدد الأيام المتأخرة
    DECLARE
      days_late INTEGER;
      contract_late_fee_percentage DECIMAL(5,2);
    BEGIN
      SELECT EXTRACT(DAY FROM (CURRENT_DATE - NEW.due_date))::INTEGER 
      INTO days_late;
      
      SELECT late_fee_percentage INTO contract_late_fee_percentage
      FROM contracts WHERE id = NEW.contract_id;
      
      IF days_late > 0 AND contract_late_fee_percentage > 0 THEN
        NEW.late_fee := NEW.amount * (contract_late_fee_percentage / 100) * (days_late / 30);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Trigger للإشعارات بتجديد العقود
```sql
CREATE OR REPLACE FUNCTION notify_contract_renewal()
RETURNS void AS $$
DECLARE
  contract_record RECORD;
BEGIN
  FOR contract_record IN
    SELECT * FROM contracts 
    WHERE status = 'active'
    AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  LOOP
    -- إرسال إشعار للناظر
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      notification_type,
      reference_id,
      reference_type
    ) VALUES (
      (SELECT id FROM users WHERE role = 'nazer' LIMIT 1),
      'تنبيه تجديد عقد',
      'عقد رقم ' || contract_record.contract_number || ' سينتهي في ' || contract_record.end_date,
      'contract_renewal',
      contract_record.id,
      'contract'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 3. Job يومي للتحقق من الدفعات المتأخرة
```sql
-- يتم تشغيله يومياً عبر Supabase Edge Function
CREATE OR REPLACE FUNCTION check_overdue_payments()
RETURNS void AS $$
BEGIN
  UPDATE rental_payments
  SET status = 'overdue'
  WHERE status = 'pending'
  AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 المكونات المطلوبة

### 1. إدارة العقود
- `ContractsList.tsx` - قائمة العقود
- `ContractForm.tsx` - إضافة/تعديل عقد
- `ContractDetails.tsx` - تفاصيل العقد
- `ContractAttachments.tsx` - مرفقات العقد
- `ContractRenewal.tsx` - تجديد العقد

### 2. إدارة الإيجارات
- `RentalPaymentsList.tsx` - قائمة الدفعات
- `RentalPaymentForm.tsx` - تسجيل دفعة
- `OverduePayments.tsx` - المتأخرات
- `PaymentCalendar.tsx` - تقويم الدفعات
- `LateFeeCalculator.tsx` - حاسبة الغرامات

### 3. إدارة الصيانة
- `MaintenanceSchedules.tsx` - جدولة الصيانة
- `MaintenanceForm.tsx` - طلب صيانة
- `MaintenanceHistory.tsx` - سجل الصيانة
- `MaintenanceCosts.tsx` - تكاليف الصيانة

### 4. التقارير
- `PropertyRevenue.tsx` - تقرير العوائد
- `ContractsExpiring.tsx` - العقود المنتهية
- `OccupancyRate.tsx` - معدل الإشغال
- `PropertyPerformance.tsx` - أداء العقارات

### 5. لوحات التحكم
- `PropertyDashboard.tsx` - لوحة العقارات
- `ContractsDashboard.tsx` - لوحة العقود
- `RentalsDashboard.tsx` - لوحة الإيجارات

---

## 🔗 التكامل مع الأنظمة الموجودة

### 1. النظام المحاسبي
```typescript
// عند تسجيل دفعة إيجار
async function recordRentalPayment(payment: RentalPayment) {
  // 1. تسجيل الدفعة
  const { data: paymentData } = await supabase
    .from('rental_payments')
    .insert(payment);
  
  // 2. إنشاء قيد يومي تلقائي
  const journalEntry = {
    description: `إيراد إيجار - عقد ${payment.contract_number}`,
    debit_account: 'bank_account', // البنك
    credit_account: 'rental_income', // إيراد الإيجار
    amount: payment.amount,
  };
  
  await createAutoJournalEntry(journalEntry);
  
  // 3. إرسال إشعار
  await sendPaymentNotification(payment);
}
```

### 2. نظام الإشعارات
```typescript
// إشعارات تلقائية للدفعات
- 7 أيام قبل موعد الاستحقاق
- يوم الاستحقاق
- 3 أيام بعد التأخير
- 7 أيام بعد التأخير
```

### 3. نظام التقارير
```typescript
// تقارير تلقائية شهرية
- تقرير العوائد الشهرية
- تقرير المتأخرات
- تقرير الصيانة
- تقرير العقود المنتهية
```

---

## 📊 مؤشرات الأداء (KPIs)

### العقود:
- إجمالي العقود النشطة
- العقود المنتهية خلال 30 يوم
- معدل التجديد
- متوسط قيمة الإيجار

### الإيجارات:
- إجمالي الإيرادات الشهرية
- معدل التحصيل
- المتأخرات الحالية
- متوسط فترة التأخير

### الصيانة:
- تكاليف الصيانة الشهرية
- عدد طلبات الصيانة
- متوسط زمن الإصلاح
- نسبة الصيانة الوقائية vs الطارئة

### العقارات:
- معدل الإشغال
- العائد على الاستثمار (ROI)
- متوسط الإيجار لكل متر
- العوائد السنوية

---

## ✅ قائمة المهام التفصيلية

### المرحلة 1: قاعدة البيانات (يومان)
- [ ] إنشاء جداول العقود
- [ ] إنشاء جداول الإيجارات
- [ ] إنشاء جداول الصيانة
- [ ] إنشاء Triggers
- [ ] إعداد RLS Policies
- [ ] اختبار قاعدة البيانات

### المرحلة 2: مكونات العقود (3 أيام)
- [ ] ContractsList
- [ ] ContractForm
- [ ] ContractDetails
- [ ] ContractAttachments
- [ ] ContractRenewal
- [ ] اختبار المكونات

### المرحلة 3: مكونات الإيجارات (3 أيام)
- [ ] RentalPaymentsList
- [ ] RentalPaymentForm
- [ ] OverduePayments
- [ ] PaymentCalendar
- [ ] LateFeeCalculator
- [ ] اختبار المكونات

### المرحلة 4: مكونات الصيانة (يومان)
- [ ] MaintenanceSchedules
- [ ] MaintenanceForm
- [ ] MaintenanceHistory
- [ ] MaintenanceCosts
- [ ] اختبار المكونات

### المرحلة 5: التقارير ولوحات التحكم (3 أيام)
- [ ] PropertyRevenue
- [ ] ContractsExpiring
- [ ] OccupancyRate
- [ ] PropertyPerformance
- [ ] PropertyDashboard
- [ ] ContractsDashboard
- [ ] RentalsDashboard

### المرحلة 6: التكامل والاختبار (يومان)
- [ ] تكامل مع النظام المحاسبي
- [ ] تكامل مع الإشعارات
- [ ] اختبار شامل
- [ ] إصلاح الأخطاء
- [ ] توثيق

**المدة الإجمالية المتوقعة: 15 يوم عمل**

---

## 🎯 المخرجات المتوقعة

1. ✅ نظام عقود متكامل
2. ✅ متابعة إيجارات تلقائية
3. ✅ جدولة صيانة ذكية
4. ✅ تقارير عقارية شاملة
5. ✅ تكامل محاسبي كامل
6. ✅ إشعارات تلقائية
7. ✅ لوحات تحكم تفاعلية

---

## 📝 ملاحظات مهمة

1. **الأمان**: جميع العمليات يجب أن تكون محمية بـ RLS
2. **الأداء**: استخدام indexes مناسبة على الحقول المستخدمة في البحث
3. **التوثيق**: توثيق كل API وكل مكون
4. **الاختبار**: اختبار شامل لكل السيناريوهات
5. **التكامل**: التأكد من تكامل سلس مع الأنظمة الموجودة

---

هذه الخطة جاهزة للبدء فور الموافقة! 🚀
