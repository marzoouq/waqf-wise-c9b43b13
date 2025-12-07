/**
 * Dashboard Hooks - خطافات لوحات التحكم
 */

export { useDashboardConfigs } from '../useDashboardConfig';
export { useDashboardKPIs } from '../useDashboardKPIs';
export { useKPIs } from '../useKPIs';
export { useNazerKPIs } from '../useNazerKPIs';
export { useAccountantKPIs } from '../accounting';
export { useAdminKPIs } from '../useAdminKPIs';
export { useCashierStats } from '../useCashierStats';
export { useArchivistDashboard } from '../useArchivistDashboard';

// الـ Hooks الجديدة الموحدة
export { useNazerDashboardRealtime, useNazerDashboardRefresh } from './useNazerDashboardRealtime';
export { useAdminDashboardRealtime, useAdminDashboardRefresh } from './useAdminDashboardRealtime';
export { useRevenueProgress, type RevenueProgressData } from './useRevenueProgress';
