# 📁 Hooks Directory / مجلد الـ Hooks

هذا المجلد يحتوي على **180+** React Hook مُنظّمة في **17 مجلد فرعي**.

## 📂 الهيكل

```
src/hooks/
├── index.ts              # تصدير مركزي شامل
├── auth/                 # المصادقة والأمان (7 hooks)
├── beneficiary/          # المستفيدين (10 hooks)
├── accounting/           # المحاسبة والمالية (12 hooks)
├── distribution/         # التوزيعات والدفعات (7 hooks)
├── property/             # العقارات والصيانة (9 hooks)
├── banking/              # العمليات البنكية (7 hooks)
├── notification/         # الإشعارات والتنبيهات (7 hooks)
├── dashboard/            # لوحات التحكم (9 hooks)
├── search/               # البحث والفلاتر (5 hooks)
├── support/              # الدعم والرسائل (10 hooks)
├── archive/              # الأرشفة والمستندات (6 hooks)
├── loans/                # القروض (3 hooks)
├── approvals/            # الموافقات (6 hooks)
├── system/               # النظام والإدارة (15 hooks)
├── governance/           # الحوكمة (5 hooks)
├── reports/              # التقارير (4 hooks)
├── requests/             # الطلبات (4 hooks)
└── ui/                   # الواجهة والأدوات (17 hooks)
```

## 🔄 طرق الاستيراد

### 1. من الـ index الرئيسي (مُوصى به)
```typescript
import { useAuth, useBeneficiaries, useNotifications } from '@/hooks';
```

### 2. من المجلد الفرعي
```typescript
import { useAuth, useBiometricAuth } from '@/hooks/auth';
import { useBeneficiaries, useFamilies } from '@/hooks/beneficiary';
```

### 3. من الملف المباشر (للتوافقية)
```typescript
import { useAuth } from '@/hooks/useAuth';
```

## 📋 فهرس الـ Hooks حسب المجلد

### 🔐 auth/
| Hook | الوظيفة |
|------|---------|
| `useAuth` | المصادقة الرئيسية |
| `useBiometricAuth` | المصادقة البيومترية |
| `useActiveSessions` | الجلسات النشطة |
| `useLeakedPassword` | فحص كلمات المرور المسربة |
| `useIdleTimeout` | انتهاء الجلسة |
| `usePermissions` | الصلاحيات |
| `useUserRole` | دور المستخدم |

### 👥 beneficiary/
| Hook | الوظيفة |
|------|---------|
| `useBeneficiaries` | قائمة المستفيدين |
| `useBeneficiaryProfile` | ملف المستفيد |
| `useBeneficiaryRequests` | طلبات المستفيد |
| `useBeneficiaryAttachments` | مرفقات المستفيد |
| `useBeneficiaryActivityLog` | سجل نشاط المستفيد |
| `useBeneficiaryCategories` | تصنيفات المستفيدين |
| `useBeneficiariesFilters` | فلاتر المستفيدين |
| `useFamilies` | العائلات |
| `useTribes` | القبائل |
| `useEligibilityAssessment` | تقييم الأهلية |

### 💰 accounting/
| Hook | الوظيفة |
|------|---------|
| `useJournalEntries` | القيود اليومية |
| `useAccounts` | الحسابات |
| `useAccountingStats` | إحصائيات المحاسبة |
| `useAccountingTabs` | تبويبات المحاسبة |
| `useAccountingFilters` | فلاتر المحاسبة |
| `useBudgets` | الميزانيات |
| `useCashFlows` | التدفقات النقدية |
| `useFiscalYears` | السنوات المالية |
| `useAutoJournalTemplates` | قوالب القيود التلقائية |
| `useFinancialData` | البيانات المالية |
| `useFinancialAnalytics` | التحليلات المالية |
| `useFinancialReports` | التقارير المالية |

### 📊 distribution/
| Hook | الوظيفة |
|------|---------|
| `useDistributions` | التوزيعات |
| `useDistributionEngine` | محرك التوزيع |
| `useDistributionDetails` | تفاصيل التوزيع |
| `useDistributionSettings` | إعدادات التوزيع |
| `useDistributionApprovals` | موافقات التوزيع |
| `useBatchPayments` | الدفعات الجماعية |
| `useEmergencyAid` | المساعدات الطارئة |

### 🏢 property/
| Hook | الوظيفة |
|------|---------|
| `useProperties` | العقارات |
| `usePropertiesDialogs` | محاورات العقارات |
| `usePropertiesStats` | إحصائيات العقارات |
| `usePropertyUnits` | الوحدات العقارية |
| `useContracts` | العقود |
| `useRentalPayments` | دفعات الإيجار |
| `useMaintenanceRequests` | طلبات الصيانة |
| `useMaintenanceSchedules` | جداول الصيانة |
| `useMaintenanceProviders` | مزودي الصيانة |

### 🏦 banking/
| Hook | الوظيفة |
|------|---------|
| `useBankAccounts` | الحسابات البنكية |
| `useBankReconciliation` | المطابقة البنكية |
| `useBankMatching` | مطابقة البنك |
| `usePayments` | المدفوعات |
| `usePaymentVouchers` | سندات الصرف |
| `useInvoices` | الفواتير |
| `useInvoiceOCR` | OCR للفواتير |

### 🔔 notification/
| Hook | الوظيفة |
|------|---------|
| `useNotifications` | الإشعارات |
| `useRealtimeNotifications` | الإشعارات الفورية |
| `usePushNotifications` | إشعارات Push |
| `useNotificationSystem` | نظام الإشعارات |
| `useDisclosureNotifications` | إشعارات الإفصاحات |
| `useSmartAlerts` | التنبيهات الذكية |
| `useSecurityAlerts` | تنبيهات الأمان |

### 📈 dashboard/
| Hook | الوظيفة |
|------|---------|
| `useDashboardKPIs` | مؤشرات الأداء |
| `useDashboardConfigs` | إعدادات اللوحة |
| `useAdminKPIs` | مؤشرات المدير |
| `useNazerKPIs` | مؤشرات الناظر |
| `useAccountantKPIs` | مؤشرات المحاسب |
| `useCashierStats` | إحصائيات أمين الصندوق |
| `useArchivistDashboard` | لوحة الأرشيفي |
| `useKPIs` | المؤشرات العامة |
| `useAIInsights` | رؤى الذكاء الاصطناعي |

### 🔍 search/
| Hook | الوظيفة |
|------|---------|
| `useGlobalSearch` | البحث العام |
| `useAdvancedSearch` | البحث المتقدم |
| `useIntelligentSearch` | البحث الذكي |
| `useSavedSearches` | البحوث المحفوظة |
| `useSavedFilters` | الفلاتر المحفوظة |

### 🎫 support/
| Hook | الوظيفة |
|------|---------|
| `useSupportTickets` | تذاكر الدعم |
| `useSupportStats` | إحصائيات الدعم |
| `useTicketComments` | تعليقات التذاكر |
| `useTicketRating` | تقييم التذاكر |
| `useMessages` | الرسائل |
| `useInternalMessages` | الرسائل الداخلية |
| `useChatbot` | روبوت المحادثة |
| `useKnowledgeBase` | قاعدة المعرفة |
| `useContactForm` | نموذج التواصل |
| `useAgentAvailability` | توفر الموظفين |

### 📁 archive/
| Hook | الوظيفة |
|------|---------|
| `useDocuments` | المستندات |
| `useDocumentUpload` | رفع المستندات |
| `useDocumentVersions` | إصدارات المستندات |
| `useDocumentTags` | وسوم المستندات |
| `useFolders` | المجلدات |
| `useArchiveStats` | إحصائيات الأرشيف |

### 💳 loans/
| Hook | الوظيفة |
|------|---------|
| `useLoans` | القروض |
| `useLoanInstallments` | أقساط القروض |
| `useLoanPayments` | دفعات القروض |

### ✅ approvals/
| Hook | الوظيفة |
|------|---------|
| `useApprovals` | الموافقات |
| `useApprovalHistory` | سجل الموافقات |
| `useApprovalWorkflows` | مسارات الموافقة |
| `useApprovalPermissions` | صلاحيات الموافقة |
| `usePendingApprovals` | الموافقات المعلقة |
| `useRequestApprovals` | موافقات الطلبات |

### ⚙️ system/
| Hook | الوظيفة |
|------|---------|
| `useSystemSettings` | إعدادات النظام |
| `useSystemHealth` | صحة النظام |
| `useSystemPerformanceMetrics` | مقاييس الأداء |
| `useAuditLogs` | سجل المراجعة |
| `useActivities` | الأنشطة |
| `useBackup` | النسخ الاحتياطي |
| `useUsersManagement` | إدارة المستخدمين |
| `useUsersActivityMetrics` | مقاييس نشاط المستخدمين |
| `useOrganizationSettings` | إعدادات المؤسسة |
| `useVisibilitySettings` | إعدادات الظهور |
| `useProfile` | الملف الشخصي |
| `useAlertCleanup` | تنظيف التنبيهات |
| `useSelfHealing` | الإصلاح التلقائي |

### 🏛️ governance/
| Hook | الوظيفة |
|------|---------|
| `useGovernanceDecisions` | قرارات الحوكمة |
| `useGovernanceVoting` | التصويت |
| `useFunds` | الصناديق |
| `useWaqfUnits` | أقلام الوقف |
| `useAnnualDisclosures` | الإفصاحات السنوية |

### 📊 reports/
| Hook | الوظيفة |
|------|---------|
| `useReports` | التقارير |
| `useCustomReports` | التقارير المخصصة |
| `useScheduledReports` | التقارير المجدولة |
| `useProjectDocumentation` | توثيق المشروع |

### 📝 requests/
| Hook | الوظيفة |
|------|---------|
| `useRequests` | الطلبات |
| `useRequestAttachments` | مرفقات الطلبات |
| `useRequestComments` | تعليقات الطلبات |
| `useTasks` | المهام |

### 🎨 ui/
| Hook | الوظيفة |
|------|---------|
| `useToast` | الإشعارات المنبثقة |
| `useMobile` | الأجهزة المحمولة |
| `useMediaQuery` | استعلامات الوسائط |
| `useKeyboardShortcuts` | اختصارات لوحة المفاتيح |
| `usePrint` | الطباعة |
| `useExport` | التصدير |
| `useExportToExcel` | تصدير Excel |
| `useLocalStorage` | التخزين المحلي |
| `useDebouncedCallback` | Debounce |
| `useTableSort` | ترتيب الجداول |
| `useBulkSelection` | التحديد المتعدد |
| `useCrudDialog` | محاورات CRUD |
| `useImageOptimization` | تحسين الصور |
| `useTranslation` | الترجمة |

---

**آخر تحديث:** 2025-11-29
