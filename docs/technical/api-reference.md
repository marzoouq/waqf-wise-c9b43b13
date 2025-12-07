# 📖 مرجع API | API Reference

**الإصدار:** 2.6.27 | **آخر تحديث:** 2025-12-07

---

## 📋 فهرس المحتويات

1. [Edge Functions](#-edge-functions)
2. [Custom Hooks](#-custom-hooks)
3. [Services](#-services)

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

| Hook | الوصف |
|------|-------|
| `useAuth` | إدارة حالة المصادقة |
| `useUserRole` | جلب دور المستخدم |
| `usePermissions` | التحقق من الصلاحيات |
| `useSessionCleanup` | تنظيف الجلسة |

### المستفيدين (beneficiary/)

| Hook | الوصف |
|------|-------|
| `useBeneficiaries` | جلب قائمة المستفيدين |
| `useBeneficiary` | جلب مستفيد واحد |
| `useBeneficiaryStats` | إحصائيات المستفيد |
| `useBeneficiaryRequests` | طلبات المستفيدين |
| `useFamilyTree` | شجرة العائلة |

### المحاسبة (accounting/)

| Hook | الوصف |
|------|-------|
| `useAccounts` | شجرة الحسابات |
| `useJournalEntries` | القيود اليومية |
| `useTrialBalance` | ميزان المراجعة |
| `useFiscalYears` | السنوات المالية |
| `useBudgets` | الميزانيات |

### العقارات (property/)

| Hook | الوصف |
|------|-------|
| `useProperties` | قائمة العقارات |
| `useContracts` | العقود |
| `useRentalPayments` | مدفوعات الإيجار |
| `useMaintenanceRequests` | طلبات الصيانة |

### التوزيعات (distributions/)

| Hook | الوصف |
|------|-------|
| `useDistributions` | التوزيعات |
| `useDistributionEngine` | محرك التوزيع |
| `useHeirDistributions` | توزيعات الورثة |

### المدفوعات (payments/)

| Hook | الوصف |
|------|-------|
| `usePayments` | المدفوعات |
| `usePaymentVouchers` | سندات الصرف |
| `useBankTransfers` | التحويلات البنكية |

### التقارير (reports/)

| Hook | الوصف |
|------|-------|
| `useFinancialReports` | التقارير المالية |
| `useBeneficiaryReports` | تقارير المستفيدين |
| `usePropertyReports` | تقارير العقارات |

### لوحات التحكم (dashboard/)

| Hook | الوصف |
|------|-------|
| `useNazerKPIs` | مؤشرات الناظر |
| `useCashierStats` | إحصائيات أمين الصندوق |
| `usePendingApprovals` | الموافقات المعلقة |
| `useSmartAlerts` | التنبيهات الذكية |
| `useUnifiedKPIs` | المؤشرات الموحدة |

### الوقف (waqf/)

| Hook | الوصف |
|------|-------|
| `useWaqfUnits` | أقلام الوقف |
| `useWaqfRevenueByFiscalYear` | إيرادات الوقف حسب السنة |

---

## 🔧 Services

### AuthService
```typescript
import { AuthService } from '@/services/AuthService';

// تسجيل الدخول
await AuthService.signIn(email, password);

// تسجيل الخروج
await AuthService.signOut();
```

### ArchiveService
```typescript
import { ArchiveService } from '@/services/ArchiveService';

// رفع مستند
await ArchiveService.uploadDocument(file, metadata);

// جلب المستندات
await ArchiveService.getDocuments(folderId);
```

### LoansService
```typescript
import { LoansService } from '@/services/LoansService';

// إنشاء قرض
await LoansService.createLoan(loanData);

// حساب جدول السداد
LoansService.calculateSchedule(principal, months);
```

---

**الحالة:** ✅ موثق | **الإصدار:** 2.6.27
