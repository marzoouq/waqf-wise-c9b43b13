

# خطة إصلاح مخالفات التنقل P1

## الهدف
إصلاح 4 مخالفات مستوى P1 في نظام التنقل السفلي وضمان تطابق المسارات مع routes الفعلية.

---

## المرحلة 1: إصلاح المسارات الخاطئة (3 ملفات)

### 1.1 إصلاح `src/config/navigation/adminNavigation.ts`

**التغييرات:**
```typescript
// السطر 29: تصحيح مسار الأمان
path: "/security",  // بدلاً من "/security-dashboard"
matchPaths: ["/security", "/audit-logs"],

// السطر 23: تصحيح مسار الأدوار
matchPaths: ["/users", "/settings/roles"],  // بدلاً من "/roles-management"
```

### 1.2 إصلاح `src/config/navigation/nazerNavigation.ts`

**التغييرات:**
```typescript
// السطر 44: تصحيح مسار قرارات الحوكمة
matchPaths: ["/settings", "/governance/decisions"],  // بدلاً من "/governance-decisions"
```

---

## المرحلة 2: إصلاح تفعيل tabs المستفيد

### 2.1 تحديث `src/components/mobile/BottomNavigation.tsx`

**التغييرات:**
```typescript
// تعديل دالة isItemActive لفحص query params
const isItemActive = useMemo(() => {
  return (item: NavigationItem) => {
    const fullPath = location.pathname + location.search;
    
    // مطابقة دقيقة للمسار الكامل (مع query params)
    if (fullPath === item.path) return true;
    if (item.path.includes('?') && fullPath.startsWith(item.path)) return true;
    
    // مطابقة pathname فقط للمسارات بدون query
    if (!item.path.includes('?') && location.pathname === item.path) return true;
    
    // مطابقة matchPaths
    if (item.matchPaths?.some(p => {
      if (p.includes('?')) {
        return fullPath.startsWith(p) || fullPath === p;
      }
      return location.pathname.startsWith(p);
    })) return true;
    
    return false;
  };
}, [location.pathname, location.search]);
```

---

## المرحلة 3: تحسين beneficiaryNavigation.ts

### 3.1 تحديث `src/config/navigation/beneficiaryNavigation.ts`

**التغييرات:**
```typescript
// تحسين matchPaths لتشمل pathname فقط كخيار بديل
{
  id: "distributions",
  label: "التوزيعات",
  icon: Wallet,
  path: "/beneficiary-portal?tab=distributions",
  matchPaths: ["/beneficiary-portal?tab=distributions"],
},
// لا حاجة للتغيير - المنطق الجديد في BottomNavigation سيتعامل معه
```

---

## ملخص الملفات المتأثرة

| الملف | نوع التغيير | الأسطر |
|-------|-------------|--------|
| `src/config/navigation/adminNavigation.ts` | تصحيح مسارات | 23, 29-30 |
| `src/config/navigation/nazerNavigation.ts` | تصحيح مسار | 44 |
| `src/components/mobile/BottomNavigation.tsx` | تحسين منطق التفعيل | 58-64 |

---

## التحقق بعد التنفيذ

1. **اختبار التنقل السفلي للمشرف:**
   - النقر على "الأمان" ← يجب أن يفتح `/security`
   - التأكد من تفعيل عنصر "المستخدمون" عند زيارة `/settings/roles`

2. **اختبار التنقل السفلي للناظر:**
   - التأكد من تفعيل "المزيد" عند زيارة `/governance/decisions`

3. **اختبار التنقل السفلي للمستفيد:**
   - النقر على "التوزيعات" ← يجب أن يفعّل العنصر بصرياً
   - النقر على "الطلبات" ← يجب أن يفعّل العنصر بصرياً

---

## التوصيات المستقبلية (Batch 2)

1. **توحيد مصادر التنقل:**
   - إنشاء `src/config/navigation/sidebarNavigation.ts` كمصدر موحد لـ AppSidebar
   - ربط AppSidebar بالملف المركزي بدلاً من التعريف المباشر

2. **إضافة اختبارات وحدة:**
   - اختبار تطابق جميع مسارات التنقل مع routes الفعلية
   - اختبار تفعيل العناصر النشطة

3. **توثيق Navigation Matrix:**
   - إنشاء جدول مرجعي موحد لجميع عناصر التنقل مع أدوارها

