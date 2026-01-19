# 📘 إرشادات المكونات - Component Guidelines

## 🎯 الهدف
توحيد معايير تطوير المكونات لضمان الجودة والاتساق والقابلية للصيانة.

---

## 📁 هيكل الملفات

```
src/components/
├── ui/                    # مكونات shadcn/ui الأساسية
├── shared/                # مكونات مشتركة عبر التطبيق
├── layout/                # مكونات التخطيط
├── dashboard/             # مكونات لوحات التحكم
│   ├── admin/
│   ├── accountant/
│   ├── cashier/
│   └── nazer/
├── beneficiaries/         # مكونات المستفيدين
├── properties/            # مكونات العقارات
├── accounting/            # مكونات المحاسبة
└── providers/             # Context Providers
```

---

## 📝 تسمية الملفات والمكونات

### القواعد:
1. **PascalCase** لأسماء المكونات: `UserProfile.tsx`
2. **camelCase** للـ hooks: `useUserProfile.ts`
3. **kebab-case** للمجلدات: `user-profile/`
4. أسماء وصفية وواضحة

### أمثلة:
```
✅ BeneficiaryCard.tsx
✅ useBeneficiaryProfile.ts
✅ UnifiedDataTable.tsx

❌ Card.tsx (عام جداً)
❌ BenCard.tsx (اختصار غير واضح)
❌ beneficiary-card.tsx (يجب PascalCase)
```

---

## 🏗️ هيكل المكون

```tsx
/**
 * وصف المكون
 * @version X.X.X
 */

// 1. Imports - مرتبة حسب النوع
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ComponentProps } from './types';

// 2. Types/Interfaces
interface Props {
  /** وصف الخاصية */
  title: string;
  /** وصف مع القيمة الافتراضية */
  variant?: 'default' | 'compact';
  /** Callback functions */
  onAction?: () => void;
}

// 3. Component
export const ComponentName: React.FC<Props> = ({
  title,
  variant = 'default',
  onAction,
}) => {
  // 3.1 Hooks
  const { data, isLoading } = useQuery({ ... });

  // 3.2 Derived state
  const isCompact = variant === 'compact';

  // 3.3 Event handlers
  const handleClick = () => {
    onAction?.();
  };

  // 3.4 Early returns
  if (isLoading) return <Skeleton />;

  // 3.5 Render
  return (
    <div className={cn('base-classes', isCompact && 'compact-classes')}>
      {/* content */}
    </div>
  );
};
```

---

## 🎨 التصميم والـ Styling

### استخدام Design Tokens:
```tsx
// ✅ صحيح - استخدام semantic tokens
className="bg-background text-foreground border-border"
className="text-primary hover:bg-primary/10"

// ❌ خطأ - ألوان مباشرة
className="bg-white text-black border-gray-200"
className="text-blue-500 hover:bg-blue-100"
```

### التجاوب (Responsive):
```tsx
// استخدام breakpoints من design-tokens
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="text-sm md:text-base"
```

### RTL Support:
```tsx
// استخدام logical properties
className="ps-4 pe-2"     // padding-start, padding-end
className="ms-auto"       // margin-start
className="text-start"    // بدلاً من text-left
```

---

## ♿ الوصول (Accessibility)

### قواعد إلزامية:
1. **aria-label** لجميع الأزرار بدون نص
2. **role** attributes للعناصر غير الدلالية
3. **tabIndex** للتنقل بلوحة المفاتيح
4. **Focus indicators** واضحة

```tsx
// ✅ صحيح
<Button
  aria-label="حذف العنصر"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Live regions للتحديثات
<div role="status" aria-live="polite">
  {message}
</div>

// ✅ Form accessibility
<label htmlFor="email">البريد الإلكتروني</label>
<Input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

---

## 📱 Mobile UX

### Touch Targets:
```tsx
// الحد الأدنى 44x44px
className="min-h-[44px] min-w-[44px]"
className="p-3" // للأزرار الأيقونية
```

### Safe Areas:
```tsx
// للأجهزة ذات notch
className="pb-safe" // padding-bottom: env(safe-area-inset-bottom)
```

---

## 📊 بطاقات الإحصائيات (Canonical Pattern)

### القاعدة الإلزامية:
جميع بطاقات الإحصائيات يجب أن تستخدم النمط الموحد التالي:

```tsx
// ✅ صحيح - النمط الموحد
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';

<UnifiedStatsGrid columns={4}>
  <UnifiedKPICard
    title="المستفيدين"
    value={14}
    icon={Users}
    variant="success"
  />
  <UnifiedKPICard
    title="العقارات"
    value={5}
    icon={Building2}
    variant="primary"
  />
</UnifiedStatsGrid>

// ❌ خطأ - لا تستخدم هذا
<div className="grid grid-cols-4 gap-4">
  <Card>...</Card>
</div>
```

### الخصائص المتاحة:

| الخاصية | النوع | الوصف |
|---------|-------|-------|
| `title` | string | عنوان البطاقة |
| `value` | string \| number \| ReactNode | القيمة الرئيسية |
| `icon` | LucideIcon | أيقونة البطاقة |
| `variant` | 'default' \| 'success' \| 'warning' \| 'destructive' \| 'primary' \| 'danger' | نمط اللون |
| `subtitle` | string | نص فرعي (اختياري) |
| `size` | 'default' \| 'compact' | حجم البطاقة |
| `onClick` | () => void | دالة النقر (اختياري) |

### أمثلة الـ Variants:

```tsx
<UnifiedKPICard variant="success" />    // أخضر - للإيجابي
<UnifiedKPICard variant="warning" />    // برتقالي - للتنبيهات
<UnifiedKPICard variant="destructive" /> // أحمر - للسلبي
<UnifiedKPICard variant="primary" />    // أزرق - للعام
<UnifiedKPICard variant="default" />    // رمادي - للمحايد
```

---

## ⚡ الأداء

### React.memo:
```tsx
// للمكونات التي تُعاد رسمها كثيراً
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* complex render */}</div>;
});
```

### useMemo / useCallback:
```tsx
// للقيم المحسوبة
const sortedData = useMemo(() => 
  data.sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);

// للـ callbacks
const handleClick = useCallback(() => {
  onAction(id);
}, [id, onAction]);
```

### Lazy Loading:
```tsx
// للمكونات الثقيلة
const HeavyChart = React.lazy(() => import('./HeavyChart'));

// استخدام
<Suspense fallback={<ChartSkeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

---

## 🧪 الاختبار

### Unit Tests:
```tsx
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onAction = vi.fn();
    render(<ComponentName title="Test" onAction={onAction} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

---

## 📋 Checklist للمراجعة

### قبل الـ PR:
- [ ] TypeScript بدون أخطاء
- [ ] ESLint بدون تحذيرات
- [ ] اختبارات مكتوبة وناجحة
- [ ] aria-labels موجودة
- [ ] يعمل على الجوال
- [ ] يعمل مع Dark Mode
- [ ] يعمل مع RTL
- [ ] لا يوجد console.log
- [ ] التوثيق محدث

---

## 🔗 مراجع

- [Design Tokens](../src/lib/design-tokens.ts)
- [Motion System](../src/lib/motion-system.ts)
- [Accessibility Utils](../src/lib/accessibility.ts)
- [Mobile UX](../src/lib/mobile-ux.ts)
