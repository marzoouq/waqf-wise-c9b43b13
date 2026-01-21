
# خطة إصلاح مخالفات التنقل P1

## الهدف
إصلاح 4 مخالفات مستوى P1 في نظام التنقل السفلي وضمان تطابق المسارات مع routes الفعلية.

---

## المخالفات المكتشفة

| # | الملف | المشكلة | التأثير |
|---|-------|---------|---------|
| 1 | `adminNavigation.ts` | المسار `/security-dashboard` غير موجود (الصحيح: `/security`) | كسر التنقل |
| 2 | `adminNavigation.ts` | `matchPaths` يشير لـ `/roles-management` (الصحيح: `/settings/roles`) | فشل التفعيل |
| 3 | `nazerNavigation.ts` | `matchPaths` يشير لـ `/governance-decisions` (الصحيح: `/governance/decisions`) | فشل التفعيل |
| 4 | `BottomNavigation.tsx` | لا يفحص `location.search` للـ query params | تبويبات المستفيد لا تتفعل |

---

## المرحلة 1: إصلاح مسارات المشرف

### الملف: `src/config/navigation/adminNavigation.ts`

**التغيير 1 - السطر 23:**
```typescript
// قبل:
matchPaths: ["/users", "/roles-management"],

// بعد:
matchPaths: ["/users", "/settings/roles"],
```

**التغيير 2 - الأسطر 29-30:**
```typescript
// قبل:
path: "/security-dashboard",
matchPaths: ["/security-dashboard", "/audit-logs"],

// بعد:
path: "/security",
matchPaths: ["/security", "/audit-logs"],
```

---

## المرحلة 2: إصلاح مسارات الناظر

### الملف: `src/config/navigation/nazerNavigation.ts`

**التغيير - السطر 44:**
```typescript
// قبل:
matchPaths: ["/settings", "/governance-decisions"],

// بعد:
matchPaths: ["/settings", "/governance/decisions"],
```

---

## المرحلة 3: تحسين منطق تفعيل التبويبات

### الملف: `src/components/mobile/BottomNavigation.tsx`

**التغيير - الأسطر 57-64:**
```typescript
// قبل:
const isItemActive = useMemo(() => {
  return (item: NavigationItem) => {
    if (location.pathname === item.path) return true;
    if (item.matchPaths?.some(p => location.pathname.startsWith(p))) return true;
    return false;
  };
}, [location.pathname]);

// بعد:
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

## ملخص الملفات المتأثرة

| الملف | عدد التغييرات | نوع التغيير |
|-------|--------------|-------------|
| `src/config/navigation/adminNavigation.ts` | 3 أسطر | تصحيح مسارات |
| `src/config/navigation/nazerNavigation.ts` | 1 سطر | تصحيح مسار |
| `src/components/mobile/BottomNavigation.tsx` | 8 أسطر | تحسين منطق |

---

## التحقق بعد التنفيذ

1. **اختبار تنقل المشرف:**
   - النقر على "الأمان" يفتح `/security`
   - زيارة `/settings/roles` تفعّل "المستخدمون"

2. **اختبار تنقل الناظر:**
   - زيارة `/governance/decisions` تفعّل "المزيد"

3. **اختبار تنقل المستفيد:**
   - النقر على "التوزيعات" يفعّل العنصر بصرياً
   - النقر على "الطلبات" يفعّل العنصر بصرياً
