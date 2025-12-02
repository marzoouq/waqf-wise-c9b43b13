# إصلاح خطأ React #185 - Maximum Update Depth Exceeded

## تاريخ الإصلاح: 2025-12-02

## المشكلة
كانت صفحة العقارات (`/properties`) تتعطل مع خطأ:
```
React error #185: Maximum update depth exceeded
```

هذا الخطأ يحدث عندما يكون هناك حلقة لا نهائية في تحديث الـ state.

---

## التحليل العلمي

### السبب الجذري الأول: `useMediaQuery` Hook

**الملف:** `src/hooks/use-media-query.ts`

**المشكلة:**
```typescript
// ❌ الكود القديم - يسبب حلقة لا نهائية
useEffect(() => {
  // ...
  if (media.matches !== matches) {
    setMatches(media.matches);
  }
  // ...
}, [matches, query]); // ← matches في dependency array!
```

**تسلسل الحلقة:**
1. `matches` يتغير من `false` إلى `true`
2. useEffect يُشغَّل لأن `matches` في dependencies
3. `setMatches(media.matches)` يُستدعى
4. `matches` يتغير مرة أخرى
5. العودة للخطوة 2 → حلقة لا نهائية

**الحل:**
```typescript
// ✅ الكود الصحيح
useEffect(() => {
  const media = window.matchMedia(query);
  setMatches(media.matches);
  
  const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
  media.addEventListener("change", listener);
  
  return () => media.removeEventListener("change", listener);
}, [query]); // ✅ فقط query - بدون matches
```

---

### السبب الجذري الثاني: `ContractDialog` Component

**الملف:** `src/components/properties/ContractDialog.tsx`

**المشكلة:**
```typescript
// ❌ الكود القديم
const calculateContractDetails = () => {
  // ...
  setFormData(prev => ({
    ...prev,
    end_date: endDate.toISOString().split('T')[0],
    monthly_rent: monthlyRent.toFixed(2),
  }));
};

useEffect(() => {
  if (!contract) {
    calculateContractDetails();
  }
}, [formData.start_date, totalAmount, contractDuration, durationUnit]);
```

**تسلسل الحلقة:**
1. `formData.start_date` يتغير
2. useEffect يُشغَّل
3. `calculateContractDetails()` يُستدعى
4. `setFormData()` يُغيّر `formData`
5. React يُعيد render
6. العودة للخطوة 2 → حلقة لا نهائية

**الحل:**
```typescript
// ✅ الكود الصحيح
const calculateContractDetails = useCallback(() => {
  if (!formData.start_date || !totalAmount || !contractDuration) return;
  
  // ... الحسابات ...
  
  // ✅ تحديث فقط إذا تغيرت القيم فعلاً
  setFormData(prev => {
    if (prev.end_date === newEndDate && prev.monthly_rent === newMonthlyRent) {
      return prev; // لا تغيير - يمنع re-render غير ضروري
    }
    return { ...prev, end_date: newEndDate, monthly_rent: newMonthlyRent };
  });
}, [formData.start_date, totalAmount, contractDuration, durationUnit]);

useEffect(() => {
  if (!contract) {
    calculateContractDetails();
  }
}, [contract, calculateContractDetails]);
```

---

### السبب الجذري الثالث: `ResponsiveDialog` Component

**الملف:** `src/components/shared/ResponsiveDialog.tsx`

**المشكلة الأولى:**
```typescript
// ❌ الكود القديم - كائن جديد في كل render
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  // ...
};
```

**المشكلة الثانية (الأخطر):**
```typescript
// ❌ التبديل بين Dialog و Drawer أثناء العرض يسبب crash في vaul
const isDesktop = useMediaQuery('(min-width: 768px)');

// إذا تغير isDesktop أثناء عرض المحاورة، يحدث خطأ في setRef
if (isDesktop) {
  return <Dialog ... />;
}
return <Drawer ... />;
```

**الحل الشامل:**
```typescript
// ✅ نقل الكائن الثابت خارج المكون
const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  // ...
} as const;

// ✅ دالة للتحقق من حجم الشاشة بدون hook
const getIsDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 768;
};

// ✅ تثبيت قيمة isDesktop عند فتح المحاورة لمنع التبديل أثناء العرض
const [isDesktop, setIsDesktop] = useState(getIsDesktop);
const wasOpenRef = useRef(false);

useEffect(() => {
  if (open && !wasOpenRef.current) {
    // عند الفتح لأول مرة فقط، تحديث القيمة
    setIsDesktop(getIsDesktop());
  }
  wasOpenRef.current = open;
}, [open]);

// ✅ استخدام useMemo للـ className
const dialogClassName = useMemo(() => 
  cn(SIZE_CLASSES[size], 'max-h-[90vh] overflow-y-auto', className),
  [size, className]
);
```

---

## الملفات المعدلة

| الملف | التغيير |
|-------|---------|
| `src/hooks/use-media-query.ts` | إزالة `matches` من dependency array |
| `src/components/properties/ContractDialog.tsx` | تغليف `calculateContractDetails` بـ `useCallback` + شرط التحقق |
| `src/components/shared/ResponsiveDialog.tsx` | نقل `SIZE_CLASSES` خارج المكون + `useMemo` |

---

## أنماط التصميم لتجنب هذه المشاكل

### 1. قاعدة Dependency Array
```typescript
// ❌ خطأ: لا تضع state في dependencies إذا كان useEffect يُغيّرها
useEffect(() => {
  setState(newValue);
}, [state]); // ← حلقة لا نهائية!

// ✅ صحيح: استخدم functional update
useEffect(() => {
  setState(prev => prev !== newValue ? newValue : prev);
}, [newValue]);
```

### 2. قاعدة useCallback للدوال التي تُغيّر State
```typescript
// ❌ خطأ: دالة تُنشأ من جديد في كل render
const handleChange = () => {
  setState(newValue);
};

// ✅ صحيح: useCallback تحافظ على مرجع الدالة
const handleChange = useCallback(() => {
  setState(newValue);
}, [newValue]);
```

### 3. قاعدة الكائنات الثابتة
```typescript
// ❌ خطأ: كائن جديد في كل render
const options = { a: 1, b: 2 };

// ✅ صحيح: نقل خارج المكون أو useMemo
const OPTIONS = { a: 1, b: 2 } as const;
// أو
const options = useMemo(() => ({ a: 1, b: 2 }), []);
```

---

## اختبار الإصلاحات

1. ✅ فتح صفحة `/properties`
2. ✅ إضافة عقار جديد
3. ✅ ربط عقد بالعقار
4. ✅ التحقق من عدم وجود أخطاء في Console
5. ✅ فحص `system_error_logs` للتأكد من عدم تكرار خطأ #185

---

## المراجع

- [React Error #185](https://reactjs.org/docs/error-decoder.html?invariant=185)
- [useCallback Documentation](https://react.dev/reference/react/useCallback)
- [useMemo Documentation](https://react.dev/reference/react/useMemo)
