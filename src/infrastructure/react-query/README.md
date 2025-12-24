# React Query Infrastructure

## الوصف

هذا المجلد هو **المصدر الوحيد** لجميع إعدادات React Query في المشروع.

## الملفات

| الملف | الوصف |
|-------|-------|
| `queryConfig.ts` | إعدادات الاستعلامات (QUERY_CONFIG) |
| `cacheTimes.ts` | أوقات الكاش (CACHE_TIMES) |
| `index.ts` | التصدير المركزي |

## قواعد الملكية

### ✅ مسموح

```typescript
// استيراد من المصدر الصحيح
import { QUERY_CONFIG, CACHE_TIMES } from '@/infrastructure/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';
```

### ❌ ممنوع

```typescript
// لا تُنشئ QUERY_CONFIG جديد
const QUERY_CONFIG = { ... }; // ❌

// لا تستورد من queryOptimization
import { QUERY_CONFIG } from '@/lib/queryOptimization'; // ❌ deprecated

// لا تُعرّف أوقات كاش مخصصة
const myStaleTime = 5 * 60 * 1000; // ❌
```

## الاستخدام

```typescript
import { useQuery } from '@tanstack/react-query';
import { QUERY_CONFIG } from '@/infrastructure/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';

function useMyData() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_DATA,
    queryFn: fetchMyData,
    ...QUERY_CONFIG.DEFAULT
  });
}
```

## إعدادات متوفرة

| الإعداد | الاستخدام |
|---------|----------|
| `DEFAULT` | الاستعلامات العامة |
| `DASHBOARD_KPIS` | مؤشرات الأداء الرئيسية |
| `ADMIN_KPIS` | لوحة المسؤول |
| `REPORTS` | التقارير |
| `REALTIME` | البيانات الحية |
| `STATIC` | البيانات الثابتة |
| `APPROVALS` | الموافقات |
| `ALERTS` | التنبيهات |
| `CHARTS` | الرسوم البيانية |
| `ACTIVITIES` | الأنشطة |
| `TASKS` | المهام |
| `LOANS` | القروض |
