
# خطة إصلاح تنظيم الصفحات الداخلية

## الملخص
إصلاحان بسيطان لتحقيق التوافق الكامل مع معايير تنظيم الصفحات الداخلية.

---

## الإصلاح 1: إضافة PageErrorBoundary لصفحة WaqfGovernanceGuide

### الملف
`src/pages/WaqfGovernanceGuide.tsx`

### التغيير المطلوب
تغليف `MobileOptimizedLayout` بـ `PageErrorBoundary` لضمان معالجة الأخطاء بشكل موحد.

### الكود الحالي
```tsx
return (
  <MobileOptimizedLayout>
    {/* محتوى الصفحة */}
  </MobileOptimizedLayout>
);
```

### الكود الجديد
```tsx
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

return (
  <PageErrorBoundary pageName="الدليل الإرشادي والحوكمة">
    <MobileOptimizedLayout>
      {/* محتوى الصفحة */}
    </MobileOptimizedLayout>
  </PageErrorBoundary>
);
```

---

## الإصلاح 2: تحديث وثيقة تنظيم الصفحات

### الملف
`docs/PAGES_ORGANIZATION_STATUS.md`

### التغييرات المطلوبة

| العنصر | القيمة القديمة | القيمة الجديدة |
|--------|---------------|----------------|
| إجمالي الصفحات | 85 | 86 |
| الصفحات المنظمة | 69 | 70 |
| النسبة المئوية | 81% | 81.4% |
| تاريخ المراجعة | 2026-01-22 | 2026-01-24 |
| إصدار الوثيقة | 1.1.0 | 1.2.0 |

### الإضافات
- إضافة `WaqfGovernanceGuide.tsx` في جدول حالة الصفحات (Level A)
- تسجيل الإصلاح في قسم "Completed (Round 3)"

---

## التأثير

| المقياس | قبل | بعد |
|---------|-----|-----|
| صفحات Level A | 69/85 (81%) | 70/86 (81.4%) |
| صفحات بدون PageErrorBoundary | 1 | 0 |
| توافق التوثيق | ❌ غير محدث | ✅ محدث |

---

## الوقت المقدر
أقل من 5 دقائق

---

## ملاحظات فنية
- لا يوجد تأثير على الأداء
- لا يوجد تغيير في السلوك الوظيفي
- تحسين في معالجة الأخطاء فقط
