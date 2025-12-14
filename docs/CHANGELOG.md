# 📝 سجل التغييرات | Changelog

**الإصدار الحالي:** 2.9.8 | **آخر تحديث:** 2025-12-14

---

## [2.9.8] - 2025-12-14

### 🏗️ تقسيم auth.service.ts وتحسينات الأداء

#### ✅ تقسيم الخدمات
| الخدمة الجديدة | المسؤولية | الأسطر |
|---------------|-----------|--------|
| `permissions.service.ts` | إدارة الصلاحيات | ~120 |
| `two-factor.service.ts` | المصادقة الثنائية | ~85 |
| `auth.service.ts` | المصادقة الأساسية | ~380 (من 481) |

#### ✅ إنشاء useFilteredData Hook
| الدالة | الوصف |
|--------|-------|
| `useFilteredData<T>()` | Hook موحد للتصفية والبحث |
| `useSearchFilter<T>()` | Hook مبسط للبحث فقط |
| `useRoleFilter<T>()` | Hook للفلترة حسب الدور |

#### ✅ تحسين التخزين المؤقت
| البيانات | staleTime | gcTime |
|----------|-----------|--------|
| `allPermissions` | 10 دقائق | 30 دقيقة |
| `rolePermissions` | 5 دقائق | افتراضي |

#### 📁 الملفات الجديدة
| الملف | الوصف |
|-------|-------|
| `src/services/permissions.service.ts` | خدمة الصلاحيات المنفصلة |
| `src/services/two-factor.service.ts` | خدمة المصادقة الثنائية |
| `src/hooks/ui/useFilteredData.ts` | Hook التصفية الموحد |

#### 📊 إحصائيات التحسين
| المقياس | قبل | بعد |
|---------|-----|-----|
| حجم `auth.service.ts` | 481 سطر | 380 سطر |
| خدمات جديدة | 0 | 2 |
| Hooks تصفية موحدة | 0 | 1 (3 دوال) |
| staleTime للصلاحيات | 2 دقيقة | 10 دقائق |

---

## [2.9.7] - 2025-12-14

### 🔐 تحسين نظام إدارة المستخدمين والأدوار (User Management & Roles Enhancement)

#### ✅ المرحلة 1: إصلاحات حرجة
| المشكلة | الحل | الموقع |
|---------|------|--------|
| View `user_profile_with_roles` يربط `p.id` بدلاً من `p.user_id` | تصحيح الربط ليستخدم `p.user_id` | Database View |
| `UserService.getUsersWithRoles()` لا يعمل | تحديث ليستخدم View المصحح | `user.service.ts` |
| صلاحيات الناظر والمدير غير مفعلة | تفعيل 50+ صلاحية في `role_permissions` | Database |

#### ✅ المرحلة 2: تقليل Props Drilling
| التحسين | الوصف |
|---------|-------|
| إنشاء `UsersContext` | Context لتوفير بيانات المستخدمين |
| إنشاء `UsersTableRow` | مكون منفصل لصف المستخدم |
| تحديث `UsersTable` | استخدام المكونات الجديدة |

#### ✅ المرحلة 3: Realtime Updates
| التحسين | الوصف |
|---------|-------|
| إنشاء `useUsersRealtime` | اشتراك Realtime لـ 3 جداول |
| استماع لـ `profiles` | تحديث فوري لبيانات المستخدمين |
| استماع لـ `user_roles` | تحديث فوري للأدوار |
| استماع لـ `role_permissions` | تحديث فوري للصلاحيات |

#### ✅ المرحلة 4: تصدير وتكامل
| التحسين | الوصف |
|---------|-------|
| تحديث `hooks/users/index.ts` | تصدير `useUsersRealtime` |
| إصلاح responsive في `UsersTableRow` | `last_login_at` الآن `hidden lg:table-cell` |

#### 📁 الملفات المعدلة/الجديدة
| الملف | التغيير |
|-------|---------|
| ✨ `src/contexts/UsersContext.tsx` | **جديد** - Context للمستخدمين |
| ✨ `src/components/users/UsersTableRow.tsx` | **جديد** - صف المستخدم |
| ✨ `src/hooks/users/useUsersRealtime.ts` | **جديد** - Realtime hook |
| `src/services/user.service.ts` | تحديث `getUsersWithRoles()` |
| `src/components/users/UsersTable.tsx` | استخدام `UsersTableRow` |
| `src/hooks/users/index.ts` | تصدير الـ hooks الجديدة |
| `src/pages/Users.tsx` | تفعيل Realtime |
| `src/pages/RolesManagement.tsx` | تفعيل Realtime |

#### 📊 إحصائيات التحسين
| المقياس | قبل | بعد |
|---------|-----|-----|
| Props في UsersTable | 9 | 9 (مع UsersTableRow) |
| صلاحيات nazer/admin مفعلة | 0 | 50+ |
| Realtime على جداول المستخدمين | 0 | 3 |
| Hooks مصدرة من users/index | 4 | 5 |

---

## [2.9.6] - 2025-12-14

### 🔧 تدقيق وإصلاح لوحة تحكم المدير (Admin Dashboard Audit & Fixes)

#### ✅ المرحلة 1: إصلاحات حرجة
| المشكلة | الحل | الموقع |
|---------|------|--------|
| `AdminKPIs` يستخدم `useAdminKPIs` بدلاً من `useUnifiedKPIs` | استبدال بـ `useUnifiedKPIs` | `AdminKPIs.tsx` |
| `UsersActivityChart` مكرر في tabs "users" و "performance" | إزالة من tab "performance" | `AdminDashboard.tsx` |
| `AuditLogsPreview` مكرر في tabs "security" و "system" | إزالة من tab "system" | `AdminDashboard.tsx` |

#### ✅ المرحلة 2: توحيد لوحة المحاسب
| المشكلة | الحل |
|---------|------|
| `useAccountantKPIs` hook مستقل | حذف واستخدام `useUnifiedKPIs` |
| `AccountingStats` يستخدم hook قديم | تحديث لـ `useUnifiedKPIs` |
| بيانات المحاسبة غير موجودة في `kpi.service.ts` | إضافة حقول المحاسبة للـ `UnifiedKPIsData` |

#### ✅ المرحلة 3: إصلاحات متوسطة
| المشكلة | الحل |
|---------|------|
| `responseTime` و `cpu` قيم ثابتة (0) | جلب من `system_health_checks` |
| `useSettingsCategories` hook في مجلد settings | نقل إلى `src/hooks/settings/` |
| ثوابت مكررة | إضافة `DASHBOARD_METRICS` و `CHART_CONSTANTS` |

#### ✅ المرحلة 4: تحسينات اختيارية
| التحسين | الوصف |
|---------|-------|
| توحيد معالجة الأخطاء | استخدام `ErrorState` component |
| تحسين Skeleton loading | توحيد الأنماط عبر المكونات |

#### 📊 إحصائيات التحسين
| المقياس | قبل | بعد |
|---------|-----|-----|
| Hooks مكررة لـ KPIs | 3 (Admin, Nazer, Accountant) | 1 (useUnifiedKPIs) |
| مكونات مكررة | 2 (UsersActivity, AuditLogs) | 0 |
| Hook Settings في component | 1 | 0 (منقول لـ hooks/) |
| بيانات أداء ثابتة | 2 (cpu, responseTime) | 0 (جلب ديناميكي) |

#### 📁 الملفات المعدلة/المحذوفة
| الملف | التغيير |
|-------|---------|
| `src/pages/AdminDashboard.tsx` | إزالة التكرارات |
| `src/components/dashboard/admin/AdminKPIs.tsx` | استخدام `useUnifiedKPIs` |
| `src/pages/AccountantDashboard.tsx` | استخدام `useUnifiedKPIs` |
| `src/components/dashboard/AccountingStats.tsx` | استخدام `useUnifiedKPIs` |
| `src/services/dashboard/kpi.service.ts` | إضافة حقول المحاسبة |
| `src/hooks/settings/useSettingsCategories.ts` | نقل من components |
| `src/hooks/system/useSystemPerformanceMetrics.ts` | جلب بيانات فعلية |
| ❌ `src/hooks/accounting/useAccountantKPIs.ts` | **محذوف** |
| ❌ `src/components/dashboard/admin/settings/useSettingsCategories.ts` | **محذوف** |

---

## [2.9.5] - 2025-12-14

### 🏗️ إعادة تنظيم بوابة المستفيد (BeneficiaryPortal Restructure)

#### ✅ المرحلة 1: إصلاحات حرجة (Critical)
| المشكلة | الحل | الموقع |
|---------|------|--------|
| `handleRetry` يستخدم `window.location.reload()` | استبدال بـ `queryClient.invalidateQueries()` + `refetch()` | `BeneficiaryPortal.tsx` |
| `get_beneficiary_statistics` RPC تقرأ من payments فقط | تعديل لتستعلم من `heir_distributions` | Database RPC |
| `beneficiaries.total_received = 0` للجميع | إنشاء Trigger لتحديث من `heir_distributions` | Database Trigger |
| `BeneficiaryStatementsTab` رسالة ثابتة | عرض بيانات ديناميكية من التوزيعات | `BeneficiaryStatementsTab.tsx` |
| `useGovernanceData` بيانات hardcoded | استعلام فعلي من `governance_meetings` و `governance_decisions` | `useGovernanceData.ts` |

#### ✅ المرحلة 2: إصلاحات متوسطة (Medium)
| المشكلة | الحل |
|---------|------|
| `QuickActionsGrid` يستخدم `/support` | تصحيح إلى `/beneficiary-support` |
| `TabRenderer` يستخدم `any` | استبدال بـ `Partial<VisibilitySettings>` |
| `onChangePassword` callback فارغ | ربط بـ `navigate('/settings')` |

#### ✅ المرحلة 3: تحسينات اختيارية (Optional)
| التحسين | الوصف |
|---------|-------|
| توحيد `HeirDistribution` interface | مكان واحد في `types/distribution.ts` |
| إنشاء `MobileCardBase` | مكون أساسي موحد لبطاقات الجوال |
| إضافة `TabErrorBoundary` | عزل الأخطاء لكل تبويب |
| **إعادة تنظيم ملفات التبويبات** | نقل 16 ملف `*Tab.tsx` إلى `tabs/` |

#### 📁 هيكل التبويبات الجديد
```
src/components/beneficiary/
├── tabs/                          ← 16 ملف تبويب منظم
│   ├── BeneficiaryProfileTab.tsx
│   ├── BeneficiaryDistributionsTab.tsx
│   ├── BeneficiaryStatementsTab.tsx
│   ├── BeneficiaryPropertiesTab.tsx
│   ├── BeneficiaryDocumentsTab.tsx
│   ├── BeneficiaryRequestsTab.tsx
│   ├── WaqfSummaryTab.tsx
│   ├── FamilyTreeTab.tsx
│   ├── GovernanceTab.tsx
│   ├── BankAccountsTab.tsx
│   ├── FinancialReportsTab.tsx
│   ├── FinancialTransparencyTab.tsx
│   ├── BudgetsTab.tsx
│   ├── LoansOverviewTab.tsx
│   ├── ApprovalsLogTab.tsx
│   ├── DisclosuresTab.tsx
│   └── index.ts
├── cards/                         ← بطاقات الجوال
│   ├── MobileCardBase.tsx         ← جديد
│   └── ...
├── common/                        ← مكونات مشتركة
│   ├── TabErrorBoundary.tsx       ← جديد
│   └── ...
└── TabRenderer.tsx                ← محدث
```

#### 📊 إحصائيات التحسين
| المقياس | قبل | بعد |
|---------|-----|-----|
| ملفات Tab في الجذر | 16 | 0 |
| ملفات Tab في tabs/ | 0 | 16 |
| Error Boundaries | 0 | 1 (TabErrorBoundary) |
| MobileCardBase | لا يوجد | موجود |

---

## [2.9.2] - 2025-12-13

### 🔧 إصلاحات معمارية وتحسينات الأداء

#### ✅ إصلاح N+1 Query في TenantService
| المشكلة | الحل |
|---------|------|
| `getTenantsAging()` كان يستعلم N+1 مرة | استعلام واحد لجميع سجلات الدفتر ثم معالجة في الذاكرة |
| أداء بطيء مع زيادة المستأجرين | تقليل الاستعلامات من N+1 إلى 2 فقط |

#### ✅ إزالة MainLayout المكرر
- **`TenantDetails.tsx`**: إزالة 3 تكرارات لـ `<MainLayout>` (السطور 44, 55, 67)
- **السبب**: MainLayout موجود في App.tsx للـ protected routes

#### ✅ توحيد QUERY_KEYS في useTenantLedger
| قبل | بعد |
|-----|-----|
| `['tenant-ledger', tenantId]` | `QUERY_KEYS.TENANT_LEDGER(tenantId)` |
| `['tenants-aging']` | `QUERY_KEYS.TENANTS_AGING` |
| `['tenants']` | `QUERY_KEYS.TENANTS` |

---

## [2.8.79] - 2025-12-11

### 📊 المرحلة 4: الرسوم البيانية التحليلية للوحة الناظر

#### ✅ مكونات جديدة
| الملف | الوصف |
|-------|-------|
| `src/components/nazer/NazerAnalyticsSection.tsx` | قسم الرسوم البيانية التحليلية |
| `src/components/nazer/RevenueExpenseChart.tsx` | رسم الإيرادات والمصروفات الشهرية |
| `src/components/nazer/BudgetComparisonChart.tsx` | رسم مقارنة الميزانية بالفعلي |

#### ✅ الرسوم البيانية المضافة
- **الإيرادات والمصروفات**: رسم منطقي (Area Chart) للتدفق الشهري
- **مقارنة الميزانية**: رسم أعمدة أفقي للمقارنة بين المخطط والفعلي
- **توزيع الإيرادات**: رسم دائري لتوزيع الإيرادات حسب المصدر
- **أداء العقارات**: رسم أعمدة لأداء أعلى 6 عقارات

#### 📋 تحسينات UI
- تبويبات داخل البطاقة للتنقل بين الرسوم
- تصميم متجاوب للجوال
- ألوان من نظام التصميم (semantic tokens)
- Lazy loading للرسوم البيانية

---

## [2.8.78] - 2025-12-11

### 🔧 تحسينات لوحات التحكم - المرحلة 1 + 2 + 3

#### ✅ المرحلة 1: إصلاحات حرجة
- **AccountantDashboard**: إضافة `useAccountantDashboardRealtime` للتحديثات المباشرة
- **CashierDashboard**: تفعيل `useCashierDashboardRealtime` (كان موجوداً لكن غير مفعّل)
- **NazerDashboard**: إزالة `PendingApprovalsSection` المكرر من تبويب المستفيدين

#### ✅ المرحلة 2: تحسين التكامل
- **PreviewAsBeneficiaryButton**: زر "معاينة كـ مستفيد" - ميزة Impersonation معتمدة في المنصات الكبيرة
- **LastSyncIndicator**: مؤشر آخر تحديث مع تمييز التحديثات الحديثة

#### ✅ المرحلة 3: تحسين قسم التحكم (60+ إعداد)
- **بحث وفلترة**: شريط بحث للإعدادات + فلتر حسب الفئة
- **أزرار جماعية**: تفعيل الكل / إلغاء الكل / إعادة للافتراضي
- **أزرار لكل فئة**: تفعيل/إلغاء كل إعدادات فئة معينة
- **معاينة التغييرات**: عرض التغييرات المعلقة قبل الحفظ مع خيار التجاهل
- **فئات قابلة للطي**: Collapsible لتسهيل التصفح
- **عداد**: عرض عدد الإعدادات المفعّلة من الإجمالي

#### ✅ ملفات جديدة
| الملف | الوصف |
|-------|-------|
| `src/hooks/dashboard/useAccountantDashboardRealtime.ts` | hook موحد للتحديثات المباشرة للمحاسب |
| `src/components/nazer/PreviewAsBeneficiaryButton.tsx` | زر معاينة كـ مستفيد |
| `src/components/nazer/LastSyncIndicator.tsx` | مؤشر آخر تحديث |

#### 📋 الملفات المعدلة
| الملف | التغيير |
|-------|---------|
| `src/pages/AccountantDashboard.tsx` | إضافة Realtime |
| `src/pages/CashierDashboard.tsx` | تفعيل Realtime |
| `src/pages/NazerDashboard.tsx` | إضافة زر المعاينة + مؤشر التحديث + إزالة التكرار |
| `src/hooks/dashboard/index.ts` | تصدير hook المحاسب الجديد |
| `src/components/nazer/BeneficiaryControlSection.tsx` | إعادة هيكلة كاملة مع بحث وفلترة وأزرار جماعية |

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
