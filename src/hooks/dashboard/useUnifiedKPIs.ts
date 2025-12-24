/**
 * Hook موحد لمؤشرات الأداء الرئيسية
 * يستخدم DashboardService كطبقة خدمة
 * 
 * @version 2.6.36
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { useCallback } from "react";
import { DashboardService, type UnifiedKPIsData } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { UnifiedKPIsData };

export function useUnifiedKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.UNIFIED_KPIS,
    queryFn: () => DashboardService.getUnifiedKPIs(),
    ...QUERY_CONFIG.DASHBOARD_KPIS
  });

  // ملاحظة: الاشتراك في التحديثات المباشرة يتم عبر hooks موحدة لكل dashboard
  // مثل useAdminDashboardRealtime, useNazerDashboardRealtime
  // لتجنب تكرار الاشتراكات

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNIFIED_KPIS });
  }, [queryClient]);

  return {
    ...query,
    refresh,
    lastUpdated: query.data?.lastUpdated
  };
}
