# تحسينات React Query - React Query Optimization Guide

## 📋 نظرة عامة

وثيقة تفصيلية لتحسين أداء React Query في المنصة، مع التركيز على تقليل الطلبات المتكررة وتحسين استخدام الموارد.

---

## 🔍 **المشكلة المُكتشفة**

### **الأعراض**
```
workbox-99e361f0.js:1 Fetch finished loading: GET ".../system_error_logs?..."
index-B3TugpxH.js:2 Fetch finished loading: GET ".../system_error_logs?..."
[repeated 20+ times in 30 seconds]
```

- طلبات متكررة جداً لنفس الـ endpoint
- استهلاك عالي للموارد (CPU/Network)
- تحذيرات `setInterval` handler
- تأثير سلبي على تجربة المستخدم

### **السبب الجذري**

في `src/hooks/developer/useErrorNotifications.ts`:

```typescript
// ❌ المشكلة: refetchInterval قصير جداً (10 ثواني)
const { data: errors } = useQuery({
  queryKey: ["system-errors"],
  queryFn: async () => { /* ... */ },
  refetchInterval: enabled ? 10000 : false, // كل 10 ثواني!
  enabled,
});
```

**التأثير:**
- كل 10 ثواني = 360 طلب في الساعة = 8,640 طلب في اليوم
- مع Realtime subscription نشط، لا حاجة لـ polling متكرر
- تحميل زائد على الـ database والـ API

---

## ✅ **الحل المنهجي**

### **1. تحسين `useErrorNotifications.ts`**

```typescript
// ✅ الحل: تحسين استراتيجية الـ fetching
const { data: errors } = useQuery({
  queryKey: ["system-errors"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("system_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data;
  },
  // ✅ تحسينات الأداء
  refetchInterval: enabled ? 60000 : false, // 60 ثانية بدلاً من 10
  staleTime: 30 * 1000, // البيانات صالحة لـ 30 ثانية
  refetchOnWindowFocus: false, // لا refetch عند العودة للنافذة
  refetchOnReconnect: false, // لا refetch عند إعادة الاتصال
  enabled,
});
```

**المبررات:**
1. **Realtime Subscription موجود**: يستقبل التحديثات فورياً عبر WebSocket
2. **تقليل Polling**: من 360 طلب/ساعة إلى 60 طلب/ساعة (-83%)
3. **staleTime**: يمنع طلبات إضافية خلال 30 ثانية
4. **refetchOnWindowFocus: false**: يمنع طلبات عند التبديل بين التطبيقات

---

## 📊 **النتائج**

### **قبل التحسين**
- ⏱️ **Polling Interval**: 10 ثواني
- 📈 **Requests/Hour**: 360 طلب
- 📊 **Requests/Day**: 8,640 طلب
- 🔥 **Network Usage**: عالي جداً
- ⚠️ **Console Warnings**: متكررة

### **بعد التحسين**
- ⏱️ **Polling Interval**: 60 ثانية
- 📈 **Requests/Hour**: 60 طلب (-83%)
- 📊 **Requests/Day**: 1,440 طلب (-83%)
- ✅ **Network Usage**: منخفض
- ✅ **Console Warnings**: معدومة

**التحسين الإجمالي:**
- 🚀 **تقليل الطلبات بنسبة 83%**
- 📉 **تقليل استخدام Network بنسبة 80%+**
- ⚡ **تحسين استجابة UI**
- 🔋 **تقليل استهلاك البطارية (للأجهزة المحمولة)**

---

## 🎯 **أفضل الممارسات لـ React Query**

### **1. تحديد الـ refetchInterval المناسب**

```typescript
// ❌ خطأ: Polling سريع جداً
refetchInterval: 5000, // كل 5 ثواني - يسبب تحميل زائد

// ✅ صحيح: Polling معقول
refetchInterval: 60000, // كل 60 ثانية - مقبول للبيانات شبه الثابتة

// ✅ أفضل: استخدام Realtime بدلاً من Polling
refetchInterval: false, // لا polling، استخدم WebSocket
```

**القاعدة العامة:**
- بيانات ديناميكية جداً: استخدم Realtime (WebSocket)
- بيانات شبه ديناميكية: 30-60 ثانية
- بيانات ثابتة نسبياً: 5-10 دقائق
- بيانات ثابتة: false (manual refetch فقط)

### **2. استخدام staleTime بذكاء**

```typescript
// ✅ تحديد متى تصبح البيانات "قديمة"
const query = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 دقائق
});
```

**فوائد staleTime:**
- يمنع re-fetching خلال الفترة المحددة
- يقلل الطلبات عند التنقل بين الصفحات
- يحسن تجربة المستخدم (instant data)

### **3. التحكم في Refetch Triggers**

```typescript
const query = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchOnWindowFocus: false, // ✅ عند عدم الحاجة
  refetchOnMount: true, // ✅ مفيد للبيانات الديناميكية
  refetchOnReconnect: false, // ✅ عند وجود Realtime
});
```

### **4. Garbage Collection Time (gcTime)**

```typescript
const query = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 دقائق
  gcTime: 10 * 60 * 1000, // 10 دقائق - يحتفظ بالبيانات في الـ cache
});
```

---

## 🔧 **استراتيجيات تحسين متقدمة**

### **1. استخدام Realtime بدلاً من Polling**

```typescript
// ❌ استخدام Polling
const { data } = useQuery({
  queryKey: ['errors'],
  queryFn: fetchErrors,
  refetchInterval: 10000, // polling كل 10 ثواني
});

// ✅ استخدام Realtime
const { data } = useQuery({
  queryKey: ['errors'],
  queryFn: fetchErrors,
  refetchInterval: false, // لا polling
});

// Realtime subscription منفصل
useEffect(() => {
  const channel = supabase
    .channel('errors')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'system_error_logs' },
      (payload) => {
        // تحديث الـ cache مباشرة
        queryClient.setQueryData(['errors'], (old) => [payload.new, ...old]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

### **2. Optimistic Updates**

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // ✅ تحديث فوري في الـ UI
    await queryClient.cancelQueries({ queryKey: ['data'] });
    const previousData = queryClient.getQueryData(['data']);
    queryClient.setQueryData(['data'], newData);
    return { previousData };
  },
  onError: (err, newData, context) => {
    // إرجاع البيانات القديمة عند الفشل
    queryClient.setQueryData(['data'], context.previousData);
  },
});
```

### **3. Prefetching للبيانات المتوقعة**

```typescript
// ✅ تحميل مسبق للبيانات التي يتوقع الوصول إليها
const prefetchData = () => {
  queryClient.prefetchQuery({
    queryKey: ['next-page', nextPage],
    queryFn: () => fetchPage(nextPage),
    staleTime: 5 * 60 * 1000,
  });
};

// استدعاء عند hover على زر "التالي"
<Button onMouseEnter={prefetchData}>التالي</Button>
```

### **4. تقسيم البيانات الكبيرة (Pagination/Infinite Query)**

```typescript
// ✅ استخدام useInfiniteQuery للقوائم الطويلة
const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ['errors'],
  queryFn: ({ pageParam = 0 }) => fetchErrors(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  staleTime: 5 * 60 * 1000,
});
```

---

## 📋 **Checklist للتحسين**

عند إنشاء أو تعديل React Query Hook، تأكد من:

- [ ] **تحديد staleTime مناسب** (5-10 دقائق للبيانات شبه الثابتة)
- [ ] **استخدام gcTime** للاحتفاظ بالـ cache
- [ ] **تعطيل refetchOnWindowFocus** للبيانات غير الحرجة
- [ ] **استخدام Realtime بدلاً من Polling** عندما يكون ممكناً
- [ ] **تحديد refetchInterval معقول** (60 ثانية كحد أدنى)
- [ ] **تجنب الطلبات المتكررة** عبر enabled flag
- [ ] **استخدام retry strategy** ذكية
- [ ] **إضافة error handling** شامل

---

## 🔍 **تشخيص مشاكل الأداء**

### **1. استخدام React Query DevTools**

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**الفوائد:**
- رؤية جميع الـ queries النشطة
- تتبع حالة الـ cache
- مراقبة الـ refetching
- تحديد الـ queries البطيئة

### **2. مراقبة Network في DevTools**

- افتح Chrome DevTools → Network
- ابحث عن طلبات متكررة
- فلتر حسب `rest/v1` للـ Supabase calls
- راقب timing وfrequency

### **3. استخدام Performance Profiler**

```typescript
// إضافة logging للـ queries البطيئة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onSettled: (data, error, variables, context, query) => {
        const duration = Date.now() - query.state.dataUpdatedAt;
        if (duration > 1000) {
          console.warn(`Slow query: ${query.queryKey}`, duration);
        }
      },
    },
  },
});
```

---

## 📚 **موارد إضافية**

### **الـ Hooks المُحسّنة في المشروع**

✅ **مُحسّن بشكل جيد:**
- `useDashboardKPIs.ts`: staleTime: 1 hour + refetchInterval: false
- `useAuditLogs.ts`: staleTime: 2 minutes + refetchInterval: false
- `useSecurityAlerts.ts`: staleTime: 5 minutes + refetchInterval: false

⚠️ **يحتاج مراجعة:**
- أي hook بدون `staleTime`
- أي hook مع `refetchInterval` < 30 ثانية
- أي hook مع `refetchOnWindowFocus: true` بدون سبب

### **الإعدادات الافتراضية الموصى بها**

```typescript
// src/lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق افتراضي
      gcTime: 10 * 60 * 1000, // 10 دقائق
      refetchOnWindowFocus: false, // معطّل افتراضياً
      refetchOnReconnect: false,
      retry: 2, // محاولتين فقط
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

---

## 🎯 **الخلاصة**

**التحسينات المُنفّذة:**
1. ✅ تقليل `refetchInterval` من 10 ثواني إلى 60 ثانية في `useErrorNotifications`
2. ✅ إضافة `staleTime: 30 seconds` لمنع طلبات زائدة
3. ✅ تعطيل `refetchOnWindowFocus` و `refetchOnReconnect`
4. ✅ الاعتماد على Realtime subscriptions للتحديثات الفورية

**النتيجة:**
- 🚀 **تقليل الطلبات بنسبة 83%**
- ⚡ **تحسين استجابة التطبيق**
- 📉 **تقليل استهلاك الموارد**
- ✅ **إزالة التحذيرات من الـ Console**

**التأثير على المستخدم:**
- تطبيق أسرع وأكثر سلاسة
- استهلاك أقل للبطارية (mobile)
- استهلاك أقل للبيانات (mobile data)
- تجربة مستخدم محسّنة بشكل عام

---

## 📝 **ملاحظات للمطورين**

1. **استخدم Realtime أولاً**: لا تستخدم Polling إذا كان Realtime متاحاً
2. **حدد staleTime دائماً**: لا تترك القيمة الافتراضية (0)
3. **تجنب refetchInterval قصير**: أقل من 30 ثانية نادراً ما يكون ضرورياً
4. **استخدم DevTools**: لمراقبة وتحسين الأداء
5. **راجع الـ queries دورياً**: تأكد من أنها لا تزال محسّنة

**تذكر:** كل طلب إضافي يكلف موارد (server, network, client). أفضل طلب هو الطلب الذي لا يحدث!
