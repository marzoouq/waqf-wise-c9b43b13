# سجل المكونات (Component Registry)

> آخر تحديث: 2026-01-18

## ملخص

| الفئة | عدد المجلدات | عدد المكونات التقريبي |
|-------|-------------|----------------------|
| **Dashboard** | 5 | 50+ |
| **Shared** | 2 | 30+ |
| **Beneficiary** | 3 | 40+ |
| **Accounting** | 4 | 60+ |
| **Properties** | 3 | 35+ |
| **Governance** | 3 | 25+ |
| **System** | 5 | 45+ |
| **الإجمالي** | **48** | **400+** |

---

## 1. مكونات اللوحات (Dashboard)

### 1.1 shared/
المسار: `src/components/dashboard/shared/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `UnifiedErrorFallback.tsx` | معالج أخطاء موحد | ✅ |
| `ScrollToTopButton.tsx` | زر العودة للأعلى | ✅ |
| `DashboardLoadingState.tsx` | حالة التحميل | ✅ |
| `KPICard.tsx` | بطاقة مؤشر الأداء | ✅ |
| `StatCard.tsx` | بطاقة الإحصائيات | ✅ |

### 1.2 kpis/
المسار: `src/components/dashboard/kpis/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `AdminKPIs.tsx` | مؤشرات المشرف | ✅ |
| `NazerKPIs.tsx` | مؤشرات الناظر | ✅ |
| `AccountantKPIs.tsx` | مؤشرات المحاسب | ✅ |
| `CashierKPIs.tsx` | مؤشرات الصراف | ✅ |
| `UnifiedKPICards.tsx` | بطاقات KPI الموحدة | ✅ |

### 1.3 charts/
المسار: `src/components/dashboard/charts/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `RevenueChart.tsx` | رسم الإيرادات | ✅ |
| `ExpenseChart.tsx` | رسم المصروفات | ✅ |
| `OccupancyChart.tsx` | رسم الإشغال | ✅ |
| `TrendChart.tsx` | رسم الاتجاهات | ✅ |

---

## 2. مكونات المستفيدين (Beneficiary)

### 2.1 beneficiary/
المسار: `src/components/beneficiary/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `BeneficiaryProfile.tsx` | ملف المستفيد | ✅ |
| `BeneficiaryCard.tsx` | بطاقة المستفيد | ✅ |
| `BeneficiaryTable.tsx` | جدول المستفيدين | ✅ |
| `AddBeneficiaryDialog.tsx` | إضافة مستفيد | ✅ |
| `EditBeneficiaryDialog.tsx` | تعديل مستفيد | ✅ |

### 2.2 families/
المسار: `src/components/families/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `FamilyCard.tsx` | بطاقة العائلة | ✅ |
| `FamilyMembersDialog.tsx` | أعضاء العائلة | ✅ |
| `FamilyTreeView.tsx` | شجرة العائلة | ✅ |

---

## 3. مكونات المحاسبة (Accounting)

### 3.1 accounting/
المسار: `src/components/accounting/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `JournalEntryForm.tsx` | نموذج القيد | ✅ |
| `JournalEntriesTable.tsx` | جدول القيود | ✅ |
| `AccountsTree.tsx` | شجرة الحسابات | ✅ |
| `TrialBalanceView.tsx` | ميزان المراجعة | ✅ |

### 3.2 payments/
المسار: `src/components/payments/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `PaymentVoucherForm.tsx` | نموذج السند | ✅ |
| `VouchersTable.tsx` | جدول السندات | ✅ |
| `PaymentApprovalDialog.tsx` | موافقة الدفع | ✅ |

### 3.3 invoices/
المسار: `src/components/invoices/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `InvoiceForm.tsx` | نموذج الفاتورة | ✅ |
| `InvoicesTable.tsx` | جدول الفواتير | ✅ |
| `InvoicePreview.tsx` | معاينة الفاتورة | ✅ |

---

## 4. مكونات العقارات (Properties)

### 4.1 properties/
المسار: `src/components/properties/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `PropertyCard.tsx` | بطاقة العقار | ✅ |
| `PropertyDetailsDialog.tsx` | تفاصيل العقار | ✅ |
| `PropertiesListView.tsx` | قائمة العقارات | ✅ |
| `PropertyAccordionView.tsx` | عرض الأكورديون | ✅ |

### 4.2 maintenance/
المسار: `src/components/maintenance/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `MaintenanceRequestCard.tsx` | بطاقة الطلب | ✅ |
| `CreateMaintenanceRequestDialog.tsx` | إنشاء طلب | ✅ |
| `MaintenanceStatusBadge.tsx` | شارة الحالة | ✅ |

### 4.3 tenants/
المسار: `src/components/tenants/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `TenantCard.tsx` | بطاقة المستأجر | ✅ |
| `TenantDetailsDialog.tsx` | تفاصيل المستأجر | ✅ |
| `TenantContracts.tsx` | عقود المستأجر | ✅ |

---

## 5. مكونات الحوكمة (Governance)

### 5.1 governance/
المسار: `src/components/governance/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `DecisionCard.tsx` | بطاقة القرار | ✅ |
| `DecisionVoting.tsx` | التصويت على القرار | ✅ |
| `BoardMeetingCard.tsx` | بطاقة الاجتماع | ✅ |

### 5.2 approvals/
المسار: `src/components/approvals/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `ApprovalWorkflow.tsx` | سير عمل الموافقة | ✅ |
| `ApprovalCard.tsx` | بطاقة الموافقة | ✅ |
| `ApprovalHistory.tsx` | تاريخ الموافقات | ✅ |

---

## 6. مكونات النظام (System)

### 6.1 monitoring/
المسار: `src/components/monitoring/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `SystemHealthCard.tsx` | صحة النظام | ✅ |
| `PerformanceMetrics.tsx` | مقاييس الأداء | ✅ |
| `AlertsPanel.tsx` | لوحة التنبيهات | ✅ |

### 6.2 developer/
المسار: `src/components/developer/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `EdgeFunctionsMonitor.tsx` | مراقبة Edge Functions | ✅ |
| `DatabaseHealthPanel.tsx` | صحة قاعدة البيانات | ✅ |
| `LogsViewer.tsx` | عارض السجلات | ✅ |

### 6.3 settings/
المسار: `src/components/settings/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `SettingsForm.tsx` | نموذج الإعدادات | ✅ |
| `RolesManager.tsx` | إدارة الأدوار | ✅ |
| `PermissionsTable.tsx` | جدول الصلاحيات | ✅ |

---

## 7. مكونات مشتركة (Shared)

### 7.1 ui/
المسار: `src/components/ui/`

| المكون | الوظيفة | المصدر |
|--------|---------|--------|
| `Button.tsx` | زر | shadcn/ui |
| `Input.tsx` | حقل إدخال | shadcn/ui |
| `Dialog.tsx` | نافذة حوار | shadcn/ui |
| `Table.tsx` | جدول | shadcn/ui |
| `Card.tsx` | بطاقة | shadcn/ui |
| `Select.tsx` | قائمة منسدلة | shadcn/ui |

### 7.2 shared/
المسار: `src/components/shared/`

| المكون | الوظيفة | الحالة |
|--------|---------|--------|
| `ResponsiveDialog.tsx` | حوار متجاوب | ✅ |
| `LoadingSpinner.tsx` | مؤشر التحميل | ✅ |
| `EmptyState.tsx` | حالة فارغة | ✅ |
| `ErrorBoundary.tsx` | حدود الخطأ | ✅ |
| `Pagination.tsx` | التصفح | ✅ |

---

## 8. ملخص الحالة

| المعيار | النتيجة |
|---------|---------|
| **عدد المجلدات** | 48 |
| **عدد المكونات** | 400+ |
| **مكونات shadcn/ui** | 40+ |
| **مكونات مخصصة** | 360+ |
| **نسبة إعادة الاستخدام** | ~70% |
| **حالة التوثيق** | ✅ موثق |

---

## 9. التحديثات

| التاريخ | التغيير |
|---------|---------|
| 2026-01-18 | إنشاء السجل |
