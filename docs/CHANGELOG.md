# 📝 سجل التغييرات | Changelog

**الإصدار الحالي:** 2.8.46 | **آخر تحديث:** 2025-12-09

---

## [2.8.46] - 2025-12-09

### 🔍 تدقيق معماري شامل (Comprehensive Architecture Audit)

#### 📊 حالة الهيكل المعماري الفعلية

| المكون | الحالة | التفاصيل |
|--------|--------|----------|
| **الخدمات** | ✅ مكتمل | 43 خدمة في `src/services/` |
| **الـ Hooks** | ✅ مكتمل | 170+ hook في 25 مجلد |
| **QUERY_KEYS** | ✅ مكتمل | موحد في `src/lib/query-keys.ts` |
| **Realtime** | 🟡 جزئي | موحد للوحات التحكم، بعض المكونات تحتاج تحويل |
| **Components** | 🔴 قيد العمل | 41 مكون لا يزال يستخدم Supabase مباشرة |

#### ✅ ما تم إنجازه
- **AddJournalEntryDialog:** تم تحويله لاستخدام `useAddJournalEntry` hook
- توثيق صادق للحالة الفعلية للمشروع
- تحديث `src/lib/version.ts` بحالة الهيكل المعماري

#### 🔴 المتبقي (41 Component)
المكونات التالية لا تزال تستخدم `supabase` مباشرة وتحتاج تحويل:

**Auth & Session:**
- `IdleTimeoutManager.tsx`

**Beneficiary:**
- `BeneficiarySettingsDropdown.tsx`
- `ChangePasswordDialog.tsx`
- `EditEmailDialog.tsx`
- `EditPhoneDialog.tsx`
- `NotificationPreferences.tsx`
- `ReportsMenu.tsx`
- `BeneficiariesImporter.tsx`
- `BeneficiaryAttachmentsDialog.tsx`
- `CreateBeneficiaryAccountDialog.tsx`
- `CreateBeneficiaryAccountsButton.tsx`
- `EnableLoginDialog.tsx`

**Distributions:**
- `BankStatementUpload.tsx`
- `BankTransferGenerator.tsx`
- `PaymentVoucherDialog.tsx`

**Fiscal Years:**
- `AddFiscalYearDialog.tsx`
- `AutomaticClosingDialog.tsx`
- `FiscalYearTestPanel.tsx`

**Funds:**
- `DistributionDialog.tsx`
- `AnnualDisclosureTab.tsx`

**Invoices:**
- `AddInvoiceDialog.tsx`
- `ViewInvoiceDialog.tsx`

**Messages:**
- `AdminSendMessageDialog.tsx`
- `InternalMessagesDialog.tsx`

**Nazer:**
- `PublishFiscalYearDialog.tsx`

**Notifications:**
- `MultiChannelNotifications.tsx`

**Payments:**
- `AddReceiptDialog.tsx`
- `AddVoucherDialog.tsx`

**Properties:**
- `AIAssistantDialog.tsx`
- `PropertyUnitDialog.tsx`
- `PaymentsTab.tsx`

**Reports:**
- `CustomReportBuilder.tsx`

**Settings:**
- `SecuritySettingsDialog.tsx`
- `TwoFactorDialog.tsx`

**System:**
- `SelfHealingToolsPanel.tsx`
- `SystemHealthDashboard.tsx`

**Users:**
- `EditUserEmailDialog.tsx`

**Waqf:**
- `LinkPropertyDialog.tsx`
- `WaqfUnitDetailsDialog.tsx`

**ZATCA:**
- `ZATCAConfigDialog.tsx`

#### 🔧 3 Hooks تستخدم supabase.from() مباشرة
- `useLeakedPassword.ts`
- `useDeepDiagnostics.ts`
- `useAdvancedSearch.ts`

---

## [2.8.45] - 2025-12-09

### 🏗️ تحسينات الهيكل المعماري
- نقل Realtime من 3 components إلى hooks
- توحيد QUERY_KEYS موجود ومحدث
- إزالة استيرادات supabase مباشرة من بعض Components
- 42 خدمة متكاملة

---

## [2.6.42] - 2025-12-08

### 🏗️ تحسين الهيكل المعماري (Architecture Improvements)

#### ✨ الميزات الجديدة
- **DashboardService:** طبقة خدمة جديدة للـ Dashboard
- **ثوابت الحالة الجديدة:** `PROPERTY_STATUS`, `CONTRACT_STATUS`, `LOAN_STATUS`, `REQUEST_STATUS`

#### 🔧 التحسينات
- **useNazerSystemOverview:** يستخدم الآن `DashboardService.getSystemOverview()`
- **useUnifiedKPIs:** يستخدم الآن `DashboardService.getUnifiedKPIs()`

---

## [2.6.39] - 2025-12-07

### 🔄 توحيد مصادر بيانات لوحات التحكم

---

## [2.6.38] - 2025-12-07

### 🏢 نظام إدارة المستأجرين الشامل

#### ✨ الميزات الجديدة
- **جدول المستأجرين `tenants`**
- **سجل حساب المستأجر `tenant_ledger`**
- **حساب ذمم المستأجرين (1.2.1)**
- **تقرير أعمار الديون**

---

## [2.6.36] - 2025-12-07

### 🆕 نظام نقطة البيع (POS)

---

## الإصدارات السابقة

للاطلاع على سجل التغييرات الكامل، راجع الإصدارات السابقة في Git history.

---

**ملاحظة:** هذا التوثيق يعكس الحالة الفعلية للمشروع بعد التدقيق المعماري الشامل في 2025-12-09.
