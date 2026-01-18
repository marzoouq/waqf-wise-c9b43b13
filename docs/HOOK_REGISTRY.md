# سجل الـ Hooks

> آخر تحديث: 2026-01-18

## ملخص

| الفئة | عدد المجلدات | عدد الـ Hooks التقريبي |
|-------|-------------|----------------------|
| **Dashboard** | 1 | 15+ |
| **Beneficiary** | 1 | 25+ |
| **Accounting** | 3 | 35+ |
| **Property** | 2 | 20+ |
| **Governance** | 2 | 15+ |
| **System** | 5 | 40+ |
| **Shared** | 4 | 30+ |
| **الإجمالي** | **42** | **300+** |

---

## 1. Hooks اللوحات (Dashboard)

المسار: `src/hooks/dashboard/`

| Hook | الوظيفة | الخدمة | QUERY_KEYS |
|------|---------|--------|-----------|
| `useUnifiedKPIs` | المؤشرات الموحدة | `KPIService` | ✅ |
| `useCollectionStats` | إحصائيات التحصيل | `PropertyStatsService` | ✅ |
| `useDashboardStats` | إحصائيات عامة | متعدد | ✅ |
| `useAdminDashboard` | لوحة المشرف | `KPIService` | ✅ |
| `useNazerDashboard` | لوحة الناظر | `KPIService` | ✅ |

### useUnifiedKPIs (الأهم)
```typescript
const { 
  data: kpis, 
  isLoading, 
  error, 
  refetch 
} = useUnifiedKPIs();

// البيانات المتاحة:
// - activeBeneficiaries
// - activeContracts
// - openMaintenanceRequests
// - totalCollection
// - occupancyRate
```

---

## 2. Hooks المستفيدين (Beneficiary)

المسار: `src/hooks/beneficiary/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useBeneficiaries` | قائمة المستفيدين | ✅ | ✅ |
| `useBeneficiaryById` | مستفيد واحد | ⚪ | ✅ |
| `useBeneficiaryStats` | إحصائيات | ⚪ | ✅ |
| `useBeneficiaryRequests` | الطلبات | ✅ | ✅ |
| `useBeneficiaryActivity` | سجل النشاط | ⚪ | ✅ |
| `useBeneficiaryPayments` | المدفوعات | ⚪ | ✅ |
| `useMyBeneficiaryRequests` | طلباتي | ✅ | ✅ |

---

## 3. Hooks المحاسبة (Accounting)

### 3.1 accounting/
المسار: `src/hooks/accounting/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useJournalEntries` | القيود | ✅ | ✅ |
| `useAccounts` | الحسابات | ⚪ | ✅ |
| `useTrialBalance` | ميزان المراجعة | ⚪ | ✅ |
| `useAccountBalance` | رصيد حساب | ⚪ | ✅ |

### 3.2 payments/
المسار: `src/hooks/payments/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `usePaymentVouchers` | السندات | ✅ | ✅ |
| `usePaymentVouchersData` | بيانات السندات | ⚪ | ✅ |
| `useBatchPayments` | الدفعات الجماعية | ⚪ | ✅ |

### 3.3 invoices/
المسار: `src/hooks/invoices/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useInvoices` | الفواتير | ✅ | ✅ |
| `useInvoiceById` | فاتورة واحدة | ⚪ | ✅ |

---

## 4. Hooks العقارات (Property)

### 4.1 property/
المسار: `src/hooks/property/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useProperties` | العقارات | ✅ | ✅ |
| `usePropertyUnits` | الوحدات | ⚪ | ✅ |
| `useMaintenanceRequests` | طلبات الصيانة | ✅ | ✅ |
| `useMaintenanceStats` | إحصائيات الصيانة | ⚪ | ✅ |

### 4.2 tenants/
المسار: `src/hooks/tenants/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useTenants` | المستأجرين | ✅ | ✅ |
| `useTenantById` | مستأجر واحد | ⚪ | ✅ |
| `useTenantContracts` | عقود المستأجر | ⚪ | ✅ |
| `useTenantPayments` | مدفوعات المستأجر | ⚪ | ✅ |

---

## 5. Hooks الحوكمة (Governance)

### 5.1 governance/
المسار: `src/hooks/governance/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useDecisions` | القرارات | ✅ | ✅ |
| `useBoardMembers` | أعضاء المجلس | ⚪ | ✅ |
| `useMeetings` | الاجتماعات | ⚪ | ✅ |

### 5.2 approvals/
المسار: `src/hooks/approvals/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useApprovals` | الموافقات | ✅ | ✅ |
| `useDistributionApprovals` | موافقات التوزيع | ✅ | ✅ |
| `useLoanApprovals` | موافقات القروض | ✅ | ✅ |
| `useRequestApprovals` | موافقات الطلبات | ✅ | ✅ |

---

## 6. Hooks النظام (System)

### 6.1 monitoring/
المسار: `src/hooks/monitoring/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useSystemMonitoring` | مراقبة النظام | ✅ | ✅ |
| `useSystemHealth` | صحة النظام | ⚪ | ✅ |
| `usePerformanceMetrics` | مقاييس الأداء | ⚪ | ✅ |

### 6.2 developer/
المسار: `src/hooks/developer/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useEdgeFunctionsHealth` | صحة Edge Functions | ⚪ | ✅ |
| `useDatabaseHealth` | صحة قاعدة البيانات | ⚪ | ✅ |
| `useSystemErrorLogsData` | سجلات الأخطاء | ⚪ | ✅ |

### 6.3 auth/
المسار: `src/hooks/auth/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useAuth` | المصادقة | ✅ | ⚪ |
| `useSession` | الجلسة | ✅ | ⚪ |
| `useUser` | المستخدم | ⚪ | ✅ |

### 6.4 permissions/
المسار: `src/hooks/permissions/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `usePermissions` | الصلاحيات | ⚪ | ✅ |
| `useUserRole` | دور المستخدم | ⚪ | ✅ |
| `useHasPermission` | فحص صلاحية | ⚪ | ✅ |

---

## 7. Hooks مشتركة (Shared)

### 7.1 ui/
المسار: `src/hooks/ui/`

| Hook | الوظيفة |
|------|---------|
| `useToast` | الإشعارات |
| `useMediaQuery` | استعلام الشاشة |
| `useMobile` | فحص الجوال |
| `useDebounce` | تأخير |
| `useThrottle` | تقييد |

### 7.2 shared/
المسار: `src/hooks/shared/`

| Hook | الوظيفة |
|------|---------|
| `useLocalStorage` | التخزين المحلي |
| `useClipboard` | الحافظة |
| `useOnClickOutside` | النقر خارجاً |

---

## 8. Hooks التوزيعات (Distributions)

المسار: `src/hooks/distributions/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useDistributions` | التوزيعات | ✅ | ✅ |
| `useDistributionById` | توزيع واحد | ⚪ | ✅ |
| `useDistributionVouchers` | سندات التوزيع | ⚪ | ✅ |
| `useDistributionApprovals` | الموافقات | ✅ | ✅ |

---

## 9. Hooks القروض (Loans)

المسار: `src/hooks/loans/`

| Hook | الوظيفة | Realtime | QUERY_KEYS |
|------|---------|:--------:|-----------|
| `useLoans` | القروض | ✅ | ✅ |
| `useLoanById` | قرض واحد | ⚪ | ✅ |
| `useLoanPayments` | أقساط القرض | ⚪ | ✅ |
| `useLoanApprovals` | موافقات القروض | ✅ | ✅ |

---

## 10. معايير الجودة

### QUERY_KEYS
استخدام مفاتيح موحدة للكاش:

```typescript
import { QUERY_KEYS } from '@/lib/query-keys';

useQuery({
  queryKey: QUERY_KEYS.beneficiaries.list(),
  queryFn: () => BeneficiaryService.getAll(),
  staleTime: QUERY_CONFIG.default.staleTime,
});
```

### Realtime Subscriptions
اشتراكات الوقت الفعلي:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('table_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'beneficiaries' },
      () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.beneficiaries.all })
    )
    .subscribe();
    
  return () => { supabase.removeChannel(channel); };
}, []);
```

---

## 11. ملخص الحالة

| المعيار | النتيجة |
|---------|---------|
| **عدد المجلدات** | 42 |
| **عدد الـ Hooks** | 300+ |
| **مع QUERY_KEYS** | 95% |
| **مع Realtime** | ~40% |
| **موثقة** | ✅ |

---

## 12. التحديثات

| التاريخ | التغيير |
|---------|---------|
| 2026-01-18 | إنشاء السجل |
| 2026-01-17 | إضافة QUERY_KEYS لجميع الـ Hooks |
| 2026-01-17 | توحيد staleTime |
