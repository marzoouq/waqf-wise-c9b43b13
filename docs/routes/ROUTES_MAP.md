# 🗺️ خريطة المسارات الكاملة

> دليل شامل لجميع المسارات في النظام مع الأدوار المطلوبة

---

## 📋 جدول المحتويات

1. [المسارات العامة](#المسارات-العامة)
2. [مسارات لوحات التحكم](#مسارات-لوحات-التحكم)
3. [مسارات المستفيد](#مسارات-المستفيد)
4. [المسارات الأساسية](#المسارات-الأساسية)
5. [المسارات المالية](#المسارات-المالية)
6. [مسارات الإدارة](#مسارات-الإدارة)

---

## 🌐 المسارات العامة (Public Routes)

> هذه المسارات متاحة للجميع بدون تسجيل دخول

| المسار | الصفحة | الملف | الوصف |
|--------|--------|-------|-------|
| `/` | LandingPage | `src/pages/LandingPage.tsx` | الصفحة الرئيسية |
| `/login` | Login | `src/pages/Login.tsx` | تسجيل الدخول |
| `/signup` | Signup | `src/pages/Signup.tsx` | إنشاء حساب جديد |
| `/faq` | FAQ | `src/pages/FAQ.tsx` | الأسئلة الشائعة |
| `/contact` | Contact | `src/pages/Contact.tsx` | اتصل بنا |
| `/privacy-policy` | PrivacyPolicy | `src/pages/PrivacyPolicy.tsx` | سياسة الخصوصية |
| `/terms-of-use` | TermsOfUse | `src/pages/TermsOfUse.tsx` | شروط الاستخدام |
| `/security-policy` | SecurityPolicy | `src/pages/SecurityPolicy.tsx` | سياسة الأمان |
| `/waqf-governance-guide` | WaqfGovernanceGuide | `src/pages/WaqfGovernanceGuide.tsx` | دليل حوكمة الوقف |
| `/install` | Install | `src/pages/Install.tsx` | تثبيت التطبيق (PWA) |
| `/unauthorized` | Unauthorized | `src/pages/Unauthorized.tsx` | غير مصرح |
| `*` | NotFound | `src/pages/NotFound.tsx` | صفحة غير موجودة |

### ملف التوجيه
```typescript
// src/routes/publicRoutes.tsx
export const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  // ...
];
```

---

## 🎛️ مسارات لوحات التحكم (Dashboard Routes)

> هذه المسارات محمية وتتطلب أدوار محددة

| المسار | الصفحة | الأدوار المسموحة | الوصف |
|--------|--------|-----------------|-------|
| `/dashboard` | Dashboard | جميع الأدوار | اللوحة الرئيسية |
| `/admin-dashboard` | AdminDashboard | `admin` | لوحة المسؤول |
| `/nazer-dashboard` | NazerDashboard | `nazer`, `admin` | لوحة الناظر |
| `/accountant-dashboard` | AccountantDashboard | `accountant`, `admin` | لوحة المحاسب |
| `/cashier-dashboard` | CashierDashboard | `cashier`, `accountant`, `admin` | لوحة الصراف |
| `/archivist-dashboard` | ArchivistDashboard | `archivist`, `admin` | لوحة أمين الأرشيف |

### ملف التوجيه
```typescript
// src/routes/dashboardRoutes.tsx
export const dashboardRoutes = [
  {
    path: "/admin-dashboard",
    element: <AdminDashboard />,
    allowedRoles: ["admin"]
  },
  {
    path: "/nazer-dashboard",
    element: <NazerDashboard />,
    allowedRoles: ["nazer", "admin"]
  },
  // ...
];
```

---

## 👤 مسارات المستفيد (Beneficiary Routes)

> مسارات خاصة بالمستفيدين فقط

| المسار | الصفحة | الوصف |
|--------|--------|-------|
| `/beneficiary-portal` | BeneficiaryPortal | البوابة الرئيسية |
| `/beneficiary-reports` | BeneficiaryReports | تقارير المستفيد |
| `/beneficiary-requests` | BeneficiaryRequests | الطلبات |
| `/beneficiary-account-statement` | BeneficiaryAccountStatement | كشف الحساب |
| `/beneficiary-settings` | BeneficiarySettings | الإعدادات |
| `/beneficiary-support` | BeneficiarySupport | الدعم |

### ملف التوجيه
```typescript
// src/routes/beneficiaryRoutes.tsx
export const beneficiaryRoutes = [
  {
    path: "/beneficiary-portal",
    element: <BeneficiaryPortal />,
    allowedRoles: ["beneficiary"]
  },
  // ...
];
```

---

## 📦 المسارات الأساسية (Core Routes)

> المسارات الأساسية للنظام

### المستفيدين والعائلات

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/beneficiaries` | Beneficiaries | `nazer`, `admin` |
| `/beneficiary/:id` | BeneficiaryProfile | `nazer`, `admin` |
| `/families` | Families | `nazer`, `admin` |
| `/family/:id` | FamilyDetails | `nazer`, `admin` |

### العقارات والمستأجرين

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/properties` | Properties | `nazer`, `admin` |
| `/waqf-units` | WaqfUnits | `nazer`, `admin` |
| `/tenants` | Tenants | `nazer`, `admin` |
| `/tenant-details/:id` | TenantDetails | `nazer`, `admin` |

### الطلبات والدعم

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/requests` | Requests | `nazer`, `admin` |
| `/staff-requests` | StaffRequestsManagement | `admin` |
| `/emergency-aid` | EmergencyAidManagement | `nazer`, `admin` |
| `/support` | Support | جميع الأدوار |
| `/support-management` | SupportManagement | `admin` |

### الأرشيف والرسائل

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/archive` | Archive | `archivist`, `admin` |
| `/messages` | Messages | جميع الأدوار |
| `/notifications` | Notifications | جميع الأدوار |
| `/knowledge-base` | KnowledgeBase | جميع الأدوار |

---

## 💰 المسارات المالية (Financial Routes)

### المحاسبة

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/accounting` | Accounting | `accountant`, `nazer`, `admin` |
| `/invoices` | Invoices | `accountant`, `nazer`, `admin` |
| `/payments` | Payments | `accountant`, `nazer`, `admin` |
| `/payment-vouchers` | PaymentVouchers | `accountant`, `nazer`, `admin` |
| `/all-transactions` | AllTransactions | `accountant`, `nazer`, `admin` |

### الميزانيات والصناديق

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/budgets` | Budgets | `accountant`, `nazer`, `admin` |
| `/funds` | Funds | `accountant`, `nazer`, `admin` |
| `/loans` | Loans | `accountant`, `nazer`, `admin` |
| `/bank-transfers` | BankTransfers | `accountant`, `nazer`, `admin` |

### السنوات المالية

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/fiscal-years` | FiscalYearsManagement | `nazer`, `admin` |

### نقطة البيع

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/point-of-sale` | PointOfSale | `cashier`, `accountant`, `admin` |

---

## ⚙️ مسارات الإدارة (Admin Routes)

### الحوكمة

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/governance-decisions` | GovernanceDecisions | `nazer`, `admin` |
| `/decision-details/:id` | DecisionDetails | `nazer`, `admin` |
| `/approvals` | Approvals | `nazer`, `admin` |

### التقارير

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/reports` | Reports | `nazer`, `admin` |
| `/custom-reports` | CustomReports | `nazer`, `admin` |

### الذكاء الاصطناعي

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/chatbot` | Chatbot | جميع الأدوار المحمية |
| `/ai-insights` | AIInsights | `nazer`, `admin` |
| `/ai-system-audit` | AISystemAudit | `admin` |

### المراقبة والأمان

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/system-monitoring` | SystemMonitoring | `admin` |
| `/system-error-logs` | SystemErrorLogs | `admin` |
| `/performance-dashboard` | PerformanceDashboard | `admin` |
| `/database-health` | DatabaseHealthDashboard | `admin` |
| `/database-performance` | DatabasePerformanceDashboard | `admin` |
| `/edge-functions-monitor` | EdgeFunctionsMonitor | `admin` |
| `/security-dashboard` | SecurityDashboard | `admin` |
| `/audit-logs` | AuditLogs | `admin` |

### الإعدادات

| المسار | الصفحة | الأدوار |
|--------|--------|---------|
| `/settings` | Settings | جميع الأدوار المحمية |
| `/advanced-settings` | AdvancedSettings | `admin` |
| `/notification-settings` | NotificationSettings | جميع الأدوار المحمية |
| `/transparency-settings` | TransparencySettings | `nazer`, `admin` |
| `/landing-page-settings` | LandingPageSettings | `admin` |
| `/permissions-management` | PermissionsManagement | `admin` |
| `/roles-management` | RolesManagement | `admin` |
| `/users` | Users | `admin` |
| `/integrations-management` | IntegrationsManagement | `admin` |

---

## 🔒 نظام الحماية

### مكون ProtectedRoute

```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}
```

### كيفية الحماية

```typescript
<ProtectedRoute allowedRoles={["admin", "nazer"]}>
  <GovernanceDecisions />
</ProtectedRoute>
```

### التحقق من الصلاحيات

```typescript
// src/hooks/usePermissions.ts
const { hasPermission, hasRole, canAccess } = usePermissions();

// استخدام
if (hasRole("admin")) {
  // عرض خيارات المسؤول
}

if (hasPermission("manage_users")) {
  // عرض إدارة المستخدمين
}
```

---

## 📊 إحصائيات المسارات

| الفئة | العدد |
|-------|-------|
| المسارات العامة | 12 |
| مسارات لوحات التحكم | 6 |
| مسارات المستفيد | 6 |
| المسارات الأساسية | 15 |
| المسارات المالية | 11 |
| مسارات الإدارة | 20 |
| **المجموع** | **70** |

---

## 🔗 الملفات ذات الصلة

- [لوحات التحكم](../dashboards/README.md)
- [الأدوار والصلاحيات](../security/RLS_POLICIES.md)
- [قائمة الفحص](../checklists/FUNCTIONALITY_CHECKLIST.md)
