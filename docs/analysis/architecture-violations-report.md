# تقرير الانتهاكات المعمارية الشامل
**تاريخ التقرير:** 2026-01-20
**الإصدار:** v1.0.0

---

## ملخص تنفيذي

| الفئة | العدد | الأولوية |
|-------|-------|----------|
| استدعاءات Supabase في Pages | 6 | 🔴 عالي |
| استدعاءات Supabase في Components | 24+ | 🔴 عالي |
| استخدام `.single()` | 9 ملفات (90 موقع) | 🟠 متوسط-عالي |
| `queryKey` كسلاسل ثابتة | 69 ملف (693 موقع) | 🟡 متوسط |
| ألوان مباشرة في className | 5 ملفات (41 موقع) | 🟢 منخفض |
| `console.log` في Edge Functions | 56 ملف (3040 موقع) | 🟢 منخفض |

---

## 🔴 الأولوية العالية: استدعاءات Supabase المباشرة

### Pages (6 ملفات)

| الملف | السطر | الوصف |
|-------|-------|-------|
| `src/pages/PaymentVouchers.tsx` | 15, 39 | استدعاء functions.invoke |
| `src/pages/SecurityDashboard.tsx` | 17 | استدعاء supabase مباشر |
| `src/pages/EdgeFunctionTest.tsx` | 11 | استدعاء functions.invoke |
| `src/pages/IntegrationsManagement.tsx` | 11 | استدعاء supabase مباشر |
| `src/pages/LoginLight.tsx` | 12 | استدعاء auth (مقبول) |
| `src/pages/LandingPageLight.tsx` | 11 | استدعاء supabase مباشر |

### Components (24+ ملف)

| الملف | السطر | الوصف |
|-------|-------|-------|
| `src/components/tenants/QuickPaymentDialog.tsx` | 22, 71-84 | insert مباشر |
| `src/components/tenants/TenantReceipts.tsx` | 21 | select مباشر |
| `src/components/beneficiary/cards/AnnualShareCard.tsx` | 10 | select مباشر |
| `src/components/contracts/ContractDialog.tsx` | 13 | storage.upload |
| `src/components/contracts/ContractReceipts.tsx` | 13 | select مباشر |
| `src/components/contracts/ContractNotificationDialog.tsx` | 49 | insert/update |
| `src/components/contracts/CancelAutoRenewDialog.tsx` | 26 | update مباشر |
| `src/components/contracts/UnitHandoverDialog.tsx` | 51 | insert مباشر |
| `src/components/contracts/UnilateralTerminationDialog.tsx` | 45 | insert مباشر |
| `src/components/nazer/TenantMaintenanceRequestsSection.tsx` | 21 | select مباشر |
| `src/components/settings/BackupSettingsDialog.tsx` | 23 | update مباشر |
| `src/components/dashboard/DashboardDialogs.tsx` | 9 | استدعاء مباشر |
| `src/components/zatca/ZATCAComplianceChecker.tsx` | 6 | select مباشر |
| `src/components/beneficiary/dialogs/EditProfileDialog.tsx` | 33 | update مباشر |
| `src/components/beneficiary/tabs/FinancialReportsTab.tsx` | 30 | select مباشر |
| `src/components/requests/CreateRequestDialog.tsx` | 21 | insert مباشر |
| `src/components/payments/AddVoucherDialog.tsx` | - | insert مباشر |

---

## 🟠 الأولوية المتوسطة-العالية: استخدام `.single()`

| الملف | عدد المواقع | الخطورة |
|-------|-------------|---------|
| `src/hooks/contracts/useUnitHandovers.ts` | 4 | ⚠️ بعد INSERT/UPDATE - مقبول |
| `src/hooks/contracts/useContractNotifications.ts` | 3 | ⚠️ بعد INSERT/UPDATE - مقبول |
| `src/hooks/contracts/useContractRequests.ts` | 4 | ⚠️ بعد INSERT/UPDATE - مقبول |
| `src/hooks/dashboard/useCollectionStats.ts` | 4 | ❌ يجب استبداله بـ maybeSingle |
| `src/services/unified-financial.service.ts` | 1 | ❌ يجب استبداله بـ maybeSingle |
| `src/services/property/property-units.service.ts` | 1 | ⚠️ للتحقق من التكرار - مقبول |
| `src/components/tenants/QuickPaymentDialog.tsx` | 1 | ⚠️ بعد INSERT - مقبول |
| `src/hooks/system/useAuditLogsEnhanced.ts` | 1 | ❌ يجب استبداله بـ maybeSingle |

**ملاحظة:** استخدام `.single()` بعد INSERT/UPDATE مقبول لأن السجل مضمون الوجود.

---

## 🟡 الأولوية المتوسطة: queryKey كسلاسل ثابتة

**إجمالي:** 69 ملف، 693 موقع

### أمثلة رئيسية:

| الملف | المفتاح | البديل |
|-------|---------|--------|
| `useContractRequests.ts` | `['termination-requests']` | `QUERY_KEYS.TERMINATION_REQUESTS` |
| `useLivePerformance.ts` | `['live-performance']` | `QUERY_KEYS.LIVE_PERFORMANCE` |
| `useSavedFilters.ts` | `['saved-filters', type]` | `QUERY_KEYS.SAVED_FILTERS(type)` |
| `RequestsFilters.tsx` | `['request-types']` | `QUERY_KEYS.REQUEST_TYPES` |

**التوصية:** إضافة المفاتيح المفقودة إلى `src/lib/query-keys/` واستبدال السلاسل.

---

## 🟢 الأولوية المنخفضة: ألوان مباشرة

| الملف | الألوان | التوصية |
|-------|---------|---------|
| `WelcomeCard.tsx` | `bg-white/20`, `text-white` | استخدام `bg-background/20`, `text-foreground` |
| `POSReceipt.tsx` | `print:bg-white` | مقبول للطباعة |
| `UnitHandoverPrintTemplate.tsx` | `bg-white` | مقبول للطباعة |
| `ConnectionStatusPanel.tsx` | `text-white` | استخدام `text-primary-foreground` |
| `tabs.tsx` | `text-white` | استخدام `text-primary-foreground` |

---

## 🟢 الأولوية المنخفضة: console.log في Edge Functions

**إجمالي:** 56 ملف، 3040 موقع

**التوصية:** استبدال بـ structured logging أو تقليل السجلات الحساسة.

---

## ✅ الإصلاحات المُنجزة

| الملف | الإصلاح | التاريخ |
|-------|---------|---------|
| `src/hooks/nazer/useWaqfBranding.ts` | نقل منطق Supabase إلى BrandingService | 2026-01-20 |
| `src/services/branding.service.ts` | إنشاء خدمة جديدة | 2026-01-20 |
| `src/services/diagnostics.service.ts` | إنشاء خدمة جديدة | 2026-01-20 |
| `src/lib/query-keys/system.keys.ts` | إضافة WAQF_BRANDING | 2026-01-20 |

---

## خطة الإصلاح المقترحة

### المرحلة 1: الأولوية القصوى (1-2 يوم)
1. ✅ إنشاء Services للمكونات الحرجة (BrandingService, DiagnosticsService)
2. ⏳ نقل منطق QuickPaymentDialog إلى TenantPaymentService
3. ⏳ نقل منطق ContractDialog uploads إلى ContractService
4. ⏳ إصلاح `.single()` في useCollectionStats

### المرحلة 2: الأولوية العالية (3-5 أيام)
1. نقل باقي استدعاءات Supabase من Components إلى Services
2. توحيد queryKey إلى QUERY_KEYS
3. استبدال الألوان المباشرة بـ design tokens

### المرحلة 3: التحسينات (أسبوع)
1. إضافة اختبارات للخدمات الجديدة
2. تحديث الوثائق
3. إضافة قواعد ESLint لمنع الانتهاكات المستقبلية

---

## أوامر الفحص المحلي

```bash
# البحث عن supabase في Pages/Components
rg "from.*supabase.*client" src/pages src/components

# البحث عن .single()
rg "\.single\(" src

# البحث عن queryKey ثابتة
rg "queryKey: \['" src

# البحث عن ألوان مباشرة
rg "bg-white|text-white|bg-black" src/components
```

---

**تم إنشاء هذا التقرير آلياً بواسطة نظام الفحص المعماري**
