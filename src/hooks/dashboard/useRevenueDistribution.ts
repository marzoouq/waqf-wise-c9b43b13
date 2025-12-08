/**
 * useRevenueDistribution Hook
 * Hook لجلب بيانات توزيع الإيرادات
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DashboardService } from "@/services/dashboard.service";
import { supabase } from "@/integrations/supabase/client";
import type { RevenueDistribution } from "@/types/dashboard";

export function useRevenueDistribution() {
  const queryClient = useQueryClient();

  const query = useQuery<RevenueDistribution[]>({
    queryKey: ["revenue-distribution"],
    queryFn: () => DashboardService.getRevenueDistribution(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('revenue-distribution')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entry_lines' }, () => {
        queryClient.invalidateQueries({ queryKey: ["revenue-distribution"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
