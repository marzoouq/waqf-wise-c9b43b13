/**
 * useRevenueDistribution Hook
 * Hook لجلب بيانات توزيع الإيرادات
 * يستخدم DashboardService + RealtimeService
 * @version 2.9.2
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardService, RealtimeService } from "@/services";
import type { RevenueDistribution } from "@/types/dashboard";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useRevenueDistribution() {
  const queryClient = useQueryClient();

  const query = useQuery<RevenueDistribution[]>({
    queryKey: QUERY_KEYS.REVENUE_DISTRIBUTION,
    queryFn: () => DashboardService.getRevenueDistribution(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'journal_entry_lines',
      () => { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVENUE_DISTRIBUTION }); }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return query;
}
