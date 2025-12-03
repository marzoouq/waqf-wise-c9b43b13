# 🔌 مرجع API - منصة إدارة الوقف الإلكترونية

**الإصدار:** 2.6.6 | **آخر تحديث:** 2025-12-03

---

## 📋 نظرة عامة

يوفر هذا المرجع توثيقاً شاملاً لجميع واجهات برمجة التطبيقات (APIs) المتاحة في المنصة، بما في ذلك الـ Hooks وEdge Functions والمكونات الرئيسية.

---

## 1. Edge Functions (39 دالة)

### 1.1 المصادقة والأمان

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `admin-manage-beneficiary-password` | إدارة كلمات مرور المستفيدين | `beneficiaryId`, `newPassword` |
| `biometric-auth` | المصادقة البيومترية | `userId`, `biometricData` |
| `check-leaked-password` | فحص كلمات المرور المسربة | `password` |
| `reset-user-password` | إعادة تعيين كلمة المرور | `email` |

### 1.2 الذكاء الاصطناعي

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `chatbot` | المساعد الذكي | `message`, `context` |
| `auto-classify-document` | تصنيف المستندات تلقائياً | `documentId`, `content` |
| `extract-invoice-data` | استخراج بيانات الفواتير | `imageUrl` أو `pdfUrl` |
| `generate-ai-insights` | توليد رؤى ذكية | `dataType`, `period` |
| `intelligent-search` | البحث الذكي | `query`, `filters` |
| `ocr-document` | استخراج النص من الصور | `imageUrl` |
| `property-ai-assistant` | مساعد العقارات الذكي | `query`, `propertyId` |

### 1.3 المحاسبة والمالية

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `auto-close-fiscal-year` | إغلاق السنة المالية تلقائياً | `fiscalYearId` |
| `auto-create-journal` | إنشاء قيود محاسبية تلقائية | `triggerEvent`, `data` |
| `simulate-distribution` | محاكاة التوزيع | `fundId`, `amount` |
| `generate-distribution-summary` | ملخص التوزيعات | `distributionId` |
| `zatca-submit` | إرسال للهيئة الضريبية | `invoiceId` |

### 1.4 الإشعارات

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `send-notification` | إرسال إشعار | `userId`, `type`, `message` |
| `send-push-notification` | إشعار Push | `userId`, `title`, `body` |
| `send-invoice-email` | إرسال فاتورة بالبريد | `invoiceId`, `email` |
| `daily-notifications` | الإشعارات اليومية | - |
| `contract-renewal-alerts` | تنبيهات تجديد العقود | - |
| `notify-admins` | إخطار المشرفين | `type`, `data` |
| `notify-disclosure-published` | إخطار نشر الإفصاح | `disclosureId` |

### 1.5 النسخ الاحتياطي والأمان

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `backup-database` | نسخ احتياطي لقاعدة البيانات | `tables[]` |
| `restore-database` | استعادة النسخ الاحتياطي | `backupId` |
| `encrypt-file` | تشفير ملف | `fileId` |
| `decrypt-file` | فك تشفير ملف | `fileId`, `key` |
| `cleanup-old-files` | تنظيف الملفات القديمة | `olderThanDays` |
| `cleanup-sensitive-files` | تنظيف الملفات الحساسة | - |
| `scheduled-cleanup` | التنظيف المجدول | - |
| `secure-delete-file` | حذف آمن للملفات | `fileId` |

### 1.6 التقارير

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `generate-scheduled-report` | إنشاء تقرير مجدول | `reportId` |
| `generate-smart-alerts` | إنشاء تنبيهات ذكية | - |

### 1.7 الإدارة

| الدالة | الوصف | المدخلات |
|--------|-------|----------|
| `create-beneficiary-accounts` | إنشاء حسابات المستفيدين | `beneficiaryIds[]` |
| `backfill-rental-documents` | ملء مستندات الإيجار | `contractId` |
| `support-auto-escalate` | تصعيد الدعم التلقائي | `ticketId` |
| `execute-auto-fix` | تنفيذ إصلاح تلقائي | `errorId` |
| `log-error` | تسجيل الأخطاء | `error`, `context` |

---

## 2. Hooks المتاحة (165+)

### 2.1 المصادقة والمستخدمين

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePermissions } from '@/hooks/usePermissions';

// استخدام
const { user, isAuthenticated, signIn, signOut } = useAuth();
const { roles, primaryRole, hasRole, isNazer } = useUserRole();
const { canView, canEdit, canDelete } = usePermissions('beneficiaries');
```

### 2.2 المستفيدين

```typescript
import { 
  useBeneficiaries,
  useBeneficiary,
  useCreateBeneficiary,
  useUpdateBeneficiary,
  useBeneficiaryStats
} from '@/hooks/beneficiary';

const { data: beneficiaries, isLoading } = useBeneficiaries(filters);
const { data: beneficiary } = useBeneficiary(id);
const { mutate: createBeneficiary } = useCreateBeneficiary();
```

### 2.3 العقارات والعقود

```typescript
import { 
  useProperties,
  useProperty,
  useContracts,
  useRentalPayments
} from '@/hooks/properties';

const { data: properties } = useProperties();
const { data: contracts } = useContracts({ propertyId });
const { createPayment } = useRentalPayments(contractId);
```

### 2.4 المحاسبة

```typescript
import {
  useAccounts,
  useJournalEntries,
  useFiscalYears,
  useBankAccounts
} from '@/hooks/accounting';

const { data: accounts } = useAccounts();
const { data: entries } = useJournalEntries(fiscalYearId);
const { closeFiscalYear } = useFiscalYears();
```

### 2.5 التوزيعات

```typescript
import {
  useDistributions,
  useDistributionDetails,
  useSimulateDistribution
} from '@/hooks/distributions';

const { data: distributions } = useDistributions();
const { simulate } = useSimulateDistribution();
```

### 2.6 المستندات

```typescript
import {
  useDocuments,
  useFolders,
  useDocumentUpload,
  useDocumentOCR
} from '@/hooks/documents';

const { data: documents } = useDocuments(folderId);
const { upload } = useDocumentUpload();
const { extractText } = useDocumentOCR();
```

### 2.7 التقارير

```typescript
import {
  useReports,
  useCustomReports,
  useReportGeneration
} from '@/hooks/reports';

const { data: reports } = useReports();
const { generate } = useReportGeneration();
```

### 2.8 الأداء والتحسين

```typescript
import { useQueryPrefetch, useAutoPrefetch } from '@/hooks/useQueryPrefetch';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const { prefetchQuery } = useQueryPrefetch();
const debouncedValue = useDebounce(value, 300);
```

---

## 3. مكونات الواجهة

### 3.1 مكونات التحميل

```tsx
import { 
  LoadingState,
  TableLoadingSkeleton,
  DashboardLoadingSkeleton
} from '@/components/shared/LoadingState';

<LoadingState message="جاري التحميل..." size="lg" />
<TableLoadingSkeleton rows={5} />
```

### 3.2 مكونات الأخطاء

```tsx
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';

<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
```

### 3.3 مكونات KPI

```tsx
import { UnifiedKPICard, UnifiedStatsGrid } from '@/components/unified';

<UnifiedStatsGrid columns={4}>
  <UnifiedKPICard
    title="إجمالي المستفيدين"
    value={14}
    icon={Users}
    trend={{ value: 5, isPositive: true }}
  />
</UnifiedStatsGrid>
```

---

## 4. إعدادات React Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,    // دقيقتان
      gcTime: 10 * 60 * 1000,      // 10 دقائق
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        if (error.status === 404 || error.status === 403) return false;
        return failureCount < 3;
      },
    },
  },
});
```

---

## 5. استدعاء Edge Functions

```typescript
import { supabase } from '@/integrations/supabase/client';

// استدعاء بسيط
const { data, error } = await supabase.functions.invoke('chatbot', {
  body: { message: 'مرحبا' }
});

// استدعاء مع معالجة الأخطاء
try {
  const { data, error } = await supabase.functions.invoke('simulate-distribution', {
    body: { fundId, amount }
  });
  
  if (error) throw error;
  return data;
} catch (err) {
  console.error('Error:', err);
}
```

---

## 6. أنماط الاستخدام

### 6.1 إنشاء Hook مخصص

```typescript
export function useCustomData(id: string) {
  return useQuery({
    queryKey: ['custom-data', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_table')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
```

### 6.2 Mutation مع Optimistic Update

```typescript
export function useUpdateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateData) => {
      const { error } = await supabase
        .from('items')
        .update(data)
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData(['items']);
      queryClient.setQueryData(['items'], (old) => 
        old.map(item => item.id === newData.id ? { ...item, ...newData } : item)
      );
      return { previous };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['items'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

---

## 7. مقاييس الأداء

| المقياس | الهدف | الحد الأقصى |
|---------|-------|-------------|
| LCP | < 2.5s | 4.0s |
| FCP | < 1.8s | 3.0s |
| CLS | < 0.1 | 0.25 |
| TTI | < 3.8s | 7.3s |
| TBT | < 200ms | 600ms |

---

## 8. روابط مفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Lovable Documentation](https://docs.lovable.dev/)

---

**الحالة:** ✅ محدّث ومُوثق
