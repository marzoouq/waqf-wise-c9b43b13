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

## Hooks مُوقّفة (Deprecated)

| Hook | البديل | السبب |
|------|--------|-------|
| `useDashboardKPIs` | `useUnifiedKPIs` | توحيد مصادر البيانات |
| `useKPIs` | مخصص لـ `KPIDashboard` فقط | استخدام محدود |

## Checklist قبل إنشاء Hook جديد

- [ ] هل يوجد hook مشابه؟ (ابحث أولاً)
- [ ] هل المجلد صحيح حسب الـ Domain؟
- [ ] هل يستخدم Service وليس Supabase مباشرة؟
- [ ] هل يستخدم `QUERY_KEYS` من `@/lib/query-keys`؟
- [ ] هل يستخدم `QUERY_CONFIG` من `@/infrastructure/react-query`؟
- [ ] هل تم تحديث `index.ts` للمجلد؟

## هيكل المجلدات

```
src/
├── infrastructure/          # البنية التحتية (React Query, etc.)
│   └── react-query/
│       ├── queryConfig.ts   # إعدادات الاستعلامات
│       ├── cacheTimes.ts    # أوقات الكاش
│       └── index.ts         # التصدير المركزي
├── lib/                     # Pure JS utilities فقط
│   ├── query-keys/          # مفاتيح الاستعلامات
│   └── queryOptimization.ts # (deprecated) - utilities فقط
├── hooks/                   # React Hooks
│   └── dashboard/
│       └── useUnifiedKPIs.ts # المصدر الرسمي للـ KPIs
└── services/                # Business logic + API calls
```
