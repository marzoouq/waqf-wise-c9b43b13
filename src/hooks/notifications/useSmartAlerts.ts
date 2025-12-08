import { useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { MonitoringService, type SmartAlert } from "@/services";

export type { SmartAlert };

export function useSmartAlerts() {
  return useQuery({
    queryKey: ["smart-alerts"],
    queryFn: () => MonitoringService.getSmartAlerts(),
    ...QUERY_CONFIG.ALERTS,
  });
}
