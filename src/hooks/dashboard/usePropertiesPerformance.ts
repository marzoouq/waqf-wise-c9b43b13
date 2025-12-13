/**
 * usePropertiesPerformance Hook
 * Hook لجلب بيانات أداء العقارات
 * يستخدم DashboardService + RealtimeService
 * @version 2.9.2
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardService, RealtimeService } from "@/services";
import type { PropertyPerformance } from "@/types/dashboard";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function usePropertiesPerformance() {
  const queryClient = useQueryClient();

  const query = useQuery<PropertyPerformance[]>({
    queryKey: QUERY_KEYS.PROPERTIES_PERFORMANCE,
    queryFn: () => DashboardService.getPropertiesPerformance(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  useEffect(() => {
    const subscription = RealtimeService.subscribeToChanges(
      ['rental_payments', 'contracts'],
      () => { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES_PERFORMANCE }); }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return query;
}
