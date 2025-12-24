# 📖 مرجع API | API Reference

**الإصدار:** 3.1.0 | **آخر تحديث:** 2025-12-24

---

## 📋 فهرس المحتويات

1. [Edge Functions](#-edge-functions)
2. [Custom Hooks](#-custom-hooks)
3. [Services](#-services)
4. [Types](#-types)

---

## ⚡ Edge Functions

### الوظائف المالية

| الوظيفة | المسار | الوصف |
|---------|--------|-------|
| `auto-close-fiscal-year` | `/functions/v1/auto-close-fiscal-year` | إغلاق السنة المالية تلقائياً |
| `auto-create-journal` | `/functions/v1/auto-create-journal` | إنشاء القيود التلقائية |
| `calculate-distribution` | `/functions/v1/calculate-distribution` | حساب التوزيعات |
| `generate-zatca-qr` | `/functions/v1/generate-zatca-qr` | توليد QR للفواتير |
| `zatca-submit` | `/functions/v1/zatca-submit` | تقديم الفواتير لـ ZATCA |

### الوظائف الإدارية

| الوظيفة | المسار | الوصف |
|---------|--------|-------|
| `backup-database` | `/functions/v1/backup-database` | النسخ الاحتياطي |
| `send-notification` | `/functions/v1/send-notification` | إرسال الإشعارات |
| `update-user-email` | `/functions/v1/update-user-email` | تحديث بريد المستخدم |
| `chatbot` | `/functions/v1/chatbot` | المساعد الذكي |

---

## 🪝 Custom Hooks

### المصادقة (auth/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useAuth` | إدارة حالة المصادقة | `const { user, signIn, signOut } = useAuth()` |
| `useUserRole` | جلب دور المستخدم | `const { role, isNazer } = useUserRole()` |
| `usePermissions` | التحقق من الصلاحيات | `const { hasPermission } = usePermissions()` |
| `useSessionCleanup` | تنظيف الجلسة | يُستخدم في SessionManager |

### المستفيدين (beneficiary/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useBeneficiaries` | جلب قائمة المستفيدين | `const { data, isLoading } = useBeneficiaries()` |
| `useBeneficiary` | جلب مستفيد واحد | `const { beneficiary } = useBeneficiary(id)` |
| `useBeneficiaryStats` | إحصائيات المستفيد | `const { stats } = useBeneficiaryStats(id)` |
| `useBeneficiaryRequests` | طلبات المستفيدين | `const { requests } = useBeneficiaryRequests()` |
| `useFamilyTree` | شجرة العائلة | `const { familyMembers } = useFamilyTree(id)` |
| `useBeneficiaryId` | جلب ID المستفيد للمستخدم الحالي | `const { beneficiaryId } = useBeneficiaryId()` |

### المحاسبة (accounting/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useAccounts` | شجرة الحسابات | `const { accounts } = useAccounts()` |
| `useJournalEntries` | القيود اليومية | `const { entries, addEntry } = useJournalEntries()` |
| `useTrialBalance` | ميزان المراجعة | `const { balance } = useTrialBalance()` |
| `useFiscalYears` | السنوات المالية | `const { fiscalYears } = useFiscalYears()` |
| `useActiveFiscalYear` | السنة المالية النشطة | `const { activeFiscalYear } = useActiveFiscalYear()` |
| `useBudgets` | الميزانيات | `const { budgets } = useBudgets()` |
| `useAccountantKPIs` | مؤشرات المحاسب | `const { kpis } = useAccountantKPIs()` |

### العقارات (property/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useProperties` | قائمة العقارات | `const { properties, addProperty } = useProperties()` |
| `useContracts` | العقود | `const { contracts, addContract } = useContracts()` |
| `useRentalPayments` | مدفوعات الإيجار | `const { payments } = useRentalPayments()` |
| `useMaintenanceRequests` | طلبات الصيانة | `const { requests } = useMaintenanceRequests()` |
| `usePropertyUnits` | الوحدات العقارية | `const { units } = usePropertyUnits(propertyId)` |

### المستأجرون (property/) ✨ جديد

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useTenants` | قائمة المستأجرين | `const { tenants, addTenant, updateTenant } = useTenants()` |
| `useTenant` | مستأجر واحد | `const { tenant } = useTenant(id)` |
| `useTenantLedger` | سجل حساب المستأجر | `const { entries, balance, addEntry } = useTenantLedger(tenantId)` |
| `useTenantsAging` | تقرير أعمار الديون | `const { agingData } = useTenantsAging()` |
| `useRecordInvoiceToLedger` | تسجيل فاتورة في السجل | `recordInvoice({ tenantId, invoiceId, amount })` |
| `useRecordPaymentToLedger` | تسجيل دفعة في السجل | `recordPayment({ tenantId, paymentId, amount })` |

### التوزيعات (distributions/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useDistributions` | التوزيعات | `const { distributions } = useDistributions()` |
| `useDistributionEngine` | محرك التوزيع | `const { calculate, simulate } = useDistributionEngine()` |
| `useHeirDistributions` | توزيعات الورثة | `const { heirDistributions } = useHeirDistributions()` |
| `useDistributeRevenue` | توزيع الإيرادات | `const { distribute } = useDistributeRevenue()` |

### المدفوعات (payments/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `usePayments` | المدفوعات | `const { payments } = usePayments()` |
| `usePaymentVouchers` | سندات الصرف | `const { vouchers } = usePaymentVouchers()` |
| `useBankTransfers` | التحويلات البنكية | `const { transfers } = useBankTransfers()` |

### التقارير (reports/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useFinancialReports` | التقارير المالية | `const { reports } = useFinancialReports()` |
| `useBeneficiaryReports` | تقارير المستفيدين | `const { reports } = useBeneficiaryReports()` |
| `usePropertyReports` | تقارير العقارات | `const { reports } = usePropertyReports()` |
| `useUnifiedExport` | تصدير موحد | `const { exportToPDF, exportToExcel } = useUnifiedExport()` |

### لوحات التحكم (dashboard/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useUnifiedKPIs` | **المصدر الموحد لجميع KPIs** | `const { data, isLoading, refresh } = useUnifiedKPIs()` |
| `useNazerSystemOverview` | إحصائيات النظام الشاملة للناظر | `const { data } = useNazerSystemOverview()` |
| `useAdminKPIs` | مؤشرات المشرف (يستخدم useUnifiedKPIs) | `const { data, isLoading } = useAdminKPIs()` |
| `useCashierStats` | إحصائيات أمين الصندوق | `const { stats } = useCashierStats()` |
| `usePendingApprovals` | الموافقات المعلقة | `const { approvals } = usePendingApprovals()` |
| `useSmartAlerts` | التنبيهات الذكية | `const { alerts } = useSmartAlerts()` |
| `useNazerDashboardRealtime` | اشتراكات Realtime موحدة | `useNazerDashboardRealtime()` |
| `useRevenueProgress` | تقدم الإيرادات | `const { progress } = useRevenueProgress()` |

> **ملاحظة:** تم إزالة `useNazerKPIs` المهمل - استخدم `useUnifiedKPIs` مباشرة كمصدر موحد مع Query Key `['unified-dashboard-kpis']` لضمان تناسق البيانات.

### الوقف (waqf/)

| Hook | الوصف | الاستخدام |
|------|-------|----------|
| `useWaqfUnits` | أقلام الوقف | `const { units } = useWaqfUnits()` |
| `useWaqfRevenueByFiscalYear` | إيرادات الوقف حسب السنة | `const { revenue } = useWaqfRevenueByFiscalYear(fiscalYearId)` |

---

## 🔧 Services

### DashboardService 🆕
```typescript
import { DashboardService } from '@/services';

// إحصائيات النظام الشاملة
const systemStats = await DashboardService.getSystemOverview();

// مؤشرات الأداء الموحدة
const kpis = await DashboardService.getUnifiedKPIs();
```

### AuthService
```typescript
import { AuthService } from '@/services/AuthService';

// تسجيل الدخول
await AuthService.signIn(email, password);

// تسجيل الخروج
await AuthService.signOut();

// جلب الجلسة الحالية
const session = await AuthService.getSession();
```

### ArchiveService
```typescript
import { ArchiveService } from '@/services/ArchiveService';

// رفع مستند
await ArchiveService.uploadDocument(file, { folderId, title });

// جلب المستندات
const documents = await ArchiveService.getDocuments(folderId);

// حذف مستند
await ArchiveService.deleteDocument(documentId);
```

### LoansService
```typescript
import { LoansService } from '@/services/LoansService';

// إنشاء قرض
await LoansService.createLoan(loanData);

// حساب جدول السداد
const schedule = LoansService.calculateSchedule(principal, months, interestRate);

// تسجيل دفعة
await LoansService.recordPayment(loanId, amount);
```

---

## 📝 Types

### المستأجرون ✨ جديد
```typescript
// src/types/tenants.ts

export interface Tenant {
  id: string;
  tenant_number: string;
  full_name: string;
  id_type: 'national_id' | 'iqama' | 'passport' | 'commercial_register';
  id_number: string;
  tax_number?: string;
  commercial_register?: string;
  national_address?: string;
  phone: string;
  email?: string;
  bank_name?: string;
  iban?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TenantLedgerEntry {
  id: string;
  tenant_id: string;
  transaction_date: string;
  transaction_type: 'invoice' | 'payment' | 'adjustment' | 'opening_balance';
  reference_type?: string;
  reference_id?: string;
  reference_number?: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  property_id?: string;
  contract_id?: string;
  fiscal_year_id?: string;
  created_at: string;
}

export interface TenantWithBalance extends Tenant {
  current_balance: number;
  total_invoices: number;
  total_payments: number;
}

export interface TenantAgingItem {
  tenant_id: string;
  tenant_name: string;
  current: number;    // 0-30 يوم
  days_30: number;    // 31-60 يوم
  days_60: number;    // 61-90 يوم
  days_90: number;    // 91-120 يوم
  over_90: number;    // أكثر من 120 يوم
  total: number;
}
```

### المستفيدون
```typescript
export interface Beneficiary {
  id: string;
  beneficiary_number?: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string;
  category: 'son' | 'daughter' | 'wife';
  status: 'active' | 'inactive';
  family_id?: string;
  account_balance: number;
  total_received: number;
}
```

### العقارات
```typescript
export interface Property {
  id: string;
  name: string;
  property_type: string;
  location?: string;
  status: string;
  total_units: number;
  monthly_rent: number;
  tax_percentage: number;
}
```

---

**الحالة:** ✅ موثق ومحدّث | **الإصدار:** 2.6.42
