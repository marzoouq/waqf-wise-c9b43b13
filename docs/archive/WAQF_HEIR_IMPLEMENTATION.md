# توثيق تطبيق دور وارث الوقف (waqf_heir)

## 📋 نظرة عامة

تم تطبيق دور `waqf_heir` بشكل كامل في النظام لتمييز الورثة الـ 14 الفعليين للوقف عن المستفيدين العاديين.

---

## 🎯 الهدف من الدور

**`waqf_heir`**: دور خاص للورثة الشرعيين للوقف (14 شخص)
- يمنحهم صلاحيات خاصة لعرض بيانات الوقف الحساسة
- يميزهم عن المستفيدين العاديين (`beneficiary`)
- يطبق سياسات RLS محددة لحماية البيانات

---

## 📊 الورثة الـ 14 الفعليين

| الاسم | user_id | الدور |
|-------|---------|-------|
| فهد بن سعد العتيبي | c8b25091-0597-4e35-8a6e-2caa7ea3e52f | waqf_heir |
| فيصل بن سعد العتيبي | d33c48ce-5bb1-4a47-b0a8-ce79df0e3c2d | waqf_heir |
| فارس بن سعد العتيبي | e8b86dbc-7fea-455b-8cad-b9dad4c9f9b0 | waqf_heir |
| فراس بن سعد العتيبي | 2b3f9fe8-5e12-492e-a99e-dc5ff55e4fdf | waqf_heir |
| فواز بن سعد العتيبي | 43e3c6ad-25d2-48b0-a084-b3f2cfd855db | waqf_heir |
| فاطمة بنت سعد العتيبي | 29a8bcd8-e1c5-447e-82f3-f30a79ae0c7e | waqf_heir |
| فريدة بنت سعد العتيبي | c6f8a3e9-1b7d-483f-bb45-aa1e35b97b8f | waqf_heir |
| فدوى بنت سعد العتيبي | 99b0f3e8-2ec4-49f8-9d1d-fbeceb4e1c7b | waqf_heir |
| فجر بنت سعد العتيبي | 79d99e52-4e8e-4b29-b5c2-34f4e1e7f9d9 | waqf_heir |
| فلوة بنت سعد العتيبي | 9c08a5b1-2dc3-4e93-902c-6f36a02a1ee0 | waqf_heir |
| فتون بنت سعد العتيبي | 748d5a55-7d95-4e74-a6bc-7e46c0af654c | waqf_heir |
| فاتن بنت سعد العتيبي | e0f15a30-5b14-46b3-8cf1-0e3b88f5ebf3 | waqf_heir |
| أم فهد الزوجة الأولى | 39b75e61-c5be-4f87-945e-4e0bc86a2c49 | waqf_heir |
| أم فيصل الزوجة الثانية | 5f9e5d1f-8a4d-4a6e-9c3c-3d4f39a7e8c1 | waqf_heir |

---

## 🔐 التغييرات في قاعدة البيانات

### 1. إنشاء الدور في Enum

```sql
-- إضافة waqf_heir إلى app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'waqf_heir';
```

### 2. إضافة الدور للـ 14 وارث

```sql
-- إضافة دور waqf_heir للورثة الـ 14
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'waqf_heir'::app_role
FROM beneficiaries
WHERE id IN (
  'c8b25091-0597-4e35-8a6e-2caa7ea3e52f',
  'd33c48ce-5bb1-4a47-b0a8-ce79df0e3c2d',
  -- ... باقي الـ IDs
)
ON CONFLICT (user_id, role) DO NOTHING;
```

### 3. دالة التحقق من دور الوارث

```sql
-- دالة للتحقق من كون المستخدم وارثاً
CREATE OR REPLACE FUNCTION public.is_waqf_heir(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'waqf_heir'
  );
$$;
```

---

## 🛡️ سياسات RLS المحدثة

تم تحديث سياسات RLS للجداول التالية لدعم `waqf_heir`:

### الجداول المحمية (13 جدول)

1. **annual_disclosures** - الإفصاحات السنوية
2. **bank_accounts** - الحسابات البنكية
3. **distributions** - التوزيعات
4. **fiscal_years** - السنوات المالية
5. **funds** - أقلام الوقف
6. **governance_decisions** - قرارات الحوكمة
7. **heir_distributions** - توزيعات الورثة
8. **historical_invoices** - الفواتير التاريخية
9. **investment_plans** - خطط الاستثمار
10. **opening_balances** - الأرصدة الافتتاحية
11. **properties** - العقارات
12. **strategic_plans** - الخطط الاستراتيجية
13. **waqf_units** - وحدات الوقف

### مثال على سياسة RLS

```sql
-- مثال: السماح لـ waqf_heir بقراءة التوزيعات
CREATE POLICY "waqf_heirs_can_view_distributions"
ON distributions
FOR SELECT
TO authenticated
USING (
  public.is_waqf_heir(auth.uid())
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'accountant')
);
```

---

## 💻 التغييرات في الكود

### 1. تعريف النوع (Type Definition)

**الملفات المحدثة:**
- `src/components/auth/RoleBasedRedirect.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/hooks/useUserRole.ts`
- `src/config/permissions.ts`
- `src/lib/role-labels.ts`

```typescript
export type AppRole = 
  | "nazer" 
  | "admin" 
  | "accountant" 
  | "cashier" 
  | "archivist" 
  | "beneficiary" 
  | "waqf_heir"  // ✅ إضافة
  | "user";
```

### 2. التسميات والألوان

```typescript
// src/lib/role-labels.ts
export const ROLE_LABELS: Record<AppRole, string> = {
  waqf_heir: 'وارث الوقف',
  // ...
};

export const ROLE_COLORS: Record<AppRole, string> = {
  waqf_heir: 'bg-amber-100 text-amber-700 border-amber-300',
  // ...
};
```

### 3. التوجيه (Routing)

```typescript
// src/components/auth/RoleBasedRedirect.tsx
const ROLE_DASHBOARD_MAP: Record<AppRole, string> = {
  waqf_heir: '/beneficiary-dashboard',
  beneficiary: '/beneficiary-dashboard',
  // ...
};

const ROLE_PRIORITY: AppRole[] = [
  'nazer',
  'admin',
  'accountant',
  'cashier',
  'archivist',
  'waqf_heir',    // ✅ أولوية أعلى من beneficiary
  'beneficiary',
  'user',
];
```

### 4. مبدل الأدوار (Role Switcher)

```typescript
// src/components/layout/RoleSwitcher.tsx
const roleRoutes: Record<string, string> = {
  waqf_heir: "/beneficiary-dashboard",
  // ...
};

const roleIcons: Record<string, LucideIcon> = {
  waqf_heir: Users,
  // ...
};
```

### 5. المسارات المحمية

```typescript
// src/routes/beneficiaryRoutes.tsx
<Route
  path="/beneficiary-portal"
  element={
    <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir"]}>
      <BeneficiaryPortal />
    </ProtectedRoute>
  }
/>
```

**المسارات المحمية بـ waqf_heir:**
- `/beneficiary-dashboard`
- `/beneficiary-portal`
- `/beneficiary/requests`
- `/beneficiary/account-statement`
- `/beneficiary/reports`
- `/beneficiary-settings`
- `/beneficiary-support`
- `/beneficiaries/:id` (عرض الملف الشخصي)
- `/payments` (عرض المدفوعات)
- `/governance/decisions` (قرارات الحوكمة)
- `/notifications/settings` (إعدادات الإشعارات)

### 6. الصلاحيات (Permissions)

```typescript
// src/config/permissions.ts
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  waqf_heir: [
    'view_own_data',
    'view_distributions',
    'view_waqf_info',
    'view_properties',
    'view_governance',
    'view_annual_disclosures',
    'view_strategic_plans',
    'submit_request',
    'view_own_requests',
    'manage_own_profile',
  ],
  // ...
};
```

### 7. useUserRole Hook

```typescript
// src/hooks/useUserRole.ts
export function useUserRole() {
  const { user, roles: authRoles, rolesLoading, hasRole: authHasRole } = useAuth();
  
  const isWaqfHeir = hasRole("waqf_heir");
  
  return {
    roles,
    primaryRole,
    isLoading: rolesLoading,
    hasRole,
    isNazer,
    isAdmin,
    isAccountant,
    isCashier,
    isArchivist,
    isBeneficiary,
    isWaqfHeir,  // ✅ إضافة
    isUser,
  };
}
```

---

## 🧭 التنقل للمستفيدين

### بوابة المستفيدين → لوحة التحكم

تم إضافة زر "العودة للرئيسية" في `BeneficiarySidebar`:

```typescript
// src/components/beneficiary/BeneficiarySidebar.tsx
<Button
  variant="outline"
  className="w-full justify-start gap-3"
  onClick={() => {
    navigate('/beneficiary-dashboard');
    setMobileOpen(false);
  }}
>
  <Home className="h-5 w-5" />
  <span>العودة للرئيسية</span>
</Button>
```

**طرق التنقل:**
1. **Desktop**: زر "العودة للرئيسية" في القائمة الجانبية اليمنى
2. **Mobile**: زر "العودة للرئيسية" في القائمة المنزلقة
3. **Bottom Navigation** (Mobile): أيقونة "الرئيسية" في الشريط السفلي

---

## 🔍 الفرق بين beneficiary و waqf_heir

| الميزة | beneficiary | waqf_heir |
|--------|-------------|-----------|
| **العدد** | غير محدود | 14 فقط |
| **الهوية** | مستفيدون عاديون | ورثة شرعيون |
| **الصلاحيات** | محدودة | موسعة |
| **عرض الإفصاحات السنوية** | ❌ | ✅ |
| **عرض الخطط الاستراتيجية** | ❌ | ✅ |
| **عرض قرارات الحوكمة** | ❌ | ✅ |
| **عرض خطط الاستثمار** | ❌ | ✅ |
| **عرض تفاصيل البنوك** | ❌ | ✅ |
| **عرض جميع العقارات** | ❌ | ✅ |
| **الأولوية** | منخفضة | عالية |

---

## ✅ قائمة التحقق النهائية

- [x] إنشاء دور `waqf_heir` في قاعدة البيانات
- [x] إضافة الدور للـ 14 وارث
- [x] إنشاء دالة `is_waqf_heir()`
- [x] تحديث 13 سياسة RLS
- [x] تحديث تعريف النوع في جميع الملفات
- [x] إضافة التسميات والألوان
- [x] تحديث خريطة التوجيه
- [x] تحديث مبدل الأدوار
- [x] حماية المسارات بـ `waqf_heir`
- [x] إضافة الصلاحيات
- [x] تحديث useUserRole Hook
- [x] إضافة زر العودة للرئيسية
- [x] إزالة أدوار `beneficiary` غير المصرح بها
- [x] التوثيق الكامل

---

## 🎯 الخلاصة

تم تطبيق دور `waqf_heir` بنجاح مع:
- ✅ **الأمان**: سياسات RLS محكمة على 13 جدول
- ✅ **الصلاحيات**: صلاحيات موسعة للورثة الـ 14
- ✅ **التنقل**: سهولة الرجوع للوحة التحكم
- ✅ **التوافق**: يعمل جنباً إلى جنب مع `beneficiary`
- ✅ **الأولوية**: `waqf_heir` له أولوية أعلى من `beneficiary`

---

## 📞 الدعم

للاستفسارات أو التعديلات على دور `waqf_heir`، يرجى مراجعة:
- `docs/WAQF_HEIR_IMPLEMENTATION.md` (هذا الملف)
- `src/config/permissions.ts`
- سياسات RLS في قاعدة البيانات

---

**آخر تحديث**: 2025-12-03  
**الإصدار**: 2.6.5  
**الحالة**: ✅ مكتمل ونشط
