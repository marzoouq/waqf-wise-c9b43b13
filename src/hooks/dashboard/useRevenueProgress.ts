/**
 * useRevenueProgress Hook
 * نقل منطق حساب تقدم الإيرادات إلى Hook
 * يستخدم DashboardService
 */

import { useQuery } from "@tanstack/react-query";
import { useActiveFiscalYear } from "@/hooks/fiscal-years";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { DashboardService } from "@/services";

export interface RevenueProgressData {
  totalCollected: number;
  netRevenue: number;
  totalTax: number;
  expectedRevenue: number;
  progress: number;
}

export function useRevenueProgress() {
  const { activeFiscalYear, isLoading: fiscalYearLoading } = useActiveFiscalYear();

  const query = useQuery({
    queryKey: ["revenue-progress", activeFiscalYear?.id],
    queryFn: async (): Promise<RevenueProgressData | null> => {
      if (!activeFiscalYear) return null;
      return DashboardService.getRevenueProgress(activeFiscalYear);
    },
    enabled: !!activeFiscalYear,
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  return {
    data: query.data,
    isLoading: query.isLoading || fiscalYearLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
