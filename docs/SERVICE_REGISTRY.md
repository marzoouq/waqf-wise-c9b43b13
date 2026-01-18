# سجل الخدمات (Service Registry)

> آخر تحديث: 2026-01-18

## ملخص

| الفئة | العدد | withRetry | matchesStatus |
|-------|-------|:---------:|:-------------:|
| **Dashboard** | 10 | ✅ | ✅ |
| **Beneficiary** | 8 | ✅ | ✅ |
| **Accounting** | 12 | ✅ | ✅ |
| **Property** | 10 | ✅ | ✅ |
| **Governance** | 5 | ✅ | ✅ |
| **System** | 15 | ✅ | ⚪ |
| **AI** | 5 | ✅ | ⚪ |
| **الإجمالي** | **~65** | ✅ | ✅ |

---

## 1. خدمات Dashboard

المسار: `src/services/dashboard/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `kpi.service.ts` | المؤشرات الموحدة | ✅ | ✅ |
| `stats.service.ts` | الإحصائيات العامة | ✅ | ✅ |
| `charts.service.ts` | بيانات الرسوم | ✅ | ⚪ |
| `activity.service.ts` | سجل النشاطات | ✅ | ⚪ |

### KPIService (الأهم)
```typescript
class KPIService {
  static async getUnifiedKPIs(): Promise<UnifiedKPIs>
  static async getActiveBeneficiaries(): Promise<number>
  static async getActiveContracts(): Promise<number>
  static async getOpenMaintenanceRequests(): Promise<number>
}
```

---

## 2. خدمات Beneficiary

المسار: `src/services/beneficiary/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `beneficiary-core.service.ts` | العمليات الأساسية | ✅ | ✅ |
| `beneficiary-stats.service.ts` | الإحصائيات | ✅ | ✅ |
| `beneficiary-verification.service.ts` | التحقق | ✅ | ⚪ |
| `eligibility.service.ts` | الأهلية | ✅ | ✅ |

### BeneficiaryCoreService
```typescript
class BeneficiaryCoreService {
  static async getById(id: string): Promise<Beneficiary>
  static async create(data: CreateBeneficiaryData): Promise<Beneficiary>
  static async update(id: string, data: UpdateBeneficiaryData): Promise<Beneficiary>
  static async getStats(): Promise<BeneficiaryStats>
}
```

---

## 3. خدمات Accounting

المسار: `src/services/accounting/` و `src/services/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `accounting.service.ts` | القيود المحاسبية | ✅ | ✅ |
| `voucher.service.ts` | السندات | ✅ | ✅ |
| `invoice.service.ts` | الفواتير | ✅ | ✅ |
| `payment.service.ts` | المدفوعات | ✅ | ✅ |
| `unified-financial.service.ts` | المالية الموحدة | ✅ | ✅ |
| `fiscal-year.service.ts` | السنوات المالية | ✅ | ⚪ |
| `bank-reconciliation.service.ts` | التسوية البنكية | ✅ | ⚪ |

### VoucherService
```typescript
class VoucherService {
  static async create(data: VoucherData): Promise<Voucher>
  static async markAsPaid(voucherId: string): Promise<Voucher>
  static async delete(voucherId: string): Promise<void>
  static async generateVouchersFromDistribution(distributionId: string): Promise<GenerateResult>
}
```

---

## 4. خدمات Property

المسار: `src/services/property/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `property-stats.service.ts` | إحصائيات العقارات | ✅ | ✅ |
| `property-core.service.ts` | العمليات الأساسية | ✅ | ✅ |
| `tenant.service.ts` | المستأجرين | ✅ | ✅ |
| `contract.service.ts` | العقود | ✅ | ✅ |
| `maintenance.service.ts` | الصيانة | ✅ | ✅ |

### PropertyStatsService
```typescript
class PropertyStatsService {
  static async getCollectionStats(): Promise<CollectionStats>
  static async getBasicStats(): Promise<PropertyStats>
  static async getOccupancyRate(): Promise<number>
}
```

### TenantService
```typescript
class TenantService {
  static async getStats(): Promise<TenantStats>
  static async getTenantsAging(): Promise<AgingReport>
  static async getActiveTenants(): Promise<Tenant[]>
}
```

---

## 5. خدمات Governance

المسار: `src/services/governance/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `governance.service.ts` | القرارات | ✅ | ✅ |
| `approval.service.ts` | الموافقات | ✅ | ✅ |
| `disclosure.service.ts` | الإفصاحات | ✅ | ✅ |

---

## 6. خدمات System

المسار: `src/services/monitoring/` و `src/services/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `monitoring.service.ts` | المراقبة | ✅ | ⚪ |
| `system.service.ts` | النظام | ✅ | ⚪ |
| `edge-function.service.ts` | Edge Functions | ✅ | ⚪ |
| `edge-functions-health.service.ts` | صحة الوظائف | ✅ | ⚪ |
| `audit.service.ts` | التدقيق | ✅ | ⚪ |
| `security.service.ts` | الأمان | ✅ | ⚪ |
| `notification.service.ts` | الإشعارات | ✅ | ⚪ |
| `storage.service.ts` | التخزين | ✅ | ⚪ |
| `realtime.service.ts` | الوقت الفعلي | ⚪ | ⚪ |

---

## 7. خدمات AI

المسار: `src/services/`

| الخدمة | الوظيفة | withRetry | ملاحظات |
|--------|---------|:---------:|---------|
| `ai.service.ts` | الذكاء الاصطناعي | ✅ | Edge Function |
| `chatbot.service.ts` | المساعد الذكي | ✅ | Edge Function |
| `ai-system-audit.service.ts` | تدقيق النظام | ✅ | Edge Function |
| `knowledge.service.ts` | قاعدة المعرفة | ✅ | Local |

---

## 8. خدمات Distribution

المسار: `src/services/distribution/`

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `distribution.service.ts` | التوزيعات | ✅ | ✅ |
| `distribution-voucher.service.ts` | سندات التوزيع | ✅ | ✅ |
| `simulation.service.ts` | المحاكاة | ✅ | ⚪ |

---

## 9. خدمات أخرى

| الخدمة | الوظيفة | withRetry | matchesStatus |
|--------|---------|:---------:|:-------------:|
| `loans.service.ts` | القروض | ✅ | ✅ |
| `family.service.ts` | العائلات | ✅ | ✅ |
| `archive.service.ts` | الأرشيف | ✅ | ⚪ |
| `document.service.ts` | المستندات | ✅ | ⚪ |
| `report.service.ts` | التقارير | ✅ | ⚪ |
| `search.service.ts` | البحث | ✅ | ⚪ |
| `settings.service.ts` | الإعدادات | ✅ | ⚪ |
| `user.service.ts` | المستخدمين | ✅ | ⚪ |
| `auth.service.ts` | المصادقة | ⚪ | ⚪ |

---

## 10. معايير الجودة

### withRetry
استخدام `withRetry` للاستعلامات الحرجة:

```typescript
import { withRetry } from '@/lib/retry-helper';

const result = await withRetry(
  () => supabase.from('table').select('*'),
  { maxAttempts: 3, delayMs: 1000 }
);
```

### matchesStatus
استخدام `matchesStatus` للمقارنات ثنائية اللغة:

```typescript
import { matchesStatus } from '@/lib/constants';

// ✅ صحيح
const isActive = matchesStatus(tenant.status, 'active');

// ❌ خاطئ
const isActive = tenant.status === 'نشط';
```

---

## 11. ملخص الحالة

| المعيار | النتيجة |
|---------|---------|
| **عدد الخدمات** | ~65 |
| **مع withRetry** | 95% |
| **مع matchesStatus** | 80% |
| **موثقة** | ✅ |
| **مختبرة** | ⚪ جزئياً |

---

## 12. التحديثات

| التاريخ | التغيير |
|---------|---------|
| 2026-01-18 | إنشاء السجل |
| 2026-01-17 | إضافة withRetry لجميع الخدمات الحرجة |
| 2026-01-17 | إضافة matchesStatus للخدمات المالية والعقارية |
