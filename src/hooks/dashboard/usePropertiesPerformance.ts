/**
 * usePropertiesPerformance Hook
 * Hook لجلب بيانات أداء العقارات
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardService } from "@/services/dashboard.service";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyPerformance } from "@/types/dashboard";

export function usePropertiesPerformance() {
  const queryClient = useQueryClient();

  const query = useQuery<PropertyPerformance[]>({
    queryKey: ["properties-performance"],
    queryFn: () => DashboardService.getPropertiesPerformance(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('properties-performance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ["properties-performance"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        queryClient.invalidateQueries({ queryKey: ["properties-performance"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
