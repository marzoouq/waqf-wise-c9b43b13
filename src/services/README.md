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

### Core Services - الخدمات الأساسية

| Service | الوصف |
|---------|-------|
| `NotificationService` | إدارة الإشعارات |
| `RequestService` | إدارة الطلبات |
| `VoucherService` | إدارة السندات |
| `ReportService` | إدارة التقارير |

### Domain Services - خدمات المجال

| Service | الوصف |
|---------|-------|
| `AccountingService` | المحاسبة والقيود |
| `ApprovalService` | الموافقات |
| `ArchiveService` | الأرشفة |
| `AuthService` | المصادقة |
| `BeneficiaryService` | المستفيدين |
| `ContractService` | العقود |
| `DashboardService` | لوحات التحكم |
| `DistributionService` | التوزيعات |
| `FiscalYearService` | السنوات المالية |
| `FundService` | الصناديق |
| `InvoiceService` | الفواتير |
| `LoansService` | القروض |
| `MaintenanceService` | الصيانة |
| `PropertyService` | العقارات |
| `TenantService` | المستأجرين |

### Infrastructure Services - خدمات البنية التحتية

| Service | الوصف |
|---------|-------|
| `StorageService` | رفع وتحميل الملفات |
| `EdgeFunctionService` | استدعاء Edge Functions |
| `RealtimeService` | الاشتراكات الفورية |

---

## 🔧 طريقة الاستخدام

### استيراد الخدمات

```typescript
import { BeneficiaryService, AccountingService } from '@/services';
```

### في Hook

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => BeneficiaryService.getAll()
});
```

---

**آخر تحديث:** 2025-12-08
**الإصدار:** 2.7.0
