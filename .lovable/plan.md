

# خطة إصلاح مشاكل بيانات العائلة في بوابة المستفيد

---

## المشاكل المكتشفة بالأدلة

### 🔴 مشكلة #1: البيانات لا تظهر بعد التعديل في المربعات

**الموقع:** `EditProfileDialog.tsx` (السطور 130-150)

**الدليل من الكود:**
```typescript
useEffect(() => {
  if (beneficiary && open) {
    form.reset({...});
  }
}, [beneficiary, form]); // ← المشكلة: "open" مفقود!
```

**السبب:** 
- عند فتح حوار التعديل، الـ `useEffect` لا يُنفذ لأن `open` ليست في الـ dependency array
- النموذج يظل يحتوي على القيم القديمة أو الفارغة

---

### 🔴 مشكلة #2: عدم تحديث البيانات بعد الحفظ

**الموقع:** `EditProfileDialog.tsx` (السطور 189-192)

**الدليل:**
```typescript
// Query Key في useBeneficiaryPortalData:
queryKey: QUERY_KEYS.CURRENT_BENEFICIARY(user?.id) 
// يُنتج: ['current-beneficiary', 'xxxx-user-id']

// Invalidation في EditProfileDialog:
await queryClient.invalidateQueries({ queryKey: ['current-beneficiary'] });
// يُنتج: ['current-beneficiary'] ← بدون userId!
```

**السبب:**
- الـ invalidation تستهدف مفتاحاً مختلفاً عن المفتاح الفعلي
- لذلك الكاش لا يتم تحديثه والبيانات القديمة تظل تظهر

---

### 🔴 مشكلة #3: البيانات في قاعدة البيانات فارغة

**الدليل من الاستعلام:**
```
SELECT marital_status, number_of_sons, number_of_daughters, number_of_wives 
FROM beneficiaries WHERE full_name LIKE '%عبدالله%'

النتيجة:
- marital_status: NULL
- number_of_sons: 0
- number_of_daughters: 0  
- number_of_wives: 0
- family_size: 1
```

**السبب:**
- سياسة RLS تمنع التحديث (تم إصلاحها سابقاً)
- أو أن التحديث فشل بصمت بسبب الـ cache

---

## خطة الإصلاح

### الإصلاح #1: إضافة `open` إلى dependency array

**الملف:** `src/components/beneficiary/dialogs/EditProfileDialog.tsx`

```typescript
// قبل (السطر 150):
}, [beneficiary, form]);

// بعد:
}, [beneficiary, form, open]);
```

---

### الإصلاح #2: تصحيح invalidation queries

**الملف:** `src/components/beneficiary/dialogs/EditProfileDialog.tsx`

```typescript
// الحصول على user id من AuthContext
import { useAuth } from "@/contexts/AuthContext";

// داخل المكون:
const { user } = useAuth();

// بعد التحديث الناجح:
await queryClient.invalidateQueries({ 
  queryKey: QUERY_KEYS.CURRENT_BENEFICIARY(user?.id) 
});
await queryClient.invalidateQueries({ 
  queryKey: ['preview-beneficiary', beneficiary.id] 
});
await queryClient.invalidateQueries({ 
  queryKey: QUERY_KEYS.BENEFICIARY(beneficiary.id) 
});
await queryClient.invalidateQueries({ 
  queryKey: QUERY_KEYS.BENEFICIARY_PROFILE(beneficiary.id) 
});
```

---

### الإصلاح #3: إعادة جلب البيانات بعد إغلاق الحوار

**الملف:** `src/components/beneficiary/tabs/BeneficiaryProfileTab.tsx`

تحديث `handleEditSuccess`:

```typescript
const handleEditSuccess = async () => {
  // إعادة جلب بيانات المستفيد بشكل قسري
  await queryClient.refetchQueries({ 
    queryKey: QUERY_KEYS.BENEFICIARY(beneficiary.id),
    exact: true 
  });
  await queryClient.refetchQueries({ 
    queryKey: QUERY_KEYS.BENEFICIARY_PROFILE(beneficiary.id),
    exact: true 
  });
};
```

---

## ملخص التغييرات

| الملف | التغيير | الأولوية |
|-------|---------|----------|
| `EditProfileDialog.tsx` | إضافة `open` إلى dependency array | 🔴 Critical |
| `EditProfileDialog.tsx` | تصحيح query keys في invalidation | 🔴 Critical |
| `EditProfileDialog.tsx` | إضافة `useAuth` للحصول على user id | 🔴 Critical |
| `BeneficiaryProfileTab.tsx` | تحسين `handleEditSuccess` | 🟠 High |

---

## التحقق بعد الإصلاح

1. فتح بوابة المستفيد → تبويب العائلة → بياناتي
2. الضغط على "تعديل الملف"
3. تعديل البيانات العائلية (عدد الأبناء، الحالة الاجتماعية)
4. الضغط على حفظ
5. التأكد من:
   - ✅ ظهور رسالة نجاح
   - ✅ تحديث البيانات في الواجهة فوراً
   - ✅ ظهور القيم الجديدة في المربعات العائلية

