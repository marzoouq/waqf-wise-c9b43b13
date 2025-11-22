import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import type { AdminKPI } from "@/types/admin";
import { parseAdminKPIsResponse } from "@/types/database-responses";

export function useAdminKPIs() {
  return useQuery({
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
}
