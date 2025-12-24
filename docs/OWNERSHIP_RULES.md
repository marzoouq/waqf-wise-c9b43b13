# قواعد الملكية المعمارية - Ownership Rules

## من أين نستورد ماذا؟

| المفهوم | المالك | المسار |
|---------|--------|--------|
| `QUERY_CONFIG` | Infrastructure | `@/infrastructure/react-query` |
| `CACHE_TIMES` | Infrastructure | `@/infrastructure/react-query` |
| `QUERY_KEYS` | Lib | `@/lib/query-keys` |
| Dashboard KPIs | Hooks | `@/hooks/dashboard/useUnifiedKPIs` |
| Pure Utilities | Lib | `@/lib` |
| Services | Services | `@/services` |

## ما الذي يُمنع تكراره؟

❌ لا تُنشئ `QUERY_CONFIG` جديد - استخدم `@/infrastructure/react-query`
❌ لا تُنشئ hook جديد للـ KPIs - استخدم `useUnifiedKPIs`
❌ لا تستورد من `@/lib/queryOptimization` (deprecated)

## Checklist قبل إنشاء Hook جديد

- [ ] هل يوجد hook مشابه؟ (ابحث أولاً)
- [ ] هل المجلد صحيح حسب الـ Domain؟
- [ ] هل يستخدم Service وليس Supabase مباشرة؟
- [ ] هل يستخدم `QUERY_KEYS` من `@/lib/query-keys`؟
- [ ] هل يستخدم `QUERY_CONFIG` من `@/infrastructure/react-query`؟
- [ ] هل تم تحديث `index.ts` للمجلد؟
