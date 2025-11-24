# 🔧 خطة إصلاح React Query - 95 خطأ

## المشكلة
ظهور 95 خطأ في TANSTACK React Query v5 مما يؤدي إلى:
- تقارير فارغة
- عدم ظهور البيانات بشكل صحيح
- أخطاء في console

---

## 🎯 الأخطاء الشائعة المتوقعة

### 1. **استعلامات بدون enabled**
```typescript
// ❌ خطأ
useQuery({
  queryKey: ['data', id],
  queryFn: fetchData,
})

// ✅ صحيح
useQuery({
  queryKey: ['data', id],
  queryFn: fetchData,
  enabled: !!id, // لا تنفذ إلا إذا كان id موجود
})
```

### 2. **عدم معالجة الحالات الفارغة**
```typescript
// ❌ خطأ
const { data } = useQuery({...})
return data.map(...) // قد يكون data undefined

// ✅ صحيح
const { data = [] } = useQuery({...})
return data.length > 0 ? data.map(...) : <EmptyState />
```

### 3. **queries متعددة بدون React Query**
```typescript
// ❌ خطأ - طلبات متعددة متزامنة
const data1 = await fetch(...)
const data2 = await fetch(...)
const data3 = await fetch(...)

// ✅ صحيح - استخدام useQueries
const results = useQueries({
  queries: [
    { queryKey: ['data1'], queryFn: fetch1 },
    { queryKey: ['data2'], queryFn: fetch2 },
    { queryKey: ['data3'], queryFn: fetch3 },
  ]
})
```

### 4. **عدم تحديد staleTime مناسب**
```typescript
// ❌ خطأ - البيانات قديمة دائماً
useQuery({ queryKey: ['static-data'], queryFn: ... })

// ✅ صحيح - بيانات ثابتة تبقى لفترة طويلة
useQuery({ 
  queryKey: ['static-data'], 
  queryFn: ...,
  staleTime: 5 * 60 * 1000 // 5 دقائق
})
```

---

## 🔍 ملفات تحتاج فحص

### **Hooks:**
- `src/hooks/useFunds.ts` ✅ (تم الفحص - يعمل)
- `src/hooks/useDistributions.ts`
- `src/hooks/useBeneficiaries.ts`
- `src/hooks/useJournalEntries.ts`
- `src/hooks/useProperties.ts`
- `src/hooks/useContracts.ts`
- `src/hooks/useRentalPayments.ts`
- `src/hooks/useMaintenanceRequests.ts`
- `src/hooks/useAnnualDisclosures.ts`
- `src/hooks/useFinancialReports.ts`

### **Pages:**
- `src/pages/Funds.tsx` ✅ (تم الفحص)
- `src/pages/Accounting.tsx`
- `src/pages/Properties.tsx`
- `src/pages/Reports.tsx`
- `src/pages/Beneficiaries.tsx`

### **Components:**
- كل المكونات التي تستخدم `useQuery` أو `useMutation`

---

## 📋 خطة الإصلاح

### **المرحلة 1: تحديد الأخطاء (30 دقيقة)**
1. فتح console في المتصفح
2. تصفية الأخطاء حسب "React Query" أو "TanStack"
3. تسجيل كل الأخطاء الفريدة مع:
   - اسم الملف
   - رقم السطر
   - نص الخطأ

### **المرحلة 2: الإصلاح (60 دقيقة)**
1. **إصلاح enabled conditions:**
   - إضافة `enabled` لكل query يعتمد على بيانات خارجية
   
2. **إصلاح default values:**
   - تحويل `const { data }` إلى `const { data = [] }`
   
3. **إصلاح empty states:**
   - إضافة `if (!data || data.length === 0) return <EmptyState />`
   
4. **تحسين staleTime:**
   - بيانات ثابتة: `staleTime: 5 * 60 * 1000`
   - بيانات ديناميكية: `staleTime: 30 * 1000`
   - بيانات realtime: `staleTime: 0`

5. **إضافة Error Boundaries:**
   - تغليف كل صفحة في `<PageErrorBoundary>`
   - إضافة fallback UI

### **المرحلة 3: الاختبار (30 دقيقة)**
1. تحديث الصفحة
2. التحقق من console (يجب أن يكون 0 أخطاء)
3. اختبار كل صفحة:
   - الأموال والتوزيعات
   - المحاسبة
   - العقارات
   - التقارير
   - المستفيدون

---

## ✅ معايير النجاح

- [ ] 0 أخطاء في console من React Query
- [ ] جميع الاستعلامات تعمل
- [ ] البيانات تظهر بشكل صحيح
- [ ] Empty states تعمل
- [ ] Loading states تعمل
- [ ] Error states تعمل

---

## 🚀 بعد الإصلاح

1. توثيق التغييرات
2. إنشاء test cases
3. تحديث PHASE_5_COMPLETE.md
4. الانتقال للمرحلة 3 (الاختبار الشامل)
