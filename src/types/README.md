# 📁 Types Directory / مجلد الأنواع

هذا المجلد يحتوي على تعريفات TypeScript للمشروع.

## 📂 الهيكل

```
src/types/
├── index.ts                    # تصدير مركزي
├── common.ts                   # أنواع مشتركة
├── api-responses.ts            # استجابات API
├── database.types.ts           # أنواع قاعدة البيانات
├── form.ts                     # أنواع النماذج
├── filter.ts                   # أنواع الفلاتر
├── search.ts                   # أنواع البحث
├── auth.ts                     # أنواع المصادقة
├── beneficiary/                # أنواع المستفيدين
│   ├── index.ts
│   ├── beneficiary.types.ts
│   └── family.types.ts
├── distribution/               # أنواع التوزيعات
│   ├── index.ts
│   └── distribution.types.ts
├── property/                   # أنواع العقارات
│   ├── index.ts
│   └── property.types.ts
├── disclosure.ts               # أنواع الإفصاحات
├── notification.ts             # أنواع الإشعارات
└── support.ts                  # أنواع الدعم
```

## 📋 الأنواع الرئيسية

### 🔷 Common Types
```typescript
// أنواع شائعة
type Status = 'active' | 'inactive' | 'pending' | 'archived';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type SortDirection = 'asc' | 'desc';

// Pagination
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 👥 Beneficiary Types
```typescript
interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string;
  status: BeneficiaryStatus;
  category: string;
  // ...
}

type BeneficiaryStatus = 'نشط' | 'موقوف' | 'متوفي' | 'قيد المراجعة';
```

### 🏢 Property Types
```typescript
interface Property {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  monthly_rent?: number;
  // ...
}

type PropertyType = 'مبنى' | 'أرض' | 'شقة' | 'محل تجاري' | 'مزرعة';
```

### 📊 Distribution Types
```typescript
interface Distribution {
  id: string;
  title: string;
  total_amount: number;
  status: DistributionStatus;
  // ...
}

type DistributionStatus = 'draft' | 'pending_approval' | 'approved' | 'executed';
```

## 🔄 طرق الاستيراد

### من الـ index الرئيسي
```typescript
import { Beneficiary, Property, Distribution } from '@/types';
```

### من المجلد الفرعي
```typescript
import { Beneficiary, BeneficiaryStatus } from '@/types/beneficiary';
import { Distribution, DistributionDetail } from '@/types/distribution';
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.1.0
