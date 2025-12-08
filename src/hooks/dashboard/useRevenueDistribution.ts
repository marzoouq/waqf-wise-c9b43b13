/**
 * useRevenueDistribution Hook
 * Hook لجلب بيانات توزيع الإيرادات
 * يستخدم DashboardService + RealtimeService
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardService, RealtimeService } from "@/services";
import type { RevenueDistribution } from "@/types/dashboard";

export function useRevenueDistribution() {
  const queryClient = useQueryClient();

  const query = useQuery<RevenueDistribution[]>({
    queryKey: ["revenue-distribution"],
    queryFn: () => DashboardService.getRevenueDistribution(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'journal_entry_lines',
      () => { queryClient.invalidateQueries({ queryKey: ["revenue-distribution"] }); }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return query;
}
