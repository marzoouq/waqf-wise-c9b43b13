# Services Layer - طبقة الخدمات

## نظرة عامة

طبقة الخدمات هي الطبقة الوسطى بين المكونات (Components/Hooks) وقاعدة البيانات (Supabase).

**الهدف**: فصل منطق الأعمال عن واجهة المستخدم لتحسين:
- قابلية الصيانة
- إعادة الاستخدام
- الاختبار
- الأمان

---

## 📂 قائمة الخدمات (42 Service)

### Core Services - الخدمات الأساسية (5)

| Service | الوصف | الحالة |
|---------|-------|--------|
| `NotificationService` | إدارة الإشعارات | ✅ مكتمل |
| `RequestService` | إدارة الطلبات | ✅ مكتمل |
| `VoucherService` | إدارة السندات | ✅ مكتمل |
| `ReportService` | إدارة التقارير | ✅ مكتمل |
| `ReportsService` | التقارير المتقدمة | ✅ مكتمل |

### Domain Services - خدمات المجال (34)

| Service | الوصف | الحالة |
|---------|-------|--------|
| `AccountingService` | المحاسبة والقيود | ✅ مكتمل |
| `ApprovalService` | الموافقات | ✅ مكتمل |
| `ArchiveService` | الأرشفة | ✅ مكتمل |
| `AuditService` | سجل العمليات | ✅ مكتمل |
| `AuthService` | المصادقة | ✅ مكتمل |
| `BankReconciliationService` | التسوية البنكية | ✅ مكتمل |
| `BeneficiaryService` | المستفيدين | ✅ مكتمل |
| `ChatbotService` | الدردشة الآلية | ✅ مكتمل |
| `ContractService` | العقود | ✅ مكتمل |
| `DashboardService` | لوحات التحكم و KPIs | ✅ مكتمل |
| `DistributionService` | التوزيعات | ✅ مكتمل |
| `DocumentationService` | التوثيق | ✅ مكتمل |
| `FiscalYearService` | السنوات المالية | ✅ مكتمل |
| `FundService` | الصناديق | ✅ مكتمل |
| `GovernanceService` | الحوكمة | ✅ مكتمل |
| `IntegrationService` | التكاملات | ✅ مكتمل |
| `InvoiceService` | الفواتير | ✅ مكتمل |
| `KnowledgeService` | قاعدة المعرفة | ✅ مكتمل |
| `LoansService` | القروض والأقساط | ✅ مكتمل |
| `MaintenanceService` | الصيانة | ✅ مكتمل |
| `MessageService` | الرسائل الداخلية | ✅ مكتمل |
| `MonitoringService` | المراقبة | ✅ مكتمل |
| `NotificationSettingsService` | إعدادات الإشعارات | ✅ مكتمل |
| `PaymentService` | المدفوعات | ✅ مكتمل |
| `POSService` | نقاط البيع | ✅ مكتمل |
| `PropertyService` | العقارات والوحدات | ✅ مكتمل |
| `SecurityService` | الأمان والصلاحيات | ✅ مكتمل |
| `SettingsService` | الإعدادات | ✅ مكتمل |
| `SystemService` | النظام والمراقبة | ✅ مكتمل |
| `TenantService` | المستأجرين | ✅ مكتمل |
| `TribeService` | القبائل | ✅ مكتمل |
| `UIService` | واجهة المستخدم | ✅ مكتمل |
| `UserService` | المستخدمين | ✅ مكتمل |

### Infrastructure Services - خدمات البنية التحتية (3)

| Service | الوصف | الحالة |
|---------|-------|--------|
| `StorageService` | رفع وتحميل الملفات | ✅ مكتمل |
| `EdgeFunctionService` | استدعاء Edge Functions | ✅ مكتمل |
| `RealtimeService` | الاشتراكات الفورية | ✅ مكتمل |

---

## 📊 ملخص التغطية

| الفئة | العدد | التغطية |
|-------|-------|---------|
| Core Services | 5 | 100% |
| Domain Services | 34 | 100% |
| Infrastructure Services | 3 | 100% |
| **الإجمالي** | **42** | **100%** |

---

## 🏗️ الهيكل المعماري

```
Component (UI) → Hook (State) → Service (Data) → Supabase
```

### ملاحظات معمارية
- ✅ جميع الـ hooks تستخدم الخدمات
- ✅ 7 hooks تستخدم Realtime مباشرة (مقبول معماريًا)
- ✅ 100% فصل الاهتمامات

---

## 🔧 طريقة الاستخدام

### استيراد الخدمات

```typescript
import { BeneficiaryService, AccountingService, PaymentService } from '@/services';
```

### في Hook

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => BeneficiaryService.getAll()
});
```

### مع Mutations

```typescript
const addBeneficiary = useMutation({
  mutationFn: (data) => BeneficiaryService.create(data),
  onSuccess: () => queryClient.invalidateQueries(['beneficiaries'])
});
```

### مع Realtime

```typescript
useEffect(() => {
  const subscription = RealtimeService.subscribeToTable('beneficiaries', () => {
    queryClient.invalidateQueries(['beneficiaries']);
  });
  return () => subscription.unsubscribe();
}, [queryClient]);
```

---

**آخر تحديث:** 2025-12-09
**الإصدار:** 2.8.45
