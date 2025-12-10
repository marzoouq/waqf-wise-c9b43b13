/**
 * useSelfHealingStats Hook
 * إحصائيات نظام الإصلاح الذاتي
 * @version 2.8.65
 */

import { useQuery } from "@tanstack/react-query";
import { SystemService } from "@/services";

interface SelfHealingStats {
  retrySuccessRate: number;
  systemHealth: number;
  totalErrors: number;
  resolvedErrors: number;
  activeAlerts: number;
}

export function useSelfHealingStats() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['self-healing-stats'],
    queryFn: async (): Promise<SelfHealingStats> => {
      const healthStats = await SystemService.getHealthStats();
      
      return {
        retrySuccessRate: healthStats.fixSuccessRate,
        systemHealth: healthStats.healthScore,
        totalErrors: healthStats.totalErrors,
        resolvedErrors: healthStats.resolvedErrors,
        activeAlerts: healthStats.activeAlerts,
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: false,
  });

  return {
    stats,
    isLoading,
    refetch,
  };
}
