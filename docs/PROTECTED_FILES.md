# الملفات المحمية من التعديل
## Protected Files - DO NOT MODIFY

> **تاريخ الفحص:** 2026-01-19
> **الإصدار:** v2.9.50+
> **الحالة:** ✅ تم الفحص والتأمين

---

## ⚠️ تحذير هام

الملفات المدرجة أدناه **تم فحصها وتأمينها بالكامل** ويُمنع تعديلها أثناء إصلاح الأخطاء.
أي تعديل يجب أن يكون **بطلب صريح من المستخدم** وليس كجزء من إصلاح تلقائي.

---

## 📋 قائمة الملفات المحمية

### 1. لوحة المشرف (Admin Dashboard) - Level: CRITICAL

| الملف | الوصف | حالة الفحص |
|-------|-------|------------|
| `src/pages/AdminDashboard.tsx` | الصفحة الرئيسية للوحة المشرف | ✅ |
| `src/components/dashboard/admin/AdminKPIs.tsx` | بطاقات KPIs الموحدة | ✅ |
| `src/components/dashboard/admin/SystemHealthMonitor.tsx` | مراقبة صحة النظام | ✅ |
| `src/components/dashboard/admin/AdminDashboardErrorBoundary.tsx` | معالج الأخطاء | ✅ |
| `src/components/dashboard/admin/LazyTabContent.tsx` | التحميل الكسول للتبويبات | ✅ |
| `src/components/dashboard/admin/AuditLogsPreview.tsx` | معاينة سجلات التدقيق | ✅ |
| `src/components/dashboard/admin/SecurityAlertsSection.tsx` | قسم التنبيهات الأمنية | ✅ |
| `src/components/dashboard/admin/LoginAttemptsSection.tsx` | قسم محاولات الدخول | ✅ |
| `src/components/dashboard/admin/PermissionsOverviewCard.tsx` | ملخص الصلاحيات | ✅ |
| `src/components/dashboard/admin/SecuritySettingsQuickAccess.tsx` | الوصول السريع للأمان | ✅ |
| `src/components/dashboard/admin/UserManagementSection.tsx` | إدارة المستخدمين | ✅ |
| `src/components/dashboard/admin/SystemPerformanceChart.tsx` | رسم بياني الأداء | ✅ |
| `src/components/dashboard/admin/UsersActivityChart.tsx` | رسم بياني نشاط المستخدمين | ✅ |
| `src/components/dashboard/admin/AdminSettingsSection.tsx` | قسم الإعدادات | ✅ |
| `src/components/dashboard/admin/AdminReportsSection.tsx` | قسم التقارير | ✅ |
| `src/hooks/dashboard/useAdminDashboardRealtime.ts` | اشتراكات Realtime الموحدة | ✅ |

### 2. لوحة الناظر (Nazer Dashboard) - Level: CRITICAL

| الملف | الوصف | حالة الفحص |
|-------|-------|------------|
| `src/pages/NazerDashboard.tsx` | الصفحة الرئيسية للناظر | ✅ |
| `src/hooks/dashboard/useNazerDashboardRealtime.ts` | اشتراكات Realtime | ✅ |

### 3. الـ Hooks الموحدة (Unified Hooks) - Level: HIGH

| الملف | الوصف | حالة الفحص |
|-------|-------|------------|
| `src/hooks/dashboard/useUnifiedKPIs.ts` | مصدر الحقيقة الموحد لـ KPIs | ✅ |
| `src/hooks/dashboard/useCollectionStats.ts` | إحصائيات التحصيل | ✅ |
| `src/hooks/dashboard/useRevenueProgress.ts` | تقدم الإيرادات | ✅ |

### 4. الخدمات الأساسية (Core Services) - Level: HIGH

| الملف | الوصف | حالة الفحص |
|-------|-------|------------|
| `src/services/dashboard/kpi.service.ts` | خدمة KPIs الموحدة | ✅ |
| `src/services/property/property-stats.service.ts` | إحصائيات العقارات | ✅ |
| `src/services/tenant.service.ts` | خدمة المستأجرين | ✅ |
| `src/services/system.service.ts` | خدمة النظام | ✅ |

### 5. الثوابت والتكوين (Constants & Config) - Level: HIGH

| الملف | الوصف | حالة الفحص |
|-------|-------|------------|
| `src/lib/constants.ts` | ثوابت النظام الموحدة | ✅ |
| `src/lib/query-keys.ts` | مفاتيح الاستعلامات الموحدة | ✅ |
| `src/config/permissions.ts` | تكوين الصلاحيات | ✅ |
| `src/types/roles.ts` | أنواع الأدوار الموحدة | ✅ |

### 6. المصادقة والأمان (Auth & Security) - Level: CRITICAL

| الملف | الوصف | حالة الفحص |
|-------|-------|------------|
| `src/contexts/AuthContext.tsx` | سياق المصادقة | ✅ |
| `src/components/auth/ProtectedRoute.tsx` | المسار المحمي | ✅ |
| `src/hooks/auth/useAuth.ts` | hook المصادقة | ✅ |
| `src/hooks/auth/usePermissions.ts` | hook الصلاحيات | ✅ |

---

## 🔒 سياسات التخزين المحمية

| Bucket | الحالة | سياسة الوصول |
|--------|--------|--------------|
| `beneficiary-documents` | 🔒 خاص | الناظر/المشرف فقط |
| `request-attachments` | 🔒 خاص | المستفيد ملفاته فقط |
| `archive-documents` | 🔒 خاص | الموظفون فقط |
| `documents` | 🔒 خاص | الموظفون فقط |

---

## ✅ نتائج الفحص الأخير

### لوحة المشرف (AdminDashboard)

1. **البنية:** ✅ تستخدم `UnifiedDashboardLayout` الموحد
2. **KPIs:** ✅ تستخدم `useUnifiedKPIs` (مصدر الحقيقة الوحيد)
3. **Realtime:** ✅ قناة موحدة `admin-dashboard-unified`
4. **Error Handling:** ✅ `AdminDashboardErrorBoundary` لكل مكون
5. **Lazy Loading:** ✅ `LazyTabContent` للتبويبات
6. **Suspense:** ✅ مع Fallback مناسب
7. **State Management:** ✅ useState للحالة المحلية فقط
8. **QUERY_KEYS:** ✅ موحدة من `src/lib/query-keys.ts`

### الأمان

1. **RLS Policies:** ✅ 700+ سياسة مفحوصة
2. **Storage Security:** ✅ جميع الـ buckets خاصة
3. **Auth:** ✅ لا يوجد DEV_BYPASS_AUTH
4. **Privilege Escalation:** ✅ محمي بـ useRef

---

## 📝 قواعد التعديل

### ❌ ممنوع:
- تعديل هذه الملفات أثناء إصلاح أخطاء عامة
- إضافة imports جديدة دون مراجعة
- تغيير مصادر البيانات (من useUnifiedKPIs لغيره)
- تعديل سياسات RLS للـ buckets

### ✅ مسموح:
- تعديل بطلب صريح من المستخدم
- إصلاح أخطاء TypeScript فقط إذا كانت تمنع البناء
- تحديث النصوص (العناوين، الترجمة)
- إضافة مكونات جديدة (ليس تعديل الموجود)

---

## 🔄 تاريخ التحديثات

| التاريخ | الإجراء | المنفذ |
|---------|---------|--------|
| 2026-01-19 | إنشاء الملف وفحص لوحة المشرف | النظام |
| 2026-01-19 | تأمين storage buckets | النظام |

---

> **ملاحظة:** هذا الملف يُحدث تلقائياً بعد كل عملية فحص شاملة.
