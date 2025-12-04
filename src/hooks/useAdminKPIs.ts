import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import type { AdminKPI } from "@/types/admin";
import { parseAdminKPIsResponse } from "@/types/database-responses";
import { useEffect } from "react";

export function useAdminKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async (): Promise<AdminKPI> => {
      // استدعاء Database Function المحسّنة (استعلام واحد بدلاً من 8)
      const { data, error } = await supabase.rpc('get_admin_dashboard_kpis');
      
      if (error) throw error;

      // تحليل البيانات بشكل آمن مع type safety
      const kpisData = parseAdminKPIsResponse(data);

      return {
        totalBeneficiaries: kpisData.totalBeneficiaries,
        activeBeneficiaries: kpisData.activeBeneficiaries,
        totalFamilies: kpisData.totalFamilies,
        totalProperties: kpisData.totalProperties,
        occupiedProperties: kpisData.occupiedProperties,
        totalFunds: kpisData.totalFunds,
        activeFunds: kpisData.activeFunds,
        pendingRequests: kpisData.pendingRequests,
        overdueRequests: kpisData.overdueRequests,
        totalRevenue: kpisData.totalRevenue,
        totalExpenses: kpisData.totalExpenses,
        netIncome: kpisData.netIncome,
      };
    },
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-kpis-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiary_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["admin-kpis"] }),
  };
}
