/**
 * Dashboard Hooks - خطافات لوحات التحكم
 * @version 2.6.32
 */

export { useDashboardConfigs } from '../useDashboardConfig';
export { useDashboardKPIs } from '../useDashboardKPIs';
export { useKPIs } from '../useKPIs';
export { useAccountantKPIs } from '../accounting';

// Hooks نُقلت إلى مجلداتها الصحيحة
export { useNazerKPIs, type NazerKPIData } from './useNazerKPIs';
export { useAdminKPIs } from '../admin/useAdminKPIs';
export { useCashierStats } from './useCashierStats';
export { useArchivistDashboard, useArchivistStats, useRecentDocuments } from '../archive/useArchivistDashboard';

// الـ Hooks الموحدة للـ Realtime
export { useNazerDashboardRealtime, useNazerDashboardRefresh } from './useNazerDashboardRealtime';
export { useAdminDashboardRealtime, useAdminDashboardRefresh } from './useAdminDashboardRealtime';
export { useRevenueProgress, type RevenueProgressData } from './useRevenueProgress';
