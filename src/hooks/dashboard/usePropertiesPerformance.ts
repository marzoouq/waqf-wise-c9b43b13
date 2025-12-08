/**
 * usePropertiesPerformance Hook
 * Hook لجلب بيانات أداء العقارات
 * يستخدم DashboardService + RealtimeService
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardService, RealtimeService } from "@/services";
import type { PropertyPerformance } from "@/types/dashboard";

export function usePropertiesPerformance() {
  const queryClient = useQueryClient();

  const query = useQuery<PropertyPerformance[]>({
    queryKey: ["properties-performance"],
    queryFn: () => DashboardService.getPropertiesPerformance(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const subscription = RealtimeService.subscribeToChanges(
      ['rental_payments', 'contracts'],
      () => { queryClient.invalidateQueries({ queryKey: ["properties-performance"] }); }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return query;
}
