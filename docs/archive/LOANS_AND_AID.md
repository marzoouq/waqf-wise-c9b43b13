# 💰 نظام القروض والفزعات الطارئة | Loans & Emergency Aid

**الإصدار:** 2.6.5 | **آخر تحديث:** 2025-12-03

---

## 📋 نظرة عامة

يوفر النظام آليتين لدعم المستفيدين مالياً:
1. **القروض (Loans)**: قروض بدون فوائد مع جداول سداد
2. **الفزعات الطارئة (Emergency Aid)**: مساعدات عاجلة لحالات الطوارئ

---

## 🏦 نظام القروض

### الجداول المستخدمة

```sql
-- جدول القروض الرئيسي
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  loan_number VARCHAR UNIQUE,
  principal_amount DECIMAL(12,2) NOT NULL,
  remaining_balance DECIMAL(12,2),
  term_months INTEGER NOT NULL,
  monthly_installment DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  status VARCHAR DEFAULT 'pending', -- pending, active, completed, defaulted
  purpose TEXT,
  guarantor_name VARCHAR,
  guarantor_phone VARCHAR,
  approval_date TIMESTAMP,
  approved_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

-- جدول أقساط السداد
CREATE TABLE loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id),
  installment_number INTEGER,
  amount DECIMAL(12,2),
  due_date DATE,
  paid_date DATE,
  status VARCHAR DEFAULT 'pending', -- pending, paid, overdue
  payment_method VARCHAR,
  notes TEXT
);
```

### أنواع القروض

| النوع | الحد الأقصى | المدة | الشروط |
|-------|-------------|-------|--------|
| قرض شخصي | 50,000 ر.س | 24 شهر | ضامن مطلوب |
| قرض تعليمي | 100,000 ر.س | 36 شهر | إثبات تسجيل |
| قرض علاجي | 75,000 ر.س | 24 شهر | تقرير طبي |
| قرض زواج | 30,000 ر.س | 18 شهر | عقد الزواج |

### دورة حياة القرض

```
طلب → مراجعة → موافقة الناظر → صرف المبلغ → سداد الأقساط → إقفال
  ↓
 رفض (مع الأسباب)
```

### حساب الأقساط

```typescript
// حساب القسط الشهري (بدون فوائد)
const calculateInstallment = (principal: number, months: number) => {
  return Math.ceil(principal / months);
};

// مثال: قرض 24,000 على 12 شهر = 2,000 ر.س شهرياً
```

### الاستقطاع التلقائي

يمكن ربط سداد الأقساط بالتوزيعات الشهرية:

```typescript
// عند إنشاء توزيع جديد
const netAmount = distributionAmount - loanInstallment;
```

---

## 🆘 نظام الفزعات الطارئة

### الجداول المستخدمة

```sql
-- جدول طلبات الفزعات
CREATE TABLE emergency_aid_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  request_number VARCHAR UNIQUE,
  amount_requested DECIMAL(12,2),
  amount_approved DECIMAL(12,2),
  category VARCHAR, -- medical, housing, food, education, other
  urgency_level VARCHAR DEFAULT 'normal', -- low, normal, high, critical
  description TEXT NOT NULL,
  supporting_documents JSONB,
  status VARCHAR DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  decision_notes TEXT,
  disbursed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

### فئات الفزعات

| الفئة | الرمز | الحد الأقصى | SLA |
|-------|-------|-------------|-----|
| طبي عاجل | `medical` | 20,000 ر.س | 24 ساعة |
| سكن طارئ | `housing` | 15,000 ر.س | 48 ساعة |
| غذاء | `food` | 5,000 ر.س | 24 ساعة |
| تعليم | `education` | 10,000 ر.س | 72 ساعة |
| أخرى | `other` | 10,000 ر.س | 72 ساعة |

### مستويات الأولوية

| المستوى | الوصف | وقت الاستجابة |
|---------|-------|---------------|
| `critical` | حالات الحياة والموت | فوري |
| `high` | طوارئ صحية/سكنية | 24 ساعة |
| `normal` | احتياجات عاجلة | 48 ساعة |
| `low` | طلبات غير عاجلة | 72 ساعة |

### دورة حياة الفزعة

```
تقديم الطلب → تقييم الأولوية → مراجعة سريعة → قرار → صرف
       ↓
   رفض (مع بدائل مقترحة)
```

---

## 🔄 سير العمل

### تقديم طلب قرض

```typescript
// 1. المستفيد يقدم الطلب
const submitLoanRequest = async (data: LoanRequest) => {
  const { data: loan, error } = await supabase
    .from('loans')
    .insert({
      beneficiary_id: data.beneficiaryId,
      principal_amount: data.amount,
      term_months: data.termMonths,
      purpose: data.purpose,
      status: 'pending'
    })
    .select()
    .single();
  
  // 2. إرسال إشعار للمراجعة
  await notifyReviewers('loan_request', loan.id);
  
  return loan;
};
```

### معالجة طلب فزعة

```typescript
// 1. التحقق من الأهلية
const checkEligibility = async (beneficiaryId: string) => {
  // التحقق من عدم وجود طلبات معلقة
  const { data: pending } = await supabase
    .from('emergency_aid_requests')
    .select('id')
    .eq('beneficiary_id', beneficiaryId)
    .eq('status', 'pending');
  
  return pending?.length === 0;
};

// 2. إنشاء الطلب
const submitEmergencyAid = async (data: EmergencyAidRequest) => {
  if (!await checkEligibility(data.beneficiaryId)) {
    throw new Error('لديك طلب معلق');
  }
  
  const { data: request } = await supabase
    .from('emergency_aid_requests')
    .insert({
      ...data,
      urgency_level: calculateUrgency(data.category)
    });
  
  // 3. تنبيه فوري للحالات الحرجة
  if (data.urgency === 'critical') {
    await notifyNazer('critical_aid', request.id);
  }
};
```

---

## 📊 التقارير

### تقرير القروض

```sql
-- ملخص القروض النشطة
SELECT 
  COUNT(*) as total_loans,
  SUM(principal_amount) as total_principal,
  SUM(remaining_balance) as total_outstanding,
  AVG(EXTRACT(MONTH FROM AGE(end_date, start_date))) as avg_term
FROM loans
WHERE status = 'active';
```

### تقرير أعمار الديون (Aging)

| الفترة | عدد القروض | المبلغ |
|--------|-----------|--------|
| 0-30 يوم | - | - |
| 31-60 يوم | - | - |
| 61-90 يوم | - | - |
| +90 يوم | - | - |

### تقرير الفزعات

```sql
-- إحصائيات الفزعات
SELECT 
  category,
  COUNT(*) as total_requests,
  SUM(amount_approved) as total_amount,
  AVG(EXTRACT(HOUR FROM (reviewed_at - created_at))) as avg_response_hours
FROM emergency_aid_requests
WHERE status = 'approved'
GROUP BY category;
```

---

## 🔐 سياسات RLS

```sql
-- المستفيدين يرون قروضهم فقط
CREATE POLICY "beneficiaries_view_own_loans"
ON loans FOR SELECT
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
);

-- ورثة الوقف يرون جميع القروض
CREATE POLICY "waqf_heirs_view_all_loans"
ON loans FOR SELECT
USING (public.is_waqf_heir(auth.uid()));
```

---

## 💻 الـ Hooks المستخدمة

```typescript
// استخدام hook القروض
import { useLoans, useLoanRepayments } from '@/hooks/useLoans';

const { data: loans, isLoading } = useLoans(beneficiaryId);
const { data: repayments } = useLoanRepayments(loanId);

// استخدام hook الفزعات
import { useEmergencyAid } from '@/hooks/useEmergencyAid';

const { data: requests } = useEmergencyAid(beneficiaryId);
```

---

## 🖥️ واجهات المستخدم

### صفحات القروض
- `src/pages/Loans.tsx` - إدارة القروض
- `src/components/beneficiary/LoansOverviewTab.tsx` - نظرة عامة

### صفحات الفزعات
- `src/pages/EmergencyAid.tsx` - إدارة الفزعات
- `src/components/beneficiary/EmergencyAidTab.tsx` - طلبات الفزعات

---

## 📝 ملاحظات مهمة

1. **لا فوائد على القروض** - جميع القروض بدون فوائد (حلال)
2. **الحالة الحالية** - لا توجد قروض أو فزعات نشطة حالياً
3. **الرسائل الفارغة** - تظهر رسالة "لا توجد قروض نشطة" عند عدم وجود بيانات
4. **التكامل المحاسبي** - جميع العمليات تُنشئ قيود محاسبية تلقائياً

---

**الحالة:** ✅ النظام جاهز للاستخدام
