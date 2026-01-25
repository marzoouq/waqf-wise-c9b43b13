# Query Keys Migration Guide - دليل ترحيل مفاتيح الاستعلامات

## نظرة عامة

هذا الدليل يساعد المطورين على فهم نظام `QUERY_KEYS` الموحد واستخدامه بشكل صحيح.

## v3.3.0 - Query Keys Standardization Milestone

### ✅ الإنجازات
- **350+ Query Key** موحد في 8 ملفات منظمة
- **50+ ملف** تم تحديثها لاستخدام الثوابت المركزية
- **95%+ تغطية** لجميع استعلامات React Query
- **اختبارات تلقائية** للتحقق من صحة المفاتيح

---

## قبل وبعد

### ❌ الطريقة القديمة (Hardcoded Strings)
```typescript
// ❌ مشتت ومكرر ومعرض للأخطاء
useQuery({ queryKey: ['beneficiaries'] });
useQuery({ queryKey: ['beneficiary-profile', userId] });
useQuery({ queryKey: ['support-stats', 'overview'] });

// ❌ إبطال غير متسق
queryClient.invalidateQueries({ queryKey: ['beneficaries'] }); // خطأ إملائي!
```

### ✅ الطريقة الجديدة (Centralized QUERY_KEYS)
```typescript
import { QUERY_KEYS } from '@/lib/query-keys';

// ✅ موحد ومنظم وآمن من الأخطاء
useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES });
useQuery({ queryKey: QUERY_KEYS.BENEFICIARY_PROFILE(userId) });
useQuery({ queryKey: QUERY_KEYS.SUPPORT_STATS_OVERVIEW });

// ✅ إبطال متسق وموثوق
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
```

---

## الهيكل التنظيمي

```
src/lib/query-keys/
├── index.ts              # نقطة الدخول الرئيسية - يجمع كل المفاتيح
├── beneficiary.keys.ts   # 40+ مفتاح للمستفيدين
├── properties.keys.ts    # 35+ مفتاح للعقارات والعقود
├── accounting.keys.ts    # 60+ مفتاح للمحاسبة
├── support.keys.ts       # 20+ مفتاح للدعم الفني
├── system.keys.ts        # 80+ مفتاح للنظام والإعدادات
├── users.keys.ts         # 30+ مفتاح للمستخدمين والأدوار
├── dashboard.keys.ts     # 25+ مفتاح للوحات التحكم
└── payments.keys.ts      # 20+ مفتاح للمدفوعات والتوزيعات
```

---

## أمثلة عملية

### 1. استعلام بسيط (Static Key)
```typescript
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';

const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll(),
});
```

### 2. استعلام مع معاملات (Factory Function)
```typescript
const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARY(id),
  queryFn: () => BeneficiaryService.getById(id),
  enabled: !!id,
});
```

### 3. استعلام مع فلاتر متعددة
```typescript
const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARY_PAYMENTS(id, 'paid', '2024'),
  queryFn: () => BeneficiaryService.getPayments(id, { status: 'paid', year: '2024' }),
});
```

### 4. إبطال Cache
```typescript
// إبطال كل المستفيدين
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });

// إبطال مستفيد معين
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY(id) });

// إبطال متعدد
[QUERY_KEYS.BENEFICIARIES, QUERY_KEYS.BENEFICIARY_STATS].forEach(key => 
  queryClient.invalidateQueries({ queryKey: key })
);
```

### 5. استخدام مع useMutation
```typescript
const updateMutation = useMutation({
  mutationFn: (data: UpdateBeneficiaryInput) => 
    BeneficiaryService.update(id, data),
  onSuccess: () => {
    // إبطال الاستعلامات المرتبطة
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY(id) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_STATS });
  },
});
```

---

## Best Practices

### ✅ افعل:
- استخدم `QUERY_KEYS` دائماً بدلاً من strings
- استخدم Factory Functions للمفاتيح الديناميكية
- أضف `as const` للمفاتيح الجديدة لضمان Type Safety
- اتبع تسمية `UPPER_SNAKE_CASE` للثوابت
- استخدم lowercase مع hyphens لقيم المفاتيح

### ❌ لا تفعل:
- ❌ لا تستخدم hardcoded strings: `['beneficiaries']`
- ❌ لا تنشئ مفاتيح inline: `['user', id, 'data']`
- ❌ لا تكرر المفاتيح في أماكن متعددة
- ❌ لا تستخدم camelCase أو kebab-case لأسماء الثوابت

---

## إضافة مفتاح جديد

### 1. اختر الملف المناسب
```typescript
// للمستفيدين → beneficiary.keys.ts
// للعقارات → properties.keys.ts
// للمحاسبة → accounting.keys.ts
// للنظام → system.keys.ts
```

### 2. أضف المفتاح
```typescript
// في beneficiary.keys.ts
export const BENEFICIARY_KEYS = {
  // ... المفاتيح الموجودة
  
  // مفتاح جديد (Static)
  NEW_FEATURE: ['new-feature'] as const,
  
  // مفتاح جديد (Factory Function)
  NEW_FEATURE_DETAIL: (id: string) => ['new-feature', id] as const,
} as const;
```

### 3. استخدمه مباشرة
```typescript
import { QUERY_KEYS } from '@/lib/query-keys';

useQuery({
  queryKey: QUERY_KEYS.NEW_FEATURE,
  queryFn: () => fetchNewFeature(),
});
```

---

## أنواع المفاتيح

### 1. Static Keys (للقوائم والبيانات العامة)
```typescript
BENEFICIARIES: ['beneficiaries'] as const,
ACCOUNTS: ['accounts'] as const,
```

### 2. Factory Functions (للبيانات المحددة بـ ID)
```typescript
BENEFICIARY: (id: string) => ['beneficiary', id] as const,
ACCOUNT: (id: string) => ['account', id] as const,
```

### 3. Factory Functions with Optional Parameters
```typescript
ACTIVE_SESSIONS: (userId?: string) => 
  userId ? ['active-sessions', userId] as const : ['active-sessions'] as const,
```

### 4. Factory Functions with Multiple Parameters
```typescript
GENERAL_LEDGER: (accountId?: string, dateFrom?: string, dateTo?: string) => 
  ['general_ledger', accountId, dateFrom, dateTo] as const,
```

---

## Troubleshooting

### مشكلة: المفتاح غير موجود
```typescript
// ❌ خطأ
QUERY_KEYS.NON_EXISTENT_KEY
// ✅ الحل: تحقق من الملف الصحيح أو أضف المفتاح
```

### مشكلة: Type Error - Missing Parameter
```typescript
// ❌ خطأ
QUERY_KEYS.BENEFICIARY() // Missing parameter

// ✅ الحل
QUERY_KEYS.BENEFICIARY(id)
```

### مشكلة: Cache لا يتحدث
```typescript
// ❌ خطأ: استخدام string مباشر
queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });

// ✅ الحل: استخدام QUERY_KEYS
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
```

### مشكلة: خطأ إملائي في المفتاح
```typescript
// ❌ قبل (لن يُكتشف الخطأ):
queryClient.invalidateQueries({ queryKey: ['beneficaries'] }); // typo!

// ✅ بعد (سيُكتشف الخطأ في compile time):
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
```

---

## فوائد النظام الموحد

| الميزة | قبل | بعد |
|--------|-----|-----|
| **Type Safety** | ❌ لا | ✅ نعم |
| **اكتشاف الأخطاء الإملائية** | ❌ Runtime | ✅ Compile Time |
| **الصيانة** | ❌ صعبة (مشتتة) | ✅ سهلة (مركزية) |
| **Cache Invalidation** | ❌ غير متسقة | ✅ متسقة |
| **التوثيق** | ❌ لا | ✅ JSDoc |
| **Autocomplete** | ❌ لا | ✅ نعم |

---

## الموارد

- [AI_CODING_AGENT.md](./AI_CODING_AGENT.md) - دليل AI Agent
- [React Query Docs](https://tanstack.com/query/latest) - التوثيق الرسمي
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys) - أفضل الممارسات
