# Services Layer - طبقة الخدمات

## نظرة عامة

طبقة الخدمات هي الطبقة الوسطى بين المكونات (Components/Hooks) وقاعدة البيانات (Supabase).

**الهدف**: فصل منطق الأعمال عن واجهة المستخدم لتحسين:
- قابلية الصيانة
- إعادة الاستخدام
- الاختبار
- الأمان

---

## 📂 قائمة الخدمات (23 Service)

### Core Services - الخدمات الأساسية (4)

| Service | الوصف | الحالة |
|---------|-------|--------|
| `NotificationService` | إدارة الإشعارات | ✅ مكتمل |
| `RequestService` | إدارة الطلبات | ✅ مكتمل |
| `VoucherService` | إدارة السندات | ✅ مكتمل |
| `ReportService` | إدارة التقارير | ✅ مكتمل |

### Domain Services - خدمات المجال (15)

| Service | الوصف | الحالة |
|---------|-------|--------|
| `AccountingService` | المحاسبة والقيود | ✅ مكتمل |
| `ApprovalService` | الموافقات | ✅ مكتمل |
| `ArchiveService` | الأرشفة | ✅ مكتمل |
| `AuthService` | المصادقة | ✅ مكتمل |
| `BeneficiaryService` | المستفيدين | ✅ مكتمل |
| `ContractService` | العقود | ✅ مكتمل |
| `DashboardService` | لوحات التحكم | ✅ مكتمل |
| `DistributionService` | التوزيعات | ✅ مكتمل |
| `FiscalYearService` | السنوات المالية | ✅ مكتمل |
| `FundService` | الصناديق | ✅ مكتمل |
| `InvoiceService` | الفواتير | ✅ مكتمل |
| `LoansService` | القروض | ✅ مكتمل |
| `MaintenanceService` | الصيانة | ✅ مكتمل |
| `PaymentService` | المدفوعات | ✅ مكتمل |
| `PropertyService` | العقارات | ✅ مكتمل |
| `TenantService` | المستأجرين | ✅ مكتمل |

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
| Core Services | 4 | 100% |
| Domain Services | 16 | 100% |
| Infrastructure Services | 3 | 100% |
| **الإجمالي** | **23** | **100%** |

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

---

**آخر تحديث:** 2025-12-08
**الإصدار:** 2.8.17
