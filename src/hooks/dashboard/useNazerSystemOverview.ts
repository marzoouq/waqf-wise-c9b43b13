/**
 * Hook لجلب إحصائيات النظام الشاملة للناظر
 * يستخدم DashboardService كطبقة خدمة
 * 
 * @version 2.6.36
 */
import { useQuery } from "@tanstack/react-query";
import { DashboardService, type SystemOverviewStats } from "@/services";
import { QUERY_STALE_TIME } from "@/lib/constants";

export type { SystemOverviewStats };

export function useNazerSystemOverview() {
  return useQuery({
    queryKey: ["nazer-system-overview"],
    queryFn: () => DashboardService.getSystemOverview(),
    staleTime: QUERY_STALE_TIME.DASHBOARD,
  });
}
