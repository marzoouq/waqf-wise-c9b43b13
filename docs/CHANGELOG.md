# 📝 سجل التغييرات | Changelog

**الإصدار الحالي:** 2.8.77 | **آخر تحديث:** 2025-12-11

---

## [2.8.77] - 2025-12-11

### 🔧 إصلاح مشاكل التمرير وأخطاء 404

#### ✅ أخطاء 404 تم إصلاحها
- **QuickActionsGrid.tsx**: تصحيح المسارات من `/beneficiary-portal` إلى `/beneficiary-dashboard`
  - مسار الإفصاح السنوي
  - مسار كشف الحساب

#### ✅ إصلاح التصلب في التمرير
- **BeneficiaryPortal.tsx**: إعادة هيكلة الحاوية الرئيسية
  - `h-screen + overflow-hidden` على الحاوية الخارجية
  - `overflow-y-auto + overscroll-contain + touch-pan-y` على main
- **ViewDisclosureDialog.tsx**: استبدال `ScrollArea` بـ `div` مع CSS مباشر
  - إضافة `-webkit-overflow-scrolling: touch` للجوال
  - إضافة `touch-pan-y` للتمرير السلس
- **scroll-area.tsx**: تحسين مكون ScrollArea
  - إضافة `overflow-y-auto + overscroll-contain` للـ Viewport
  - إضافة `WebkitOverflowScrolling: touch`
- **index.css**: تحسينات CSS للجوال
  - إيقاف `scroll-behavior: smooth` على الجوال (max-width: 1024px)
  - إضافة `-webkit-overflow-scrolling: touch` لـ main
  - إضافة `overflow-x: hidden` على body

#### 📋 الملفات المعدلة
| الملف | التغيير |
|-------|---------|
| `src/components/beneficiary/sections/QuickActionsGrid.tsx` | تصحيح المسارات |
| `src/pages/BeneficiaryPortal.tsx` | إعادة هيكلة التمرير |
| `src/components/distributions/ViewDisclosureDialog.tsx` | إصلاح تمرير الحوار |
| `src/components/ui/scroll-area.tsx` | تحسين touch scrolling |
| `src/index.css` | تحسينات CSS للجوال |

---

## [2.8.51] - 2025-12-09

### 🧹 تنظيف الكود وإصلاح الأنواع

#### ✅ ما تم إصلاحه
- **إزالة 110 استخدام لـ `any` type** من 12 ملف خدمة و hook
- **تنظيف 45 تنبيه قديم** من النظام
- **إصلاح الأنواع في الخدمات:**
  - `ApprovalService` - أنواع محددة للموافقات
  - `PaymentService` - أنواع Database للحسابات البنكية
  - `AccountingService` - واجهات محلية لسطور القيود
  - `POSService` - واجهة RentalPaymentItem
  - `RealtimeService` - RealtimePostgresChangesPayload

#### ✅ Hooks تم تحسينها
- `usePermissions` - واجهة UserPermission
- `useRequestApprovals` - إزالة any من فحص الحالة
- `useRequestAttachments` - إزالة any من find
- `useFiscalYearClosings` - Parameters type
- `useDailySettlement` - ShiftReport type
- `useNotifications` - تبسيط callbacks
- `useErrorNotifications` - تبسيط callbacks

#### 📊 إحصائيات الجودة
| المقياس | قبل | بعد |
|---------|-----|-----|
| `any` types | 110 | ~5 (مقبولة) |
| System Alerts | 45 | 0 |
| System Errors | undefined | 0 |
| Build Errors | 0 | 0 |

---

## [2.8.50] - 2025-12-09

### 🔧 إصلاح خطأ useContext و تحديث الخدمات

#### ✅ ما تم إصلاحه
- **خطأ `Cannot read properties of null (reading 'useContext')`:** 
  - السبب: `next-themes` يُحمّل قبل React في chunks
  - الحل: إنشاء chunk `react-core` يحتوي React + next-themes + sonner معاً
  - ملف: `vite.config.ts`

#### ✅ خدمات جديدة تم إنشاؤها
- `WaqfService` - إدارة ربط العقارات بأقلام الوقف
- `DocumentService` - عرض الفواتير والسندات
- `DiagnosticsService` - التشخيص المتقدم
- `SearchService` - البحث المتقدم

#### ✅ Hooks جديدة
- `useWaqfProperties` - إدارة عقارات الوقف
- `useDocumentViewer` - عرض المستندات

#### ✅ Components تم تحويلها للهيكل الجديد
- `PaymentsTab.tsx` → يستخدم `useDocumentViewer`
- `LinkPropertyDialog.tsx` → يستخدم `useWaqfProperties`
- `WaqfUnitDetailsDialog.tsx` → يستخدم `useWaqfProperties`
- `MultiChannelNotifications.tsx` → يستخدم services

#### ✅ Hooks تم تحويلها
- `useLeakedPassword.ts` → يستخدم `SecurityService`
- `useDeepDiagnostics.ts` → يستخدم `DiagnosticsService`
- `useAdvancedSearch.ts` → يستخدم `SearchService`

---

## [2.8.46] - 2025-12-09

### 🔍 تدقيق معماري شامل (Comprehensive Architecture Audit)

#### 📊 حالة الهيكل المعماري

| المكون | الحالة | التفاصيل |
|--------|--------|----------|
| **الخدمات** | ✅ مكتمل | 47 خدمة في `src/services/` |
| **الـ Hooks** | ✅ مكتمل | 170+ hook في 25 مجلد |
| **QUERY_KEYS** | ✅ مكتمل | موحد في `src/lib/query-keys.ts` |
| **Realtime** | ✅ مكتمل | موحد للوحات التحكم |
| **Components** | ✅ مكتمل | جميع المكونات تستخدم الهيكل الصحيح |

#### ✅ ما تم إنجازه
- جميع الـ Hooks تستخدم Services
- جميع الـ Components تستخدم Hooks
- QUERY_KEYS موحد ومحدث
- Realtime موحد في hooks مخصصة

---

## [2.8.45] - 2025-12-09

### 🏗️ تحسينات الهيكل المعماري
- نقل Realtime من 3 components إلى hooks
- توحيد QUERY_KEYS موجود ومحدث
- إزالة استيرادات supabase مباشرة من بعض Components
- 42 خدمة متكاملة

---

## [2.6.42] - 2025-12-08

### 🏗️ تحسين الهيكل المعماري (Architecture Improvements)

#### ✨ الميزات الجديدة
- **DashboardService:** طبقة خدمة جديدة للـ Dashboard
- **ثوابت الحالة الجديدة:** `PROPERTY_STATUS`, `CONTRACT_STATUS`, `LOAN_STATUS`, `REQUEST_STATUS`

#### 🔧 التحسينات
- **useNazerSystemOverview:** يستخدم الآن `DashboardService.getSystemOverview()`
- **useUnifiedKPIs:** يستخدم الآن `DashboardService.getUnifiedKPIs()`

---

## [2.6.39] - 2025-12-07

### 🔄 توحيد مصادر بيانات لوحات التحكم

---

## [2.6.38] - 2025-12-07

### 🏢 نظام إدارة المستأجرين الشامل

#### ✨ الميزات الجديدة
- **جدول المستأجرين `tenants`**
- **سجل حساب المستأجر `tenant_ledger`**
- **حساب ذمم المستأجرين (1.2.1)**
- **تقرير أعمار الديون**

---

## [2.6.36] - 2025-12-07

### 🆕 نظام نقطة البيع (POS)

---

## الإصدارات السابقة

للاطلاع على سجل التغييرات الكامل، راجع الإصدارات السابقة في Git history.

---

**ملاحظة:** هذا التوثيق يعكس الحالة الفعلية للمشروع بعد التدقيق المعماري الشامل في 2025-12-09.
