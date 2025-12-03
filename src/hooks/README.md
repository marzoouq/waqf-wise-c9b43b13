# 📁 Hooks Directory / مجلد الـ Hooks

هذا المجلد يحتوي على **150+** React Hook للتطبيق.

## 🔄 طريقة الاستيراد (مُوصى بها)

```typescript
import { useAuth, useBeneficiaries, useNotifications } from '@/hooks';
```

أو من الملف مباشرة:
```typescript
import { useAuth } from '@/hooks/useAuth';
```

## 📋 فهرس الـ Hooks

### 🔐 Auth & Security
| Hook | الوظيفة |
|------|---------|
| `useAuth` | المصادقة الرئيسية |
| `useBiometricAuth` | المصادقة البيومترية |
| `useActiveSessions` | الجلسات النشطة |
| `useLeakedPassword` | فحص كلمات المرور |
| `useIdleTimeout` | انتهاء الجلسة |
| `usePermissions` | الصلاحيات |
| `useUserRole` | دور المستخدم |

### 👥 Beneficiary
| Hook | الوظيفة |
|------|---------|
| `useBeneficiaries` | إدارة المستفيدين |
| `useBeneficiaryProfile` | ملف المستفيد |
| `useBeneficiaryRequests` | طلبات المستفيد |
| `useBeneficiaryAttachments` | مرفقات المستفيد |
| `useBeneficiaryActivityLog` | سجل النشاط |
| `useBeneficiaryCategories` | تصنيفات المستفيدين |
| `useFamilies` | العائلات |
| `useTribes` | القبائل |

### 💰 Accounting
| Hook | الوظيفة |
|------|---------|
| `useJournalEntries` | القيود اليومية |
| `useAccounts` | الحسابات |
| `useAccountingStats` | إحصائيات المحاسبة |
| `useBudgets` | الميزانيات |
| `useCashFlows` | التدفقات النقدية |
| `useFiscalYears` | السنوات المالية |
| `useFinancialData` | البيانات المالية |
| `useFinancialReports` | التقارير المالية |

### 📊 Distribution
| Hook | الوظيفة |
|------|---------|
| `useDistributions` | التوزيعات |
| `useDistributionEngine` | محرك التوزيع |
| `useDistributionDetails` | تفاصيل التوزيع |
| `useBatchPayments` | الدفعات الجماعية |
| `useEmergencyAid` | الفزعات الطارئة |

### 🏠 Property
| Hook | الوظيفة |
|------|---------|
| `useProperties` | العقارات |
| `usePropertyUnits` | الوحدات العقارية |
| `useContracts` | العقود |
| `useRentalPayments` | مدفوعات الإيجار |
| `useMaintenanceRequests` | طلبات الصيانة |

### 🏦 Banking
| Hook | الوظيفة |
|------|---------|
| `useBankAccounts` | الحسابات البنكية |
| `useBankReconciliation` | التسوية البنكية |
| `usePayments` | المدفوعات |
| `usePaymentVouchers` | سندات الصرف |
| `useInvoices` | الفواتير |

### 🔔 Notifications
| Hook | الوظيفة |
|------|---------|
| `useNotifications` | الإشعارات |
| `useRealtimeNotifications` | الإشعارات الفورية |
| `usePushNotifications` | إشعارات Push |
| `useSmartAlerts` | التنبيهات الذكية |

### 📈 Dashboard
| Hook | الوظيفة |
|------|---------|
| `useDashboardKPIs` | مؤشرات الأداء |
| `useNazerKPIs` | مؤشرات الناظر |
| `useAccountantKPIs` | مؤشرات المحاسب |
| `useCashierStats` | إحصائيات الصراف |
| `useAIInsights` | رؤى الذكاء الاصطناعي |

### 🔍 Search
| Hook | الوظيفة |
|------|---------|
| `useGlobalSearch` | البحث الشامل |
| `useAdvancedSearch` | البحث المتقدم |
| `useSavedSearches` | البحث المحفوظ |
| `useSavedFilters` | الفلاتر المحفوظة |

### 🎨 UI & Utility
| Hook | الوظيفة |
|------|---------|
| `useToast` | الإشعارات المنبثقة |
| `useMobile` | الأجهزة المحمولة |
| `useMediaQuery` | استعلامات الوسائط |
| `useKeyboardShortcuts` | اختصارات لوحة المفاتيح |
| `usePrint` | الطباعة |
| `useExport` | التصدير |
| `useLocalStorage` | التخزين المحلي |
| `useDebouncedCallback` | Debounce |
| `useTableSort` | ترتيب الجداول |
| `useBulkSelection` | التحديد المتعدد |

---

**آخر تحديث:** 2025-12-03
