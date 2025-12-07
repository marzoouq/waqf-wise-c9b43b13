# تحسين date-fns Bundle - Date Utilities Optimization

## 📊 ملخص التحسين

تم تحسين استخدام مكتبة `date-fns` عبر إنشاء ملف مركزي `src/lib/date.ts` بدلاً من الاستيراد المباشر في كل ملف.

## 🎯 المشكلة الأصلية

- **95+ ملف** كانت تستورد `format` و `ar` locale مباشرة من `date-fns`
- حجم `date-utils` bundle: **36KB**
- Code Coverage: **65%** (35% غير مستخدم)
- استيراد `ar` locale متكرر في كل ملف

## ✅ الحل المنفذ

### 1. إنشاء ملف مركزي `src/lib/date.ts`

```typescript
// استيراد واحد فقط لـ ar locale
import { ar } from 'date-fns/locale';

// تصدير دوال مُحسّنة
export function formatDate(date, formatStr = 'dd/MM/yyyy') { ... }
export function formatRelative(date) { ... }
export function formatFullDate(date) { ... }
// + المزيد...

// تصدير arLocale للمكونات التي تحتاجه
export { ar as arLocale };
export { fnsFormat as format };
```

### 2. تحديث vite.config.ts

```typescript
// فصل date-locale عن date-utils للـ chunking
if (id.includes('date-fns')) {
  if (id.includes('locale')) {
    return 'date-locale';
  }
  return 'date-utils';
}
```

### 3. تحديث جميع الملفات

**قبل:**
```typescript
import { format } from "date-fns";
import { ar } from "date-fns/locale";
format(date, 'dd/MM/yyyy', { locale: ar })
```

**بعد:**
```typescript
import { format, arLocale as ar } from "@/lib/date";
format(date, 'dd/MM/yyyy', { locale: ar })
// أو الأفضل:
import { formatDate } from "@/lib/date";
formatDate(date)
```

## 📈 النتائج المتوقعة

| المقياس | قبل | بعد | التحسن |
|---------|-----|-----|--------|
| حجم date-utils | 36KB | ~24KB | **-33%** |
| Coverage | 65% | ~90% | **+25%** |
| ar locale imports | 95+ | 1 | **-99%** |
| Total Bundle | - | -10-15KB | **تحسن** |

## 📁 الملفات المُحدّثة

تم تحديث **95+ ملف** في:
- `src/components/accounting/`
- `src/components/approvals/`
- `src/components/beneficiary/`
- `src/components/beneficiaries/`
- `src/components/chatbot/`
- `src/components/contracts/`
- `src/components/dashboard/`
- `src/components/distributions/`
- `src/components/documentation/`
- `src/components/families/`
- `src/components/funds/`
- `src/components/governance/`
- `src/components/invoices/`
- `src/components/loans/`
- `src/components/maintenance/`
- `src/components/messages/`
- `src/components/notifications/`
- `src/components/payments/`
- `src/components/properties/`
- `src/components/rental/`
- `src/components/reports/`
- `src/components/requests/`
- `src/components/settings/`
- `src/components/system/`
- `src/components/unified/`
- `src/components/waqf/`
- `src/components/zatca/`
- `src/pages/`

## 🛠️ كيفية الاستخدام

### للتواريخ البسيطة:
```typescript
import { formatDate, formatDateTime, formatRelative } from "@/lib/date";

formatDate(date)              // "01/01/2024"
formatDateTime(date)          // "01/01/2024 14:30"
formatRelative(date)          // "منذ 5 دقائق"
```

### لمكونات التقويم:
```typescript
import { 
  format, 
  arLocale as ar,
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval 
} from "@/lib/date";
```

### للحسابات:
```typescript
import { 
  getDaysRemaining, 
  daysBetween, 
  differenceInDays 
} from "@/lib/date";
```

## 📅 تاريخ التنفيذ

- **التاريخ:** 2025-12-02
- **المنفذ:** Lovable AI
- **الإصدار:** 2.6.4+

## 🔄 الصيانة المستقبلية

عند إضافة ملفات جديدة تستخدم التواريخ:
1. **لا تستورد** من `date-fns` مباشرة
2. **استورد** من `@/lib/date`
3. استخدم الدوال المُحسّنة مثل `formatDate()` بدلاً من `format()`
