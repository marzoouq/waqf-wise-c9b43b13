/**
 * System Health Live Stats Hook
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { SystemService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface SystemHealthStats {
  totalErrors: number;
  newErrors: number;
  criticalErrors: number;
  highErrors: number;
  resolvedErrors: number;
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  resolvedAlerts: number;
  resolutionRate: number;
  healthScore: number;
  fixSuccessRate: number;
  successfulFixes: number;
  failedFixes: number;
}

export function useSystemHealthLive() {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_HEALTH_LIVE,
    queryFn: async (): Promise<SystemHealthStats> => {
      return SystemService.getHealthStats();
    },
  });
}
