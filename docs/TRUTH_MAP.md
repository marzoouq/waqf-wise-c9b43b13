# Truth Map - خريطة مصادر الحقيقة
> آخر تحديث: 2026-01-17

## 📊 مصادر البيانات الموحدة

هذا الملف يوثق مصدر كل رقم/مؤشر في النظام لضمان التناسق وتسهيل التتبع.

---

## 1. مؤشرات الأداء الرئيسية (KPIs)

### 1.1 المستفيدين النشطين
| العنصر | القيمة |
|--------|--------|
| **اللوحات** | Admin, Nazer, Beneficiaries |
| **الجدول** | `beneficiaries` |
| **الفلتر** | `status = 'نشط' OR status = 'active'` |
| **الخدمة** | `KPIService.getUnifiedKPIs()` |
| **Hook** | `useUnifiedKPIs` |
| **الثابت** | `matchesStatus(status, 'active')` |

### 1.2 إجمالي التحصيل
| العنصر | القيمة |
|--------|--------|
| **اللوحات** | Admin, Nazer, Properties |
| **الجدول** | `payment_vouchers` |
| **الفلتر** | `type = 'قبض' OR type = 'receipt', status = 'paid'` |
| **الخدمة** | `PropertyStatsService.getCollectionStats()` |
| **Hook** | `useCollectionStats` |
| **الثابت** | `COLLECTION_SOURCE` |

### 1.3 طلبات الصيانة المفتوحة
| العنصر | القيمة |
|--------|--------|
| **اللوحات** | Admin, Properties |
| **الجدول** | `maintenance_requests` |
| **الفلتر** | `status IN ('جديد', 'قيد التنفيذ', 'في الانتظار', 'تحت المراجعة')` |
| **الخدمة** | `MaintenanceService.getStats()` |
| **Hook** | `useMaintenanceStats` |
| **الثابت** | `MAINTENANCE_OPEN_STATUSES` |

### 1.4 العقود النشطة
| العنصر | القيمة |
|--------|--------|
| **اللوحات** | Admin, Nazer, Properties |
| **الجدول** | `contracts` |
| **الفلتر** | `status = 'نشط' OR status = 'active'` |
| **الخدمة** | `KPIService.getUnifiedKPIs()` |
| **Hook** | `useUnifiedKPIs` |
| **الثابت** | `matchesStatus(status, 'active')` |

### 1.5 المستأجرين النشطين
| العنصر | القيمة |
|--------|--------|
| **اللوحات** | Admin, Properties, Tenants |
| **الجدول** | `tenants` |
| **الفلتر** | `status = 'نشط' OR status = 'active'` |
| **الخدمة** | `TenantService.getStats()` |
| **Hook** | `useTenants` |
| **الثابت** | `matchesStatus(status, 'active')` |

### 1.6 العقارات
| العنصر | القيمة |
|--------|--------|
| **اللوحات** | Admin, Properties |
| **الجدول** | `properties` |
| **الفلتر** | `status = 'مؤجر' OR status = 'rented'` |
| **الخدمة** | `PropertyStatsService.getBasicStats()` |
| **Hook** | `usePropertiesStats` |
| **الثابت** | `matchesStatus(status, 'rented')` |

---

## 2. الثوابت المستخدمة

### 2.1 حالات المستفيدين (`BENEFICIARY_STATUS`)
```typescript
ACTIVE: 'نشط',
INACTIVE: 'غير نشط',
SUSPENDED: 'موقوف',
PENDING: 'معلق',
DECEASED: 'متوفى'
```

### 2.2 حالات العقود (`CONTRACT_STATUS`)
```typescript
ACTIVE: 'نشط',
EXPIRED: 'منتهي',
TERMINATED: 'ملغي',
PENDING: 'معلق',
DRAFT: 'مسودة'
```

### 2.3 حالات المستأجرين (`TENANT_STATUS`)
```typescript
ACTIVE: 'نشط',
ACTIVE_EN: 'active',
INACTIVE: 'غير نشط',
INACTIVE_EN: 'inactive',
SUSPENDED: 'موقوف',
SUSPENDED_EN: 'suspended'
```

### 2.4 حالات الصيانة
```typescript
MAINTENANCE_OPEN_STATUSES: ['جديد', 'قيد التنفيذ', 'في الانتظار', 'تحت المراجعة']
MAINTENANCE_CLOSED_STATUSES: ['مكتمل', 'ملغي', 'مرفوض']
```

### 2.5 حالات السندات (`VOUCHER_STATUS`)
```typescript
DRAFT: 'draft',
PENDING: 'pending',
PAID: 'paid',
CANCELLED: 'cancelled',
CONFIRMED: 'confirmed'
```

### 2.6 حالات سير عمل الموافقات (`APPROVAL_WORKFLOW_STATUS`)
```typescript
PENDING: 'pending',
IN_PROGRESS: 'in_progress',
APPROVED: 'approved',
REJECTED: 'rejected',
COMPLETED: 'completed',
ESCALATED: 'escalated'
```

---

## 3. تدفق البيانات

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Database  │───▶│   Service   │───▶│    Hook     │───▶│  Component  │
│  (Supabase) │    │  (*.service)│    │  (use*.ts)  │    │   (*.tsx)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
  ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
  │  Tables │       │Constants│       │  Cache  │       │   UI    │
  │   RLS   │       │ Filters │       │staleTime│       │ Display │
  └─────────┘       └─────────┘       └─────────┘       └─────────┘
```

---

## 4. الخدمات الموحدة

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `KPIService` | المؤشرات الموحدة | ✅ | ✅ |
| `PropertyStatsService` | إحصائيات العقارات | ✅ | ✅ |
| `TenantService` | إحصائيات المستأجرين | ✅ | ✅ |
| `MaintenanceService` | إحصائيات الصيانة | ✅ | ✅ |
| `BeneficiaryCoreService` | إحصائيات المستفيدين | ✅ | ✅ |
| `LoansService` | إحصائيات القروض | ✅ | ✅ |

---

## 5. اللوحات ومصادرها

| اللوحة | Hook الرئيسي | البيانات |
|--------|-------------|----------|
| AdminDashboard | `useUnifiedKPIs` | KPIs + Charts |
| NazerDashboard | `useUnifiedKPIs` | KPIs + Distribution + Activity |
| AccountantDashboard | `useAccountantKPIs` | Journal + Approvals |
| CashierDashboard | `useCashierStats` | POS + Shifts |
| BeneficiaryPortal | `useBeneficiaryData` | Personal Data |
| TenantPortal | `useTenantData` | Contracts + Payments |
| ArchivistDashboard | `useArchiveStats` | Documents + Folders |
| DeveloperDashboard | `useSystemHealth` | Monitoring + Logs |

---

## 6. قواعد التحقق من الحالات

### استخدام `matchesStatus()`
```typescript
import { matchesStatus } from '@/lib/constants';

// ✅ صحيح - يدعم اللغتين
const isActive = matchesStatus(tenant.status, 'active');

// ❌ خاطئ - لا يدعم اللغتين
const isActive = tenant.status === 'نشط';
```

---

## 7. ملاحظات مهمة

1. **التناسق**: جميع الأرقام يجب أن تأتي من نفس المصدر
2. **الثوابت**: استخدم `matchesStatus()` دائماً للمقارنات
3. **الكاش**: `staleTime` موحد في `QUERY_CONFIG`
4. **Retry**: جميع الخدمات الحرجة تستخدم `withRetry`
5. **RLS**: تأكد من سياسات الوصول قبل الاستعلام

---

## 8. التحديثات

| التاريخ | التغيير |
|---------|---------|
| 2026-01-17 | إنشاء الملف الأولي |
| 2026-01-17 | إضافة `withRetry` للخدمات الحرجة |
| 2026-01-17 | توحيد حالات المستأجرين (عربي/إنجليزي) |
| 2026-01-17 | إضافة `VOUCHER_STATUS` و `APPROVAL_WORKFLOW_STATUS` |
| 2026-01-17 | فحص شامل لـ 56 Edge Function - سليمة |
| 2026-01-17 | فحص RLS - 10 سياسات مفتوحة (مقبولة) |
| 2026-01-17 | تطبيق `matchesStatus` على 20+ ملف |
| 2026-01-17 | تحديث ContractService و TrialBalanceService بـ withRetry |
| 2026-01-17 | تحديث FamiliesStats, RentalPaymentDialog, CreateDistributionDialog, ReportsMenu |
| 2026-01-17 | **إكمال المرحلة 1**: تحديث 12 ملف إضافي لاستخدام `matchesStatus()` |
| 2026-01-17 | إضافة حالات النظام إلى STATUS_MAPPINGS: healthy, acknowledged, stopped, standby, resolved |
| 2026-01-17 | الملفات المحدثة: PropertiesListView, BeneficiariesTable, FamilyMembersDialog, TenantContracts |
| 2026-01-17 | الملفات المحدثة: CreateMaintenanceRequestDialog, AdminAlertsPanel, SelfHealingToolsPanel |
| 2026-01-17 | الملفات المحدثة: useAdminAlerts, useBeneficiariesFilters |
| 2026-01-17 | **إكمال الفحص النهائي للمرحلة 1**: WaqfUnitDetailsDialog, system.service, monitoring.service |
| 2026-01-17 | **المرحلة 2 مكتملة**: فحص 8 لوحات تحكم - جميعها تستخدم useUnifiedKPIs و Realtime hooks |
| 2026-01-17 | **المرحلة 3 مكتملة**: فحص الصفحات الداخلية - تم تحديث 8 صفحات: |
| 2026-01-17 | → EmergencyAidManagement, AllTransactions, Loans, Support |
| 2026-01-17 | → GovernanceDecisions, Invoices + إضافة حالات الحوكمة للثوابت |
| 2026-01-17 | **المرحلة 4 مكتملة**: فحص الخدمات - تم تحديث 7 خدمات: |
| 2026-01-17 | → unified-financial, invoice, maintenance, voucher, payment, approval, analysis |
| 2026-01-17 | **المرحلة 5 مكتملة**: فحص الـ Hooks - تم تحديث 14 Hook: |
| 2026-01-17 | → useSystemMonitoring, useDistributionApprovals, useContractRequests, useContractNotifications |
| 2026-01-17 | → useRequestApprovals, useBeneficiaryPersonalReportsData, useSystemErrorLogsData, useLoanApprovals |
| 2026-01-17 | → useMyBeneficiaryRequests, useCollectionStats, useTransferStatusTracker, usePaymentVouchersData, useBatchPayments |
| 2026-01-17 | **المرحلة 6 مكتملة**: فحص الثوابت - تم إضافة وتحديث: |
| 2026-01-17 | → ثوابت جديدة: OCCUPANCY_STATUS, TICKET_STATUS, TRANSFER_STATUS, DISTRIBUTION_STATUS |
| 2026-01-17 | → ثوابت جديدة: DISCLOSURE_STATUS, ZATCA_CHECK_STATUS |
| 2026-01-17 | → تحديث STATUS_MAPPINGS: إضافة occupied/vacant/published/posted/موافق |
| 2026-01-17 | → المكونات المحدثة: PropertyAccordionView, ViewJournalEntryDialog, AccountingKPIs |
| 2026-01-17 | → المكونات المحدثة: PaymentApprovalsTab, DistributionApprovalsTab, EnhancedDisclosuresTab |
---

## 9. إحصائيات النظام الحالية

| المقياس | القيمة | الحالة |
|---------|--------|--------|
| العقارات | 1 | ✅ سليم |
| الوحدات | 1 | ✅ سليم |
| العقود النشطة | 1 | ✅ سليم (ينتهي نوفمبر 2026) |
| المستأجرين | 2 | ✅ سليم |
| المستفيدين النشطين | 14 | ✅ سليم |
| العائلات | 1 | ✅ سليم |
| طلبات الصيانة المفتوحة | 2 | ✅ سليم |
| إجمالي التحصيل | 1,300 ر.س | ✅ سليم |
| Edge Functions | 56 | ✅ سليمة |
| أخطاء النظام (7 أيام) | 15 | ✅ لا يوجد critical |
| الصفحات | 83 | ✅ سليمة |
| الخدمات | 51+ | ✅ مع withRetry |
| الـ Hooks | 200+ | ✅ مع staleTime |
