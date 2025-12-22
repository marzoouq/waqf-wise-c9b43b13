# 📁 Routes Directory / مجلد المسارات

هذا المجلد يحتوي على تعريفات مسارات التطبيق مُصنّفة حسب النوع.

## 📂 الهيكل

```
src/routes/
├── index.ts              # تصدير مركزي
├── lazyPages.ts          # تعريفات الصفحات (lazy loaded)
├── publicRoutes.tsx      # المسارات العامة
├── beneficiaryRoutes.tsx # مسارات المستفيدين
├── dashboardRoutes.tsx   # لوحات التحكم
├── adminRoutes.tsx       # مسارات الإدارة
└── coreRoutes.tsx        # المسارات الأساسية
```

## 📋 المحتويات

### 📄 lazyPages.ts
جميع الصفحات معرّفة هنا باستخدام `lazy()` للتحميل الكسول:

```typescript
// الصفحات العامة
export const LandingPage = lazyWithRetry(() => import("@/pages/LandingPage"));
export const Login = lazyWithRetry(() => import("@/pages/Login"));

// لوحات التحكم
export const Dashboard = lazyWithRetry(() => import("@/pages/Dashboard"));
export const NazerDashboard = lazyWithRetry(() => import("@/pages/NazerDashboard"));

// المحاسبة
export const Accounting = lazyWithRetry(() => import("@/pages/Accounting"));
// ... 70+ صفحة أخرى
```

### 🌐 publicRoutes.tsx
المسارات التي لا تتطلب مصادقة:
- `/` - الصفحة الرئيسية
- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب
- `/forgot-password` - استعادة كلمة المرور
- `/reset-password` - إعادة تعيين كلمة المرور
- `/contact` - التواصل
- `/about` - عن المنصة

### 👥 beneficiaryRoutes.tsx
مسارات بوابة المستفيدين:
- `/beneficiary-dashboard` - لوحة تحكم المستفيد
- `/beneficiary-profile` - الملف الشخصي
- `/beneficiary-submit-request` - تقديم طلب
- `/beneficiary-account-statement` - كشف الحساب
- `/beneficiary-documents` - المستندات
- `/beneficiary-messages` - الرسائل
- `/beneficiary-support` - الدعم

### 📊 dashboardRoutes.tsx
لوحات التحكم المتخصصة:
- `/dashboard` - لوحة التحكم الرئيسية
- `/nazer-dashboard` - لوحة الناظر
- `/admin-dashboard` - لوحة المدير
- `/accountant-dashboard` - لوحة المحاسب
- `/cashier-dashboard` - لوحة أمين الصندوق
- `/archivist-dashboard` - لوحة الأرشيفي
- `/employee-dashboard` - لوحة الموظف

### ⚙️ adminRoutes.tsx
مسارات الإدارة والنظام:
- `/settings` - الإعدادات
- `/users` - إدارة المستخدمين
- `/roles-permissions` - الأدوار والصلاحيات
- `/audit-logs` - سجل المراجعة
- `/system-health` - صحة النظام
- `/backup-restore` - النسخ الاحتياطي
- `/integrations` - التكاملات
- `/api-keys` - مفاتيح API

### 🏠 coreRoutes.tsx
المسارات الأساسية للتطبيق:
- `/beneficiaries` - المستفيدين
- `/properties` - العقارات
- `/contracts` - العقود
- `/accounting` - المحاسبة
- `/distributions` - التوزيعات
- `/archive` - الأرشيف
- `/reports` - التقارير
- `/notifications` - الإشعارات
- ... والمزيد

## 🔄 طريقة الاستخدام

### في App.tsx
```typescript
import { 
  publicRoutes, 
  beneficiaryStandaloneRoutes, 
  dashboardRoutes,
  adminRoutes,
  coreRoutes,
  beneficiaryProtectedRoutes,
} from "./routes";

<Routes>
  {publicRoutes}
  <Route path="/redirect" element={<RoleBasedRedirect />} />
  {beneficiaryStandaloneRoutes}
  <Route path="/*" element={/* MainLayout */}>
    <Routes>
      {dashboardRoutes}
      {adminRoutes}
      {beneficiaryProtectedRoutes}
      {coreRoutes}
    </Routes>
  </Route>
</Routes>
```

### إضافة مسار جديد

1. أضف الصفحة في `lazyPages.ts`:
```typescript
export const NewPage = lazyWithRetry(() => import("@/pages/NewPage"));
```

2. أضف المسار في الملف المناسب:
```typescript
// في coreRoutes.tsx
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.1.0
