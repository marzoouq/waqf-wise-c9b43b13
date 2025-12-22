# معمارية التطبيق - Architecture Overview
> الإصدار: 2.9.90 | تاريخ التحديث: 2025-12-22

## 📐 البنية المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                    Components (UI Layer)                     │
│   Pages → Components → UI Elements                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ استخدام Hooks فقط
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hooks (State Layer)                       │
│   300+ hooks في 38 مجلد فرعي                                │
│   React Query + Realtime Subscriptions                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ استخدام Services فقط
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Services (Data Layer)                      │
│   60+ خدمة متخصصة                                           │
│   Accounting, Dashboard, Report (مقسمة لملفات فرعية)       │
└─────────────────────────┬───────────────────────────────────┘
                          │ Supabase Client
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│   Database + Auth + Storage + Edge Functions                │
└─────────────────────────────────────────────────────────────┘
```

## 📁 هيكل المجلدات

```
src/
├── components/          # مكونات UI (600+ في 44 مجلد)
├── hooks/              # Hooks (300+ في 38 مجلد فرعي)
│   ├── accounting/     # محاسبة
│   ├── auth/           # مصادقة
│   ├── beneficiary/    # مستفيدين
│   ├── dashboard/      # لوحات تحكم
│   ├── developer/      # أدوات مطور
│   ├── distributions/  # توزيعات
│   ├── payments/       # مدفوعات
│   ├── property/       # عقارات
│   ├── reports/        # تقارير
│   ├── system/         # نظام
│   └── ...            # 15 مجلد آخر
├── services/           # طبقة الخدمات
│   ├── accounting/     # خدمات محاسبة (4 ملفات)
│   ├── beneficiary/    # خدمات مستفيدين (4 ملفات)
│   ├── dashboard/      # خدمات لوحة التحكم (4 ملفات)
│   ├── report/         # خدمات التقارير (4 ملفات)
│   └── *.service.ts    # خدمات مستقلة (35+)
├── lib/                # أدوات ومساعدات
│   ├── query-keys.ts   # مفاتيح React Query الموحدة
│   └── ...
└── types/              # أنواع TypeScript
```

## 🔑 مفاتيح الاستعلامات (QUERY_KEYS)

ملف `src/lib/query-keys.ts` يحتوي على **350+ مفتاح** موحد في 8 ملفات لجميع استعلامات React Query:

```typescript
import { QUERY_KEYS, QUERY_CONFIG } from '@/lib/query-keys';

// استخدام مفتاح بسيط
useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES });

// استخدام مفتاح مع معاملات
useQuery({ queryKey: QUERY_KEYS.BENEFICIARY(id) });

// تكوينات الكاش
useQuery({ 
  queryKey: QUERY_KEYS.REPORTS,
  ...QUERY_CONFIG.REPORTS // staleTime: 2 دقائق
});
```

### فئات المفاتيح:
- **Beneficiaries**: 18 مفتاح
- **Properties**: 4 مفاتيح
- **Accounting**: 22 مفتاح
- **Dashboard**: 5 مفاتيح
- **Loans**: 4 مفاتيح
- **والمزيد...**

## 🏗️ الخدمات (Services)

### خدمات مقسمة (Split Services):

#### 1. Accounting Services (`src/services/accounting/`)
```
├── journal.service.ts      # القيود المحاسبية
├── accounts.service.ts     # شجرة الحسابات
├── bank.service.ts         # الحسابات البنكية
└── transactions.service.ts # المعاملات
```

#### 2. Beneficiary Services (`src/services/beneficiary/`)
```
├── crud.service.ts         # CRUD operations
├── stats.service.ts        # الإحصائيات
├── family.service.ts       # العائلات
└── attachments.service.ts  # المرفقات
```

#### 3. Dashboard Services (`src/services/dashboard/`)
```
├── kpi.service.ts          # مؤشرات الأداء
├── financial-cards.service.ts # بطاقات مالية
├── charts.service.ts       # الرسوم البيانية
└── config.service.ts       # الإعدادات
```

#### 4. Report Services (`src/services/report/`)
```
├── template.service.ts     # قوالب التقارير
├── disclosure.service.ts   # الإفصاحات
├── financial-report.service.ts # التقارير المالية
└── analysis.service.ts     # التحليلات
```

## 📊 إحصائيات المعمارية

| المقياس | العدد |
|---------|-------|
| إجمالي الخدمات | 60+ |
| إجمالي الـ Hooks | 300+ |
| مجلدات الـ Hooks | 38 |
| مفاتيح QUERY_KEYS | 350+ (8 ملفات) |
| أنواع `any` | 7 (مبررة) |
| تغطية RLS | 100% (675 سياسة) |
| Edge Functions | 50 |
| Database Tables | 231 |
| Database Triggers | 200 |

## ✅ قواعد المعمارية

### 1. فصل الطبقات
```
❌ Component → Supabase (مرفوض)
❌ Hook → Supabase (مرفوض إلا Realtime)
✅ Component → Hook → Service → Supabase
```

### 2. منع `any`
```typescript
// ❌ مرفوض
const data: any = response;

// ✅ صحيح
const data: BeneficiaryData = response;
const data: unknown = untypedResponse;
```

### 3. استخدام QUERY_KEYS
```typescript
// ❌ مرفوض
useQuery({ queryKey: ['beneficiaries'] });

// ✅ صحيح
useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES });
```

### 4. Realtime في Hooks فقط
```typescript
// ✅ مقبول - Realtime في hooks
const channel = supabase.channel('updates')
  .on('postgres_changes', ...)
  .subscribe();
```

## 🔄 دورة حياة البيانات

```
1. Component يطلب بيانات عبر Hook
2. Hook يستخدم useQuery مع QUERY_KEYS
3. useQuery يستدعي Service function
4. Service يجلب من Supabase
5. البيانات تُخزن في React Query cache
6. Realtime subscription يُبطل الكاش عند التغيير
7. Component يُعاد رسمه تلقائياً
```

## 📝 أمثلة الاستخدام

### إنشاء Hook جديد
```typescript
// src/hooks/beneficiary/useBeneficiaryData.ts
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';
import { BeneficiaryService } from '@/services';

export function useBeneficiaryData(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY(id),
    queryFn: () => BeneficiaryService.getById(id),
  });
}
```

### إنشاء Service جديد
```typescript
// src/services/example.service.ts
import { supabase } from '@/integrations/supabase/client';

export const ExampleService = {
  async getAll() {
    const { data, error } = await supabase
      .from('examples')
      .select('*');
    if (error) throw error;
    return data;
  },
};
```

---

**آخر تحديث**: الإصدار 2.9.90 | 2025-12-22
