/**
 * Dashboard Hooks - خطافات لوحات التحكم
 * @version 2.6.36
 */

// ==================== Core Dashboard Hooks ====================
export { useDashboardConfigs, useSaveDashboardConfig, useUpdateDashboardConfig, useDeleteDashboardConfig, type DashboardConfig, type DashboardWidget } from './useDashboardConfig';
export { useDashboardKPIs, type DashboardKPIs } from './useDashboardKPIs';
export { useKPIs, type KPI } from './useKPIs';
export { useUnifiedKPIs, type UnifiedKPIsData } from './useUnifiedKPIs';
export { useNazerSystemOverview, type SystemOverviewStats } from './useNazerSystemOverview';

// ==================== Role-Specific Dashboard Hooks ====================
export { useNazerKPIs, type NazerKPIData } from './useNazerKPIs';
export { useCashierStats } from './useCashierStats';
export { useRevenueProgress, type RevenueProgressData } from './useRevenueProgress';

// ==================== Realtime Dashboard Hooks ====================
export { useNazerDashboardRealtime, useNazerDashboardRefresh } from './useNazerDashboardRealtime';
export { useAdminDashboardRealtime, useAdminDashboardRefresh } from './useAdminDashboardRealtime';
export { useCashierDashboardRealtime, useCashierDashboardRefresh } from './useCashierDashboardRealtime';

// ==================== Re-exports from other folders ====================
export { useAdminKPIs } from '../admin/useAdminKPIs';
export { useAccountantKPIs } from '../accounting';
export { useArchivistDashboard, useArchivistStats, useRecentDocuments } from '../archive/useArchivistDashboard';
