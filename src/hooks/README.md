# 📁 Hooks Directory / مجلد الـ Hooks

هذا المجلد يحتوي على **170+** React Hook منظمة في **36 مجلد فرعي**.

## 🔄 التحديث الأخير (v2.9.23)

**تنظيف شامل تم في 2025-12-16:**
- ✅ حُذف **125+ ملف re-export** غير ضروري من جذر المجلد
- ✅ حُدث **220+ استيراد** للمسارات المباشرة
- ✅ `useAuth` يُستورد الآن من `@/contexts/AuthContext` مباشرة
- ✅ جميع الـ hooks في مجلداتها الفرعية فقط

## 📂 الهيكل الحالي (v2.9.23)

```
src/hooks/
├── index.ts              # تصدير مركزي (barrel exports)
├── README.md             # هذا الملف
├── auth/                 # المصادقة والأمان (9 hooks)
├── beneficiary/          # المستفيدين (14 hooks)
├── accounting/           # المحاسبة (13 hooks)
├── property/             # العقارات (9 hooks)
├── distributions/        # التوزيعات (9 hooks)
├── payments/             # المدفوعات (12 hooks)
├── notifications/        # الإشعارات (8 hooks)
├── requests/             # الطلبات والموافقات (10 hooks)
├── reports/              # التقارير (4 hooks)
├── archive/              # الأرشيف (8 hooks)
├── dashboard/            # لوحات التحكم (12 hooks)
├── system/               # النظام (8 hooks)
├── users/                # المستخدمين (3 hooks)
├── messages/             # الرسائل (3 hooks)
├── support/              # الدعم الفني (5 hooks)
├── ai/                   # الذكاء الاصطناعي (2 hooks)
├── governance/           # الحوكمة (5 hooks)
├── ui/                   # واجهة المستخدم (25 hooks)
├── admin/                # الإدارة (2 hooks)
├── developer/            # أدوات المطورين (10 hooks)
├── security/             # الأمان (2 hooks)
└── transactions/         # المعاملات (2 hooks)
```

## 🔄 طرق الاستيراد

### 1. من المجلد الرئيسي (موصى به للاستيراد العام)
```typescript
import { useBeneficiaries, useNotifications } from '@/hooks';
```

### 2. من المجلد الفرعي (موصى به للاستيراد المحدد)
```typescript
import { useUserRole, usePermissions } from '@/hooks/auth';
import { useBeneficiaries, useFamilies } from '@/hooks/beneficiary';
import { useAccounts, useJournalEntries } from '@/hooks/accounting';
```

### 3. للمصادقة (من AuthContext مباشرة)
```typescript
import { useAuth } from '@/contexts/AuthContext';
```

## 📋 المجلدات الفرعية

### 🔐 auth/
```typescript
import { useAuth, useUserRole, usePermissions } from '@/hooks/auth';
```
| Hook | الوظيفة |
|------|---------|
| `useAuth` | المصادقة الرئيسية |
| `useUserRole` | دور المستخدم |
| `usePermissions` | الصلاحيات |
| `useBiometricAuth` | المصادقة البيومترية |
| `useActiveSessions` | الجلسات النشطة |
| `useLeakedPassword` | فحص كلمات المرور |
| `useIdleTimeout` | انتهاء الجلسة |
| `useSessionCleanup` | تنظيف الجلسات |
| `useProfile` | الملف الشخصي |

### 👥 beneficiary/
```typescript
import { useBeneficiaries, useFamilies } from '@/hooks/beneficiary';
```
| Hook | الوظيفة |
|------|---------|
| `useBeneficiaries` | إدارة المستفيدين |
| `useBeneficiaryProfile` | ملف المستفيد |
| `useBeneficiaryLoans` | قروض المستفيد |
| `useBeneficiaryRequests` | طلبات المستفيد |
| `useBeneficiaryAttachments` | مرفقات المستفيد |
| `useBeneficiaryActivityLog` | سجل النشاط |
| `useBeneficiaryCategories` | التصنيفات |
| `useBeneficiaryEmergencyAid` | الفزعات الطارئة |
| `useBeneficiariesFilters` | الفلاتر |
| `useFamilies` | العائلات |
| `useFamiliesPage` | صفحة العائلات |
| `useTribes` | القبائل |
| `useEligibilityAssessment` | تقييم الأهلية |
| `useMyBeneficiaryRequests` | طلباتي |

### 💰 accounting/
```typescript
import { useAccounts, useJournalEntries } from '@/hooks/accounting';
```
| Hook | الوظيفة |
|------|---------|
| `useAccounts` | شجرة الحسابات |
| `useJournalEntries` | القيود اليومية |
| `useBudgets` | الميزانيات |
| `useFiscalYears` | السنوات المالية |
| `useFiscalYearClosings` | إقفال السنة |
| `useAutoJournalTemplates` | قوالب القيود |
| `useCashFlows` | التدفقات النقدية |
| `useFinancialAnalytics` | التحليلات المالية |
| `useFinancialData` | البيانات المالية |
| `useFinancialReports` | التقارير المالية |
| `useAccountingFilters` | فلاتر المحاسبة |
| `useAccountingStats` | إحصائيات المحاسبة |
| `useAccountingTabs` | تبويبات المحاسبة |

### 🏠 property/
```typescript
import { useProperties, useContracts } from '@/hooks/property';
```
| Hook | الوظيفة |
|------|---------|
| `useProperties` | العقارات |
| `useContracts` | العقود |
| `useRentalPayments` | دفعات الإيجار |
| `usePropertyUnits` | الوحدات العقارية |
| `usePropertiesDialogs` | حوارات العقارات |
| `usePropertiesStats` | إحصائيات العقارات |
| `useMaintenanceRequests` | طلبات الصيانة |
| `useMaintenanceSchedules` | جداول الصيانة |
| `useMaintenanceProviders` | مقدمي الصيانة |

### 📊 distributions/
```typescript
import { useDistributions, useDistributionEngine } from '@/hooks/distributions';
```
| Hook | الوظيفة |
|------|---------|
| `useDistributions` | التوزيعات |
| `useDistributionDetails` | تفاصيل التوزيع |
| `useDistributionEngine` | محرك التوزيع |
| `useDistributionSettings` | إعدادات التوزيع |
| `useDistributionApprovals` | موافقات التوزيع |
| `useFunds` | الصناديق |
| `useWaqfUnits` | أقلام الوقف |
| `useWaqfBudgets` | ميزانيات الوقف |
| `useWaqfSummary` | ملخص الوقف |

### 💳 payments/
```typescript
import { usePayments, useLoans } from '@/hooks/payments';
```
| Hook | الوظيفة |
|------|---------|
| `usePayments` | المدفوعات |
| `usePaymentVouchers` | سندات الصرف |
| `useBatchPayments` | الدفعات الجماعية |
| `useBankAccounts` | الحسابات البنكية |
| `useBankReconciliation` | التسوية البنكية |
| `useBankMatching` | مطابقة البنك |
| `useLoans` | القروض |
| `useLoanInstallments` | الأقساط |
| `useLoanPayments` | مدفوعات القروض |
| `useInvoices` | الفواتير |
| `useInvoicesPage` | صفحة الفواتير |
| `useInvoiceOCR` | OCR للفواتير |

### 🔔 notifications/
```typescript
import { useNotifications, useSmartAlerts } from '@/hooks/notifications';
```
| Hook | الوظيفة |
|------|---------|
| `useNotifications` | الإشعارات |
| `useNotificationSystem` | نظام الإشعارات |
| `usePushNotifications` | إشعارات Push |
| `useRealtimeNotifications` | الإشعارات الفورية |
| `useDisclosureNotifications` | إشعارات الإفصاح |
| `useSmartAlerts` | التنبيهات الذكية |
| `useSecurityAlerts` | تنبيهات الأمان |
| `useAlertCleanup` | تنظيف التنبيهات |

### 📝 requests/
```typescript
import { useRequests, useApprovals } from '@/hooks/requests';
```
| Hook | الوظيفة |
|------|---------|
| `useRequests` | الطلبات |
| `useRequestsPage` | صفحة الطلبات |
| `useRequestApprovals` | موافقات الطلبات |
| `useRequestAttachments` | مرفقات الطلبات |
| `useRequestComments` | تعليقات الطلبات |
| `useApprovals` | الموافقات |
| `useApprovalHistory` | سجل الموافقات |
| `useApprovalPermissions` | صلاحيات الموافقات |
| `useApprovalWorkflows` | مسارات الموافقات |
| `usePendingApprovals` | الموافقات المعلقة |

### 📈 reports/
```typescript
import { useReports, useScheduledReports } from '@/hooks/reports';
```
| Hook | الوظيفة |
|------|---------|
| `useReports` | التقارير |
| `useCustomReports` | التقارير المخصصة |
| `useScheduledReports` | التقارير المجدولة |
| `useAnnualDisclosures` | الإفصاحات السنوية |

### 📁 archive/
```typescript
import { useDocuments, useFolders } from '@/hooks/archive';
```
| Hook | الوظيفة |
|------|---------|
| `useDocuments` | المستندات |
| `useDocumentUpload` | رفع المستندات |
| `useDocumentVersions` | إصدارات المستندات |
| `useDocumentTags` | تصنيفات المستندات |
| `useFolders` | المجلدات |
| `useArchiveStats` | إحصائيات الأرشيف |
| `useArchivistDashboard` | لوحة الأرشيفي |
| `useArchivistDashboardRealtime` | تحديثات لوحة الأرشيفي الفورية |

### 📊 dashboard/
```typescript
import { useUnifiedKPIs, useCashierStats } from '@/hooks/dashboard';
```
| Hook | الوظيفة |
|------|---------|
| `useDashboardConfigs` | إعدادات اللوحات |
| `useDashboardKPIs` | مؤشرات الأداء |
| `useKPIs` | المؤشرات |
| `useUnifiedKPIs` | **المصدر الموحد لجميع KPIs** ✅ |
| `useNazerSystemOverview` | إحصائيات النظام الشاملة 🆕 |
| `useAccountantKPIs` | مؤشرات المحاسب |
| `useAdminKPIs` | مؤشرات المدير |
| `useCashierStats` | إحصائيات أمين الصندوق |
| `useArchivistDashboard` | لوحة الأرشيفي |

> **ملاحظة:** تم حذف `useNazerKPIs` المهمل - استخدم `useUnifiedKPIs` مباشرة

### ⚙️ system/
```typescript
import { useSystemHealth, useAuditLogs } from '@/hooks/system';
```
| Hook | الوظيفة |
|------|---------|
| `useSystemHealth` | صحة النظام |
| `useSystemMonitoring` | مراقبة النظام |
| `useSystemSettings` | إعدادات النظام |
| `useSystemPerformanceMetrics` | مقاييس الأداء |
| `useUsersActivityMetrics` | نشاط المستخدمين |
| `useBackup` | النسخ الاحتياطي |
| `useSelfHealing` | الإصلاح التلقائي |
| `useAuditLogs` | سجل المراجعة |

### 👤 users/
```typescript
import { useUsersManagement, useRolesManagement } from '@/hooks/users';
```
| Hook | الوظيفة |
|------|---------|
| `useUsersManagement` | إدارة المستخدمين |
| `useRolesManagement` | إدارة الأدوار |
| `usePermissionsManagement` | إدارة الصلاحيات |

### 💬 messages/
```typescript
import { useMessages, useChatbot } from '@/hooks/messages';
```
| Hook | الوظيفة |
|------|---------|
| `useMessages` | الرسائل |
| `useInternalMessages` | الرسائل الداخلية |
| `useChatbot` | المساعد الذكي |

### 🎧 support/
```typescript
import { useSupportTickets } from '@/hooks/support';
```
| Hook | الوظيفة |
|------|---------|
| `useSupportTickets` | تذاكر الدعم |
| `useSupportStats` | إحصائيات الدعم |
| `useTicketComments` | تعليقات التذاكر |
| `useTicketRating` | تقييم التذاكر |
| `useAgentAvailability` | توفر الوكلاء |

### 🤖 ai/
```typescript
import { useAIInsights, useIntelligentSearch } from '@/hooks/ai';
```
| Hook | الوظيفة |
|------|---------|
| `useAIInsights` | الرؤى الذكية |
| `useIntelligentSearch` | البحث الذكي |

### 🏛️ governance/
```typescript
import { useGovernanceDecisions } from '@/hooks/governance';
```
| Hook | الوظيفة |
|------|---------|
| `useGovernanceData` | بيانات الحوكمة |
| `useGovernanceDecisions` | قرارات الحوكمة |
| `useGovernanceVoting` | التصويت |
| `useVisibilitySettings` | إعدادات الشفافية |
| `useOrganizationSettings` | إعدادات المؤسسة |

### 🎨 ui/
```typescript
import { useIsMobile, useToast } from '@/hooks/ui';
```
| Hook | الوظيفة |
|------|---------|
| `useIsMobile` | فحص الجوال |
| `useMediaQuery` | استعلامات الوسائط |
| `useToast` | الإشعارات المنبثقة |
| `useLocalStorage` | التخزين المحلي |
| `useKeyboardShortcuts` | اختصارات لوحة المفاتيح |
| `useExport` | التصدير |
| `useExportToExcel` | التصدير لإكسل |
| `useGlobalSearch` | البحث الشامل |
| `useAdvancedSearch` | البحث المتقدم |
| `useSavedFilters` | الفلاتر المحفوظة |
| `useSavedSearches` | البحث المحفوظ |
| `useTableSort` | ترتيب الجداول |
| `useBulkSelection` | التحديد المتعدد |
| `useCrudDialog` | حوارات CRUD |
| `usePrint` | الطباعة |
| `useImageOptimization` | تحسين الصور |
| `useTranslation` | الترجمة |
| `useContactForm` | نموذج التواصل |
| `useTasks` | المهام |
| `useActivities` | الأنشطة |
| `useKnowledgeArticles` | مقالات المعرفة |
| `useKnowledgeBase` | قاعدة المعرفة |
| `useProjectDocumentation` | توثيق المشروع |
| `useEmergencyAid` | الفزعات الطارئة |
| `useDebouncedCallback` | Debounce |

## 📊 الإحصائيات

| الفئة | عدد الـ Hooks |
|-------|--------------|
| auth | 9 |
| beneficiary | 14 |
| accounting | 13 |
| property | 9 |
| distributions | 9 |
| payments | 12 |
| notifications | 8 |
| requests | 10 |
| reports | 4 |
| archive | 8 |
| dashboard | 12 |
| admin | 2 |
| system | 8 |
| users | 3 |
| messages | 3 |
| support | 5 |
| ai | 2 |
| governance | 5 |
| ui | 25 |
| developer | 10 |
| security | 2 |
| transactions | 2 |
| **الإجمالي** | **300+** |

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.0.0
