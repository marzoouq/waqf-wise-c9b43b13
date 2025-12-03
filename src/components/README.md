# 📁 مجلد المكونات (Components)

## 📂 الهيكل

```
src/components/
├── ui/                  # مكونات Shadcn UI الأساسية
├── accounting/          # مكونات المحاسبة
├── archive/             # مكونات الأرشفة
├── auth/                # مكونات المصادقة
├── beneficiary/         # مكونات المستفيدين
├── contracts/           # مكونات العقود
├── dashboard/           # مكونات لوحات التحكم
├── distributions/       # مكونات التوزيعات
├── families/            # مكونات العائلات
├── invoices/            # مكونات الفواتير
├── loans/               # مكونات القروض
├── permissions/         # مكونات الصلاحيات
├── properties/          # مكونات العقارات
├── requests/            # مكونات الطلبات
├── settings/            # مكونات الإعدادات
└── layout/              # مكونات التخطيط
```

## 🎯 مبادئ التصميم

### 1. المكونات الصغيرة والمركزة
كل مكون يجب أن يكون مسؤولاً عن وظيفة واحدة فقط.

### 2. إعادة الاستخدام
استخدم مكونات `ui/` الأساسية وأنشئ مكونات مركبة.

### 3. التجاوب (Responsive)
كل مكون يجب أن يعمل على جميع أحجام الشاشات.

### 4. RTL Support
جميع المكونات تدعم اللغة العربية والاتجاه من اليمين لليسار.

## 📋 أمثلة الاستيراد

### من مجلد فرعي مع barrel export
```typescript
import { RequestsStatsCards, RequestsFilters } from '@/components/requests';
import { FamiliesStatsCards, FamiliesFilters } from '@/components/families';
```

### من الملف مباشرة
```typescript
import { BeneficiaryCard } from '@/components/beneficiary/BeneficiaryCard';
```

## 🔧 هيكل المكون النموذجي

```typescript
// 1. الاستيرادات
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 2. الأنواع
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// 3. المكون
export function ComponentName({ title, onAction }: ComponentProps) {
  // 3.1 State
  const [isOpen, setIsOpen] = useState(false);
  
  // 3.2 Handlers
  const handleClick = () => {
    setIsOpen(true);
    onAction?.();
  };
  
  // 3.3 Render
  return (
    <Card>
      <h2>{title}</h2>
      <Button onClick={handleClick}>إجراء</Button>
    </Card>
  );
}
```

## 📱 المكونات المتجاوبة

### مكونات الموبايل
- `MobileCard` - بطاقة للموبايل
- `MobileStatementCard` - كشف حساب موبايل
- `MobileDistributionCard` - توزيع موبايل
- `BeneficiaryMobileCard` - مستفيد موبايل
- `RequestMobileCard` - طلب موبايل
- `FamilyMobileCard` - عائلة موبايل

### استخدام useIsMobile
```typescript
import { useIsMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## 🎨 التنسيق

### استخدام Design Tokens
```typescript
// ✅ صحيح - استخدام tokens
<div className="bg-background text-foreground border-border">

// ❌ خطأ - ألوان مباشرة
<div className="bg-white text-black border-gray-200">
```

### التجاوب
```typescript
// Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

**آخر تحديث:** 2025-12-03
