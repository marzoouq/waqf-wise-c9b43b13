# آخر الإصلاحات والتحديثات
## Latest Fixes & Updates

**التاريخ:** 2025-12-05  
**الإصدار:** 2.6.16

---

## 🔧 تحسينات Type Safety (v2.6.16)

### المشكلة
1. **عدم تطابق RoleName**: `src/types/auth.ts` لا يتطابق مع أدوار قاعدة البيانات
2. **استخدام `as any`**: في `UserRolesManager.tsx` لتجاوز مشاكل الأنواع
3. **استخدام `useState<any>`**: في `Properties.tsx`
4. **استخدام `Record<string, any>`**: في `ExportButton.tsx`

### الحل المنفذ

#### 1. توحيد RoleName مع قاعدة البيانات
```typescript
// src/types/auth.ts
// قبل
export type RoleName = 'nazer' | 'admin' | 'accountant' | 'disbursement_officer' | 'archivist' | 'beneficiary' | 'waqf_heir';

// بعد - متطابق مع app_role enum
export type RoleName = 'nazer' | 'admin' | 'accountant' | 'cashier' | 'archivist' | 'user' | 'beneficiary' | 'waqf_heir';
```

#### 2. إزالة `as any` من UserRolesManager
```typescript
// استيراد نوع قاعدة البيانات
type DbAppRole = Database['public']['Enums']['app_role'];

// استخدام النوع الصحيح
.insert({ user_id: userId, role: role as DbAppRole });
.eq('role', role as DbAppRole);
```

#### 3. إصلاح useState<any> في Properties.tsx
```typescript
// قبل
const [selectedPropertyForAI, setSelectedPropertyForAI] = useState<any>(null);

// بعد
const [selectedPropertyForAI, setSelectedPropertyForAI] = useState<Property | null>(null);
```

#### 4. تحسين ExportButton.tsx
```typescript
// قبل
type ExportDataItem = Record<string, any>;

// بعد
type ExportDataItem = Record<string, unknown>;
```

### ملخص التغييرات

| الملف | التغيير | الخطورة |
|-------|---------|---------|
| `src/types/auth.ts` | توحيد RoleName مع DB | حرج |
| `UserRolesManager.tsx` | إزالة `as any` | حرج |
| `Properties.tsx` | `Property \| null` | متوسط |
| `ExportButton.tsx` | `Record<string, unknown>` | منخفض |

### النتائج
- ✅ تطابق كامل بين أنواع TypeScript وقاعدة البيانات
- ✅ إزالة جميع `as any` من إدارة الأدوار
- ✅ Type Safety محسّن في جميع الملفات المُصلحة
- ✅ لا تعليقات `eslint-disable` غير ضرورية

---

## 🔐 إصلاحات أمنية شاملة (v2.6.15)

### المشكلة
تم اكتشاف 5 ثغرات أمنية حرجة في Edge Functions:
1. `backup-database` - لا تتحقق من صلاحيات المستخدم
2. `restore-database` - لا تتحقق من صلاحيات المستخدم  
3. `auto-close-fiscal-year` - بدون مصادقة
4. `simulate-distribution` - بدون مصادقة
5. `generate-ai-insights` - بدون تحقق من الأدوار

### الحل المنفذ

#### 1. تأمين backup-database
```typescript
// ✅ الأدوار المسموحة: admin, nazer
const ALLOWED_ROLES = ['admin', 'nazer'];

// التحقق من المصادقة
const authHeader = req.headers.get('Authorization');
const { data: { user } } = await supabaseAuth.auth.getUser(token);

// التحقق من الأدوار
const { data: userRoles } = await supabase
  .from('user_roles').select('role').eq('user_id', user.id);

// تسجيل المحاولات غير المصرح بها
await supabase.from('audit_logs').insert({
  action_type: 'UNAUTHORIZED_BACKUP_ATTEMPT',
  severity: 'error'
});
```

#### 2. تأمين restore-database
```typescript
// ✅ الأدوار المسموحة: admin فقط
const ALLOWED_ROLES = ['admin'];
// + audit logging
```

#### 3. تأمين auto-close-fiscal-year
```typescript
// ✅ الأدوار المسموحة: nazer فقط
const ALLOWED_ROLES = ['nazer'];
// + audit logging
```

#### 4. تأمين simulate-distribution
```typescript
// ✅ الأدوار المسموحة: admin, nazer, accountant
const ALLOWED_ROLES = ['admin', 'nazer', 'accountant'];
// + audit logging
```

#### 5. تأمين generate-ai-insights
```typescript
// ✅ الأدوار المسموحة: admin, nazer, accountant
const ALLOWED_ROLES = ['admin', 'nazer', 'accountant'];
// + audit logging
```

### تشديد سياسات RLS

```sql
-- contract_units: تم حذف السياسة العامة
DROP POLICY "allow_read_contract_units" ON contract_units;
CREATE POLICY "staff_view_contract_units" ON contract_units
FOR SELECT USING (role IN ('admin', 'nazer', 'accountant', ...));

-- tasks: تم حذف السياسة العامة
DROP POLICY "Allow authenticated read on tasks" ON tasks;

-- profiles: توحيد من 14 سياسة إلى 4
-- user_roles: توحيد من 8 سياسات إلى 3
```

### ملخص التغييرات

| الدالة | قبل | بعد |
|--------|-----|-----|
| backup-database | JWT فقط | JWT + admin/nazer + audit |
| restore-database | JWT فقط | JWT + admin + audit |
| auto-close-fiscal-year | لا مصادقة | JWT + nazer + audit |
| simulate-distribution | لا مصادقة | JWT + admin/nazer/accountant + audit |
| generate-ai-insights | JWT فقط | JWT + admin/nazer/accountant + audit |
| contract-renewal-alerts | عام | JWT مطلوب |

### التوثيق الجديد
- ✅ إنشاء `docs/SECURITY.md` - دليل أمان شامل
- ✅ تحديث الإصدار إلى 2.6.15

---

## 📄 إصلاح وظائف PDF والطباعة الشاملة (v2.6.12)

### المشكلة
1. **ميزان المراجعة**: لا يدعم تصدير PDF، فقط Excel
2. **دفتر الأستاذ العام**: لا يدعم تصدير PDF أو Excel
3. **قائمة المركز المالي**: زر PDF غير مربوط بوظيفة
4. **قائمة الدخل**: زر PDF غير مربوط بوظيفة

### الحل المنفذ

#### 1. ميزان المراجعة (TrialBalanceReport.tsx)
```typescript
// ✅ إضافة تصدير PDF
const handleExportPDF = async () => {
  const { exportToPDF } = await import("@/lib/exportHelpers");
  const headers = ['رمز الحساب', 'اسم الحساب', 'مدين', 'دائن', 'الرصيد'];
  const data = trialBalance.map(acc => [...]);
  await exportToPDF(title, headers, data, filename);
};

// ✅ 3 أزرار: طباعة، PDF، Excel
```

#### 2. دفتر الأستاذ العام (GeneralLedgerReport.tsx)
```typescript
// ✅ إضافة تصدير PDF
const handleExportPDF = async () => {
  const { exportToPDF } = await import("@/lib/exportHelpers");
  const headers = ['التاريخ', 'رقم القيد', 'البيان', 'مدين', 'دائن', 'الرصيد'];
  await exportToPDF(title, headers, data, filename);
};

// ✅ إضافة تصدير Excel
const handleExportExcel = async () => {
  const { exportToExcel } = await import("@/lib/excel-helper");
  await exportToExcel(exportData, filename, sheetName);
};

// ✅ 3 أزرار: طباعة، PDF، Excel
```

#### 3. قائمة المركز المالي (EnhancedBalanceSheet.tsx)
```typescript
// ✅ ربط زر PDF بوظيفة فعلية
const handleExportPDF = async () => {
  await exportFinancialStatementToPDF(title, sections, totals, filename);
};

// ✅ إضافة وظيفة الطباعة
const handlePrint = () => window.print();
```

#### 4. قائمة الدخل (EnhancedIncomeStatement.tsx)
```typescript
// ✅ ربط زر PDF بوظيفة فعلية
const handleExportPDF = async () => {
  await exportFinancialStatementToPDF(title, sections, totals, filename);
};

// ✅ إضافة وظيفة الطباعة
const handlePrint = () => window.print();
```

### ملخص التغييرات

| التقرير | PDF | Excel | طباعة |
|---------|-----|-------|-------|
| ميزان المراجعة | ✅ جديد | ✅ موجود | ✅ موجود |
| دفتر الأستاذ العام | ✅ جديد | ✅ جديد | ✅ موجود |
| قائمة المركز المالي | ✅ مُصلَح | - | ✅ جديد |
| قائمة الدخل | ✅ مُصلَح | - | ✅ جديد |

### المرحلة 2: توحيد أدوات التصدير

**التغييرات:**
- إضافة `exportToCSV()` إلى `exportHelpers.ts`
- تحديث `useUnifiedExport.ts` v2.6.12 بدالة `exportToCSV`
- حذف `export-utils.ts` (ملف مكرر)
- تحديث `CustomReportBuilder.tsx` لاستخدام `exportHelpers`

**الدوال المتاحة:**
| الدالة | الملف | الوصف |
|--------|-------|-------|
| `exportToPDF()` | exportHelpers.ts | تصدير جدول إلى PDF |
| `exportToExcel()` | exportHelpers.ts | تصدير Excel |
| `exportToCSV()` | exportHelpers.ts | تصدير CSV مع دعم العربية |
| `exportFinancialStatementToPDF()` | exportHelpers.ts | تصدير قائمة مالية |

---

## 🔄 نظام التقارير المباشرة والموحدة (v2.6.11)

### المشكلة
1. **عدم تطابق الأرقام**: كل لوحة تحكم تستخدم hook مختلف (useDashboardKPIs, useNazerKPIs, useAdminKPIs)
2. **بيانات قديمة**: staleTime = 1 ساعة، لا تحديث مباشر
3. **غياب Real-time**: التقارير لا تتحدث عند تغيير البيانات

### الحل المنفذ

#### المرحلة 1: تحسين إعدادات التحديث
```typescript
// src/lib/queryOptimization.ts
DASHBOARD_KPIS: {
  staleTime: 2 * 60 * 1000,        // ✅ 2 دقائق بدلاً من 1 ساعة
  gcTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,   // ✅ تحديث كل 5 دقائق
  refetchOnWindowFocus: true,       // ✅ تحديث عند العودة للنافذة
},
REPORTS: {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: true,
}
```

#### المرحلة 2: تفعيل التحديث المباشر (Real-time)

**التقارير المُحدّثة:**
| التقرير | Real-time Tables |
|---------|------------------|
| BeneficiaryReports | beneficiaries |
| PropertiesReports | properties, contracts |
| InteractiveDashboard | beneficiaries, payments, properties |
| DistributionAnalysisReport | distributions |
| CashFlowReport | payments, journal_entries |
| KPIDashboard | distributions, beneficiaries, payments, contracts |

**Hooks المُحدّثة:**
| Hook | Real-time Tables |
|------|------------------|
| useNazerKPIs | beneficiaries, properties, contracts, loans, journal_entries |
| useAdminKPIs | beneficiaries, properties, families, beneficiary_requests |
| useDashboardKPIs | beneficiaries, properties, payments, contracts |
| useKPIs | distributions, beneficiaries, payments, contracts |

#### المرحلة 3: مكون KPIs موحد

**Hook موحد - useUnifiedKPIs:**
```typescript
// src/hooks/useUnifiedKPIs.ts
export function useUnifiedKPIs() {
  // جلب جميع البيانات بالتوازي
  const [
    beneficiariesResult,
    familiesResult,
    propertiesResult,
    contractsResult,
    fundsResult,
    requestsResult,
    loansResult,
    paymentsResult,
    journalEntriesResult
  ] = await Promise.all([...]);

  // Real-time على 9 جداول
  useEffect(() => {
    const tables = ['beneficiaries', 'properties', 'contracts', ...];
    const channels = tables.map(table => 
      supabase.channel(`unified-kpis-${table}`)
        .on('postgres_changes', {...})
        .subscribe()
    );
  }, []);
}
```

**مكون موحد - UnifiedDashboardKPIs:**
```tsx
// src/components/unified/UnifiedDashboardKPIs.tsx
<UnifiedDashboardKPIs 
  variant="nazer"           // 'admin' | 'nazer' | 'accountant' | 'default'
  title="إحصائيات الناظر"
  showRefreshIndicator={true}
/>
```

**مؤشر التحديث - ReportRefreshIndicator:**
```tsx
// يظهر آخر تحديث + زر التحديث اليدوي
<ReportRefreshIndicator
  lastUpdated={lastUpdated}
  isRefetching={isRefetching}
  onRefresh={refresh}
/>
```

### الملفات المُعدّلة

| الملف | التغيير |
|-------|---------|
| `src/lib/queryOptimization.ts` | تقليل staleTime، إضافة REPORTS config |
| `src/components/reports/ReportRefreshIndicator.tsx` | **جديد** - مؤشر التحديث |
| `src/components/reports/BeneficiaryReports.tsx` | Real-time + RefreshIndicator |
| `src/components/reports/PropertiesReports.tsx` | Real-time + RefreshIndicator |
| `src/components/reports/InteractiveDashboard.tsx` | Real-time + RefreshIndicator |
| `src/components/reports/DistributionAnalysisReport.tsx` | Real-time + RefreshIndicator |
| `src/components/reports/CashFlowReport.tsx` | Real-time + RefreshIndicator |
| `src/components/reports/KPIDashboard.tsx` | Real-time + RefreshIndicator |
| `src/hooks/useKPIs.ts` | Real-time subscriptions |
| `src/hooks/useNazerKPIs.ts` | Real-time subscriptions |
| `src/hooks/useAdminKPIs.ts` | Real-time subscriptions |
| `src/hooks/useDashboardKPIs.ts` | Real-time subscriptions |
| `src/hooks/useUnifiedKPIs.ts` | **جديد** - Hook موحد |
| `src/components/unified/UnifiedDashboardKPIs.tsx` | **جديد** - مكون موحد |

### النتائج

| المقياس | قبل | بعد | التحسين |
|---------|-----|-----|---------|
| تحديث البيانات | 1 ساعة | **2 دقائق** | **97%** |
| Real-time Reports | 4 تقارير | **10+ تقارير** | **150%** |
| تطابق الأرقام | ❌ مختلفة | ✅ **موحدة** | **100%** |
| زر التحديث اليدوي | ❌ غير متاح | ✅ **متاح** | **جديد** |
| مؤشر آخر تحديث | ❌ غير متاح | ✅ **متاح** | **جديد** |

### استخدام المكون الموحد

```tsx
// في أي لوحة تحكم
import { UnifiedDashboardKPIs } from "@/components/unified";

// لوحة الناظر
<UnifiedDashboardKPIs variant="nazer" title="إحصائيات الناظر" />

// لوحة المشرف
<UnifiedDashboardKPIs variant="admin" title="إحصائيات المشرف" />

// لوحة المحاسب
<UnifiedDashboardKPIs variant="accountant" title="إحصائيات المحاسب" />
```

---

## 🔐 إصلاح مشكلة التحميل بعد تسجيل الدخول (v2.6.10)

### المشكلة
شاشة "جاري التحميل..." تظهر للأبد بعد تسجيل الدخول بسبب Race Condition.

### السبب الجذري
1. `Login.tsx` يوجه إلى `/redirect` فوراً قبل اكتمال تحميل بيانات المستخدم
2. `AuthContext` يعيد `isLoading=true` عند `SIGNED_IN` حتى لو البيانات محملة
3. `RoleBasedRedirect` ينتظر للأبد بدون timeout

### الحل المنفذ

#### 1. إصلاح Login.tsx
```typescript
// ❌ قبل: توجيه فوري
await signIn(identifier, password);
navigate('/redirect');

// ✅ بعد: انتظار اكتمال المصادقة
const [loginSuccess, setLoginSuccess] = useState(false);

useEffect(() => {
  if (loginSuccess && user && !authLoading && roles.length > 0) {
    navigate('/redirect');
  }
}, [loginSuccess, user, authLoading, roles]);
```

#### 2. إصلاح AuthContext.tsx
```typescript
// ✅ منع إعادة isLoading لـ true إذا البيانات محملة
if (event === 'SIGNED_IN') {
  if (!isInitialized || rolesCache.current.length === 0) {
    setIsLoading(true);
  }
}
```

#### 3. إضافة Timeout في RoleBasedRedirect
```typescript
// ✅ timeout 5 ثواني + fallback للأدوار المخزنة
const [loadingTooLong, setLoadingTooLong] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setLoadingTooLong(true), 5000);
  return () => clearTimeout(timer);
}, []);

if (loadingTooLong && user) {
  const cachedRoles = localStorage.getItem('waqf_user_roles');
  // استخدام الأدوار المخزنة أو التوجيه للـ dashboard العام
}
```

### الملفات المُعدّلة
| الملف | التغيير |
|-------|---------|
| `src/pages/Login.tsx` | استخدام useEffect للتوجيه بدلاً من navigate فوري |
| `src/contexts/AuthContext.tsx` | منع تكرار isLoading عند SIGNED_IN |
| `src/components/auth/RoleBasedRedirect.tsx` | إضافة timeout + fallback |

### النتائج
- ✅ إصلاح Race Condition في تسجيل الدخول
- ✅ منع التعليق في شاشة التحميل
- ✅ Fallback للأدوار المخزنة مؤقتاً
- ✅ تحسين تجربة المستخدم

---

## 🔒 إصلاح ثغرة أمنية وتحديث المكتبات (v2.6.9)

### المشكلة
```
CVE-2024-22363 - ثغرة ReDoS (Regular Expression Denial of Service) 
في مكتبة xlsx الإصدارات < 0.20.2
```

### الحل المنفذ

#### 1. استبدال xlsx بـ exceljs
```typescript
// ❌ قبل: xlsx (ثغرة CVE-2024-22363)
import * as XLSX from 'xlsx';

// ✅ بعد: exceljs (آمن ومحسن)
import ExcelJS from 'exceljs';
```

#### 2. إنشاء Helper موحد
```typescript
// src/lib/excel-helper.ts
export async function exportToExcel(data, filename, sheetName)
export async function exportToExcelMultiSheet(sheets, filename)
export async function readExcelFile(file)
export async function readExcelBuffer(buffer)
```

### النتائج
- ✅ إصلاح CVE-2024-22363
- ✅ تصدير Excel يعمل بشكل صحيح
- ✅ دعم RTL في ملفات Excel
- ✅ تنسيق محسن

---

## 📊 ملخص التحسينات الإجمالية

| الفئة | v2.6.9 | v2.6.10 | v2.6.11 |
|-------|--------|---------|---------|
| LCP | < 0.5s | < 0.5s | < 0.5s |
| Dashboard Load | 1.1s | 1.1s | **1.0s** |
| Real-time Reports | 4 | 4 | **10+** |
| تحديث البيانات | 1 ساعة | 1 ساعة | **2 دقائق** |
| KPIs موحدة | ❌ | ❌ | ✅ |
| مؤشر التحديث | ❌ | ❌ | ✅ |
| Login Fix | ❌ | ✅ | ✅ |
| Excel Security | ✅ | ✅ | ✅ |

---

## 📝 ملاحظات للمطورين

1. **Real-time**: استخدم `supabase.channel()` للاشتراك في تغييرات الجداول
2. **Query Invalidation**: استخدم `queryClient.invalidateQueries()` للتحديث الفوري
3. **KPIs موحدة**: استخدم `UnifiedDashboardKPIs` لضمان تطابق الأرقام
4. **مؤشر التحديث**: أضف `ReportRefreshIndicator` لكل تقرير
5. **staleTime**: لا تستخدم أكثر من 2 دقيقة للبيانات الحية

---

## 🔗 روابط مفيدة

- [DEPENDENCY_POLICY.md](./DEPENDENCY_POLICY.md) - سياسة المكتبات
- [PERFORMANCE.md](./PERFORMANCE.md) - تقرير الأداء الشامل
- [DEVELOPER_MASTER_GUIDE.md](./DEVELOPER_MASTER_GUIDE.md) - دليل المطور

---

**آخر تحديث:** 2025-12-05  
**الإصدار الحالي:** 2.6.15  
**الحالة:** ✅ مستقر وجاهز للإنتاج مع إصلاحات أمنية شاملة
