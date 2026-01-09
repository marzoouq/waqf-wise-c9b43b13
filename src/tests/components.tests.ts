/**
 * اختبارات المكونات الشاملة - حقيقية
 * تختبر وجود المكونات وقابليتها للاستيراد
 * @version 2.0.0 - Real Tests
 */

import type { TestResult } from './hooks.tests';

// ==================== دوال مساعدة للاختبارات الحقيقية ====================

/**
 * اختبار استيراد مكون حقيقي
 */
async function testComponentImport(
  componentPath: string,
  componentName: string
): Promise<{ success: boolean; details: string }> {
  try {
    const module = await import(/* @vite-ignore */ componentPath);
    
    // فحص وجود المكون بالاسم المحدد أو كـ default export
    const Component = module[componentName] || module.default;
    
    if (Component) {
      // تحقق أنه React component (function أو class)
      if (typeof Component === 'function') {
        return { 
          success: true, 
          details: `✅ المكون ${componentName} موجود وقابل للاستيراد` 
        };
      } else {
        return { 
          success: false, 
          details: `⚠️ ${componentName} موجود لكنه ليس React Component` 
        };
      }
    } else {
      // فحص الـ exports المتاحة
      const availableExports = Object.keys(module).filter(k => k !== '__esModule');
      return { 
        success: false, 
        details: `❌ ${componentName} غير موجود. المتاح: [${availableExports.join(', ')}]` 
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // تحليل نوع الخطأ
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Cannot find module')) {
      return { 
        success: false, 
        details: `❌ الملف ${componentPath} غير موجود` 
      };
    }
    
    return { 
      success: false, 
      details: `❌ خطأ في استيراد ${componentName}: ${errorMsg}` 
    };
  }
}

/**
 * اختبار مجموعة مكونات من مجلد
 */
async function testComponentsFromFolder(
  folderPath: string,
  componentNames: string[]
): Promise<{ found: string[]; missing: string[]; errors: string[] }> {
  const found: string[] = [];
  const missing: string[] = [];
  const errors: string[] = [];
  
  for (const name of componentNames) {
    try {
      const module = await import(/* @vite-ignore */ `${folderPath}/${name}`);
      if (module[name] || module.default) {
        found.push(name);
      } else {
        missing.push(name);
      }
    } catch {
      errors.push(name);
    }
  }
  
  return { found, missing, errors };
}

// ==================== اختبارات مكونات المحاسبة ====================

const accountingComponentsTests = [
  {
    id: 'comp-accounts-tree-render',
    name: 'AccountsTree - عرض الشجرة',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/AccountsTree', 'AccountsTree')
  },
  {
    id: 'comp-add-account-dialog',
    name: 'AddAccountDialog - إضافة حساب',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/AddAccountDialog', 'AddAccountDialog')
  },
  {
    id: 'comp-journal-entry-form-render',
    name: 'JournalEntryForm - نموذج القيد',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/journal/JournalEntryForm', 'JournalEntryForm')
  },
  {
    id: 'comp-journal-entries-list',
    name: 'JournalEntriesList - قائمة القيود',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/journal/JournalEntriesList', 'JournalEntriesList')
  },
  {
    id: 'comp-trial-balance-render',
    name: 'TrialBalance - ميزان المراجعة',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/reports/TrialBalance', 'TrialBalance')
  },
  {
    id: 'comp-income-statement-render',
    name: 'IncomeStatement - قائمة الدخل',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/reports/IncomeStatement', 'IncomeStatement')
  },
  {
    id: 'comp-balance-sheet-render',
    name: 'BalanceSheet - الميزانية العمومية',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/reports/BalanceSheet', 'BalanceSheet')
  },
  {
    id: 'comp-fiscal-year-selector',
    name: 'FiscalYearSelector - اختيار السنة المالية',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/accounting/FiscalYearSelector', 'FiscalYearSelector')
  },
  {
    id: 'comp-budget-dialog-render',
    name: 'BudgetDialog - حوار الميزانية',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/budgets/BudgetDialog', 'BudgetDialog')
  },
  {
    id: 'comp-voucher-form-render',
    name: 'PaymentVoucherForm - نموذج السند',
    category: 'components-accounting',
    test: async () => testComponentImport('@/components/payments/vouchers/PaymentVoucherForm', 'PaymentVoucherForm')
  },
];

// ==================== اختبارات مكونات المستفيدين ====================

const beneficiaryComponentsTests = [
  {
    id: 'comp-beneficiary-form-render',
    name: 'BeneficiaryForm - نموذج المستفيد',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/BeneficiaryForm', 'BeneficiaryForm')
  },
  {
    id: 'comp-beneficiary-card-render',
    name: 'BeneficiaryCard - بطاقة المستفيد',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/BeneficiaryCard', 'BeneficiaryCard')
  },
  {
    id: 'comp-beneficiaries-table',
    name: 'BeneficiariesTable - جدول المستفيدين',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/BeneficiariesTable', 'BeneficiariesTable')
  },
  {
    id: 'comp-beneficiary-filters',
    name: 'BeneficiaryFilters - فلاتر المستفيدين',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/filters/BeneficiaryFilters', 'BeneficiaryFilters')
  },
  {
    id: 'comp-family-tree-render',
    name: 'FamilyTree - شجرة العائلة',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/FamilyTree', 'FamilyTree')
  },
  {
    id: 'comp-beneficiary-timeline',
    name: 'BeneficiaryTimeline - الجدول الزمني',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/BeneficiaryTimeline', 'BeneficiaryTimeline')
  },
  {
    id: 'comp-beneficiary-attachments',
    name: 'BeneficiaryAttachments - المرفقات',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/attachments/BeneficiaryAttachments', 'BeneficiaryAttachments')
  },
  {
    id: 'comp-emergency-aid-form',
    name: 'EmergencyAidForm - المساعدة الطارئة',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/emergency/EmergencyAidForm', 'EmergencyAidForm')
  },
  {
    id: 'comp-eligibility-badge',
    name: 'EligibilityBadge - شارة الأهلية',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/beneficiaries/EligibilityBadge', 'EligibilityBadge')
  },
  {
    id: 'comp-distribution-summary',
    name: 'DistributionSummary - ملخص التوزيع',
    category: 'components-beneficiary',
    test: async () => testComponentImport('@/components/distributions/DistributionSummary', 'DistributionSummary')
  },
];

// ==================== اختبارات مكونات العقارات ====================

const propertyComponentsTests = [
  {
    id: 'comp-property-card-render',
    name: 'PropertyCard - بطاقة العقار',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/PropertyCard', 'PropertyCard')
  },
  {
    id: 'comp-properties-table',
    name: 'PropertiesTable - جدول العقارات',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/PropertiesTable', 'PropertiesTable')
  },
  {
    id: 'comp-units-list-render',
    name: 'UnitsList - قائمة الوحدات',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/units/UnitsList', 'UnitsList')
  },
  {
    id: 'comp-unit-form',
    name: 'UnitForm - نموذج الوحدة',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/units/UnitForm', 'UnitForm')
  },
  {
    id: 'comp-contract-form-render',
    name: 'ContractForm - نموذج العقد',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/contracts/ContractForm', 'ContractForm')
  },
  {
    id: 'comp-contracts-table',
    name: 'ContractsTable - جدول العقود',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/contracts/ContractsTable', 'ContractsTable')
  },
  {
    id: 'comp-tenant-details-render',
    name: 'TenantDetails - تفاصيل المستأجر',
    category: 'components-property',
    test: async () => testComponentImport('@/components/tenants/TenantDetails', 'TenantDetails')
  },
  {
    id: 'comp-tenants-table',
    name: 'TenantsTable - جدول المستأجرين',
    category: 'components-property',
    test: async () => testComponentImport('@/components/tenants/TenantsTable', 'TenantsTable')
  },
  {
    id: 'comp-maintenance-table-render',
    name: 'MaintenanceTable - جدول الصيانة',
    category: 'components-property',
    test: async () => testComponentImport('@/components/maintenance/MaintenanceTable', 'MaintenanceTable')
  },
  {
    id: 'comp-maintenance-form-render',
    name: 'MaintenanceForm - نموذج الصيانة',
    category: 'components-property',
    test: async () => testComponentImport('@/components/maintenance/MaintenanceForm', 'MaintenanceForm')
  },
  {
    id: 'comp-rental-payment-form',
    name: 'RentalPaymentForm - نموذج الدفع',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/payments/RentalPaymentForm', 'RentalPaymentForm')
  },
  {
    id: 'comp-contract-expiry-alert',
    name: 'ContractExpiryAlert - تنبيه الانتهاء',
    category: 'components-property',
    test: async () => testComponentImport('@/components/properties/contracts/ContractExpiryAlert', 'ContractExpiryAlert')
  },
];

// ==================== اختبارات مكونات الحوكمة ====================

const governanceComponentsTests = [
  {
    id: 'comp-decision-card-render',
    name: 'DecisionCard - بطاقة القرار',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/governance/DecisionCard', 'DecisionCard')
  },
  {
    id: 'comp-decisions-table',
    name: 'DecisionsTable - جدول القرارات',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/governance/DecisionsTable', 'DecisionsTable')
  },
  {
    id: 'comp-voting-panel-render',
    name: 'VotingPanel - لوحة التصويت',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/governance/VotingPanel', 'VotingPanel')
  },
  {
    id: 'comp-disclosure-form-render',
    name: 'DisclosureForm - نموذج الإفصاح',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/disclosures/DisclosureForm', 'DisclosureForm')
  },
  {
    id: 'comp-disclosures-list',
    name: 'DisclosuresList - قائمة الإفصاحات',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/disclosures/DisclosuresList', 'DisclosuresList')
  },
  {
    id: 'comp-approval-workflow-render',
    name: 'ApprovalWorkflow - سير الموافقات',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/approvals/ApprovalWorkflow', 'ApprovalWorkflow')
  },
  {
    id: 'comp-approval-steps',
    name: 'ApprovalSteps - خطوات الموافقة',
    category: 'components-governance',
    test: async () => testComponentImport('@/components/approvals/ApprovalSteps', 'ApprovalSteps')
  },
];

// ==================== اختبارات المكونات المشتركة ====================

const sharedComponentsTests = [
  {
    id: 'comp-data-table-render',
    name: 'DataTable - جدول البيانات',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/data-table', 'DataTable')
  },
  {
    id: 'comp-button',
    name: 'Button - الزر',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/button', 'Button')
  },
  {
    id: 'comp-input',
    name: 'Input - حقل الإدخال',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/input', 'Input')
  },
  {
    id: 'comp-card',
    name: 'Card - البطاقة',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/card', 'Card')
  },
  {
    id: 'comp-dialog',
    name: 'Dialog - الحوار',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/dialog', 'Dialog')
  },
  {
    id: 'comp-table',
    name: 'Table - الجدول',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/table', 'Table')
  },
  {
    id: 'comp-tabs',
    name: 'Tabs - التبويبات',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/tabs', 'Tabs')
  },
  {
    id: 'comp-select',
    name: 'Select - القائمة المنسدلة',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/select', 'Select')
  },
  {
    id: 'comp-badge',
    name: 'Badge - الشارة',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/badge', 'Badge')
  },
  {
    id: 'comp-skeleton',
    name: 'Skeleton - هيكل التحميل',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/skeleton', 'Skeleton')
  },
  {
    id: 'comp-alert',
    name: 'Alert - التنبيه',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/alert', 'Alert')
  },
  {
    id: 'comp-avatar',
    name: 'Avatar - الصورة الرمزية',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/ui/avatar', 'Avatar')
  },
  {
    id: 'comp-export-button',
    name: 'ExportButton - زر التصدير',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/ExportButton', 'ExportButton')
  },
  {
    id: 'comp-print-button',
    name: 'PrintButton - زر الطباعة',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/PrintButton', 'PrintButton')
  },
  {
    id: 'comp-empty-state-render',
    name: 'EmptyState - الحالة الفارغة',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/EmptyState', 'EmptyState')
  },
  {
    id: 'comp-error-state-render',
    name: 'ErrorState - حالة الخطأ',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/ErrorState', 'ErrorState')
  },
  {
    id: 'comp-loading-skeleton-render',
    name: 'LoadingSkeleton - هيكل التحميل',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/LoadingSkeleton', 'LoadingSkeleton')
  },
  {
    id: 'comp-delete-confirm-dialog',
    name: 'DeleteConfirmDialog - تأكيد الحذف',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/DeleteConfirmDialog', 'DeleteConfirmDialog')
  },
  {
    id: 'comp-responsive-dialog',
    name: 'ResponsiveDialog - الحوار المتجاوب',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/ResponsiveDialog', 'ResponsiveDialog')
  },
  {
    id: 'comp-permission-gate',
    name: 'PermissionGate - بوابة الصلاحيات',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/PermissionGate', 'PermissionGate')
  },
  {
    id: 'comp-global-search',
    name: 'GlobalSearch - البحث الشامل',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/GlobalSearch', 'GlobalSearch')
  },
  {
    id: 'comp-status-badge',
    name: 'StatusBadge - شارة الحالة',
    category: 'components-shared',
    test: async () => testComponentImport('@/components/shared/StatusBadge', 'StatusBadge')
  },
];

// ==================== اختبارات مكونات لوحة التحكم ====================

const dashboardComponentsTests = [
  {
    id: 'comp-dashboard-stats-card',
    name: 'StatsCard - بطاقة الإحصائيات',
    category: 'components-dashboard',
    test: async () => testComponentImport('@/components/dashboard/StatsCard', 'StatsCard')
  },
  {
    id: 'comp-dashboard-kpi-card',
    name: 'KPICard - بطاقة KPI',
    category: 'components-dashboard',
    test: async () => testComponentImport('@/components/dashboard/KPICard', 'KPICard')
  },
  {
    id: 'comp-dashboard-activity-feed',
    name: 'ActivityFeed - تغذية النشاط',
    category: 'components-dashboard',
    test: async () => testComponentImport('@/components/dashboard/ActivityFeed', 'ActivityFeed')
  },
  {
    id: 'comp-dashboard-quick-actions',
    name: 'QuickActions - الإجراءات السريعة',
    category: 'components-dashboard',
    test: async () => testComponentImport('@/components/dashboard/QuickActions', 'QuickActions')
  },
  {
    id: 'comp-dashboard-alerts-panel',
    name: 'AlertsPanel - لوحة التنبيهات',
    category: 'components-dashboard',
    test: async () => testComponentImport('@/components/dashboard/AlertsPanel', 'AlertsPanel')
  },
  {
    id: 'comp-dashboard-chart',
    name: 'DashboardChart - رسم بياني',
    category: 'components-dashboard',
    test: async () => testComponentImport('@/components/dashboard/DashboardChart', 'DashboardChart')
  },
];

// ==================== اختبارات مكونات الذكاء الاصطناعي ====================

const aiComponentsTests = [
  {
    id: 'comp-chatbot-interface',
    name: 'ChatbotInterface - واجهة الدردشة',
    category: 'components-ai',
    test: async () => testComponentImport('@/components/ai/ChatbotInterface', 'ChatbotInterface')
  },
  {
    id: 'comp-ai-insights-card',
    name: 'AIInsightsCard - بطاقة رؤى AI',
    category: 'components-ai',
    test: async () => testComponentImport('@/components/ai/AIInsightsCard', 'AIInsightsCard')
  },
  {
    id: 'comp-intelligent-search',
    name: 'IntelligentSearch - البحث الذكي',
    category: 'components-ai',
    test: async () => testComponentImport('@/components/ai/IntelligentSearch', 'IntelligentSearch')
  },
];

// ==================== اختبارات مكونات المراقبة ====================

const monitoringComponentsTests = [
  {
    id: 'comp-system-health-indicator',
    name: 'SystemHealthIndicator - مؤشر صحة النظام',
    category: 'components-monitoring',
    test: async () => testComponentImport('@/components/monitoring/SystemHealthIndicator', 'SystemHealthIndicator')
  },
  {
    id: 'comp-performance-chart',
    name: 'PerformanceChart - رسم الأداء',
    category: 'components-monitoring',
    test: async () => testComponentImport('@/components/monitoring/PerformanceChart', 'PerformanceChart')
  },
  {
    id: 'comp-error-logs-table',
    name: 'ErrorLogsTable - جدول الأخطاء',
    category: 'components-monitoring',
    test: async () => testComponentImport('@/components/monitoring/ErrorLogsTable', 'ErrorLogsTable')
  },
];

// ==================== اختبارات مكونات Layout ====================

const layoutComponentsTests = [
  {
    id: 'comp-sidebar',
    name: 'Sidebar - الشريط الجانبي',
    category: 'components-layout',
    test: async () => testComponentImport('@/components/layout/Sidebar', 'Sidebar')
  },
  {
    id: 'comp-header',
    name: 'Header - الرأس',
    category: 'components-layout',
    test: async () => testComponentImport('@/components/layout/Header', 'Header')
  },
  {
    id: 'comp-main-layout',
    name: 'MainLayout - التخطيط الرئيسي',
    category: 'components-layout',
    test: async () => testComponentImport('@/components/layout/MainLayout', 'MainLayout')
  },
  {
    id: 'comp-page-header',
    name: 'PageHeader - رأس الصفحة',
    category: 'components-layout',
    test: async () => testComponentImport('@/components/layout/PageHeader', 'PageHeader')
  },
];

// تجميع جميع الاختبارات
export const allComponentsTests = [
  ...accountingComponentsTests,
  ...beneficiaryComponentsTests,
  ...propertyComponentsTests,
  ...governanceComponentsTests,
  ...sharedComponentsTests,
  ...dashboardComponentsTests,
  ...aiComponentsTests,
  ...monitoringComponentsTests,
  ...layoutComponentsTests,
];

// دالة تشغيل اختبارات المكونات
export async function runComponentsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (const test of allComponentsTests) {
    const startTime = performance.now();
    try {
      const result = await test.test();
      results.push({
        id: test.id,
        name: test.name,
        category: test.category,
        status: result.success ? 'passed' : 'failed',
        duration: performance.now() - startTime,
        details: result.details,
        // إضافة معلومات نوع الاختبار
        testType: 'real' as const,
      });
    } catch (error) {
      results.push({
        id: test.id,
        name: test.name,
        category: test.category,
        status: 'failed',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: `❌ فشل في استيراد المكون`,
        testType: 'real' as const,
      });
    }
  }
  
  return results;
}

// إحصائيات الاختبارات
export function getComponentsTestsStats() {
  return {
    total: allComponentsTests.length,
    testType: 'real-import',
    categories: {
      accounting: accountingComponentsTests.length,
      beneficiary: beneficiaryComponentsTests.length,
      property: propertyComponentsTests.length,
      governance: governanceComponentsTests.length,
      shared: sharedComponentsTests.length,
      dashboard: dashboardComponentsTests.length,
      ai: aiComponentsTests.length,
      monitoring: monitoringComponentsTests.length,
      layout: layoutComponentsTests.length,
    }
  };
}

// تصدير دوال مساعدة للاستخدام الخارجي
export { testComponentImport, testComponentsFromFolder };
