/**
 * Dashboard Hooks - خطافات لوحات التحكم
 * @version 2.8.78
 */

// ==================== Core Dashboard Hooks ====================
export { useDashboardConfigs, useSaveDashboardConfig, useUpdateDashboardConfig, useDeleteDashboardConfig, type DashboardConfig, type DashboardWidget } from './useDashboardConfig';
export { useDashboardKPIs, type DashboardKPIs } from './useDashboardKPIs';
export { useKPIs, type KPI } from './useKPIs';
export { useUnifiedKPIs, type UnifiedKPIsData } from './useUnifiedKPIs';
export { useNazerSystemOverview, type SystemOverviewStats } from './useNazerSystemOverview';

// ==================== Role-Specific Dashboard Hooks ====================
// Note: useNazerKPIs removed - use useUnifiedKPIs directly
export { useCashierStats } from './useCashierStats';
export { useRevenueProgress, type RevenueProgressData } from './useRevenueProgress';

// ==================== Realtime Dashboard Hooks ====================
export { useNazerDashboardRealtime, useNazerDashboardRefresh } from './useNazerDashboardRealtime';
export { useAdminDashboardRealtime, useAdminDashboardRefresh } from './useAdminDashboardRealtime';
export { useCashierDashboardRealtime, useCashierDashboardRefresh } from './useCashierDashboardRealtime';
export { useAccountantDashboardRealtime, useAccountantDashboardRefresh } from './useAccountantDashboardRealtime';
export { useBeneficiaryDashboardRealtime, useBeneficiaryDashboardRefresh } from './useBeneficiaryDashboardRealtime';

// ==================== Dashboard Data Hooks ====================
export { useRecentJournalEntries } from './useRecentJournalEntries';
export { useVouchersStats, type VouchersStats } from './useVouchersStats';
export { usePropertyRevenueStats, type RentalPaymentWithContract } from './usePropertyRevenueStats';
export { usePropertiesPerformance } from './usePropertiesPerformance';
export { useRevenueDistribution } from './useRevenueDistribution';
export { useAccountDistribution } from './useAccountDistribution';

// ==================== Re-exports from other folders ====================
// useAdminKPIs removed - use useUnifiedKPIs directly
export { useAccountantKPIs } from '../accounting';
export { useArchivistDashboard, useArchivistStats, useRecentDocuments } from '../archive/useArchivistDashboard';
export { useInteractiveDashboard } from './useInteractiveDashboard';

// ==================== Dashboard Charts Hooks ====================
export { useBudgetComparison, useRevenueExpenseChart } from './useDashboardCharts';

// ==================== Financial Cards Hooks ====================
export { useBankBalance, useWaqfCorpus, type FiscalYearCorpus } from './useFinancialCards';
