import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import type { AdminKPI } from "@/types/admin";

export function useAdminKPIs() {
  return useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async (): Promise<AdminKPI> => {
      // استدعاء Database Function المحسّنة (استعلام واحد بدلاً من 8)
      const { data, error } = await supabase.rpc('get_admin_dashboard_kpis');
      
      if (error) {
        console.error('Error fetching admin KPIs:', error);
        throw error;
      }

      const kpisData = data as any;

      // البيانات تأتي جاهزة من قاعدة البيانات
      return {
        totalBeneficiaries: kpisData?.totalBeneficiaries || 0,
        activeBeneficiaries: kpisData?.activeBeneficiaries || 0,
        totalFamilies: kpisData?.totalFamilies || 0,
        totalProperties: kpisData?.totalProperties || 0,
        occupiedProperties: kpisData?.occupiedProperties || 0,
        totalFunds: kpisData?.totalFunds || 0,
        activeFunds: kpisData?.activeFunds || 0,
        pendingRequests: kpisData?.pendingRequests || 0,
        overdueRequests: kpisData?.overdueRequests || 0,
        totalRevenue: Number(kpisData?.totalRevenue || 0),
        totalExpenses: Number(kpisData?.totalExpenses || 0),
        netIncome: Number(kpisData?.netIncome || 0),
      };
    },
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });
}
