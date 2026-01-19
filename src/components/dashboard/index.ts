/**
 * Dashboard Components Index
 * تم تحديثه بتاريخ 2025-12-03
 * 
 * الهيكل الموحد:
 * - UnifiedDashboardLayout: Layout موحد لجميع لوحات التحكم
 * - Skeletons: مكونات التحميل
 * - Charts: الرسوم البيانية المشتركة
 * - Stats: مكونات الإحصائيات
 */

// ============= Unified Layout =============
export { UnifiedDashboardLayout } from './UnifiedDashboardLayout';

// ============= Unified Components =============
export { UnifiedKPICard } from '../unified/UnifiedKPICard';
export { UnifiedTabsSection } from './UnifiedTabsSection';

// ============= Skeletons =============
export { SectionSkeleton } from './SectionSkeleton';
export { ChartSkeleton } from './ChartSkeleton';
export { KPISkeleton } from './KPISkeleton';

// ============= Dashboard Tabs =============
export { DashboardTabs } from './DashboardTabs';

// ============= Stats Components =============
export { default as FinancialStats } from './FinancialStats';
export { default as AccountingStats } from './AccountingStats';
export { default as FamiliesStats } from './FamiliesStats';
export { default as RequestsStats } from './RequestsStats';
// Note: StatCard is deprecated - use UnifiedKPICard from @/components/unified/UnifiedKPICard instead

// ============= Chart Components =============
export { default as RevenueExpenseChart } from './RevenueExpenseChart';
export { default as AccountDistributionChart } from './AccountDistributionChart';
export { default as BudgetComparisonChart } from './BudgetComparisonChart';
export { default as RecentJournalEntries } from './RecentJournalEntries';

// ============= Widget Components =============
export { AIInsightsWidget } from './AIInsightsWidget';
export { ChatbotQuickCard } from './ChatbotQuickCard';
export { IntegratedReportsWidget } from './IntegratedReportsWidget';
export { ExpiringContractsCard } from './ExpiringContractsCard';
export { PropertyStatsCard } from './PropertyStatsCard';
export { VouchersStatsCard } from './VouchersStatsCard';

// ============= Dialog Components =============
export { DashboardDialogs } from './DashboardDialogs';
