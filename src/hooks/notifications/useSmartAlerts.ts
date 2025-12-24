import { useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { MonitoringService, type SmartAlert } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { SmartAlert };

export function useSmartAlerts() {
  return useQuery({
    queryKey: QUERY_KEYS.SMART_ALERTS,
    queryFn: () => MonitoringService.getSmartAlerts(),
    ...QUERY_CONFIG.ALERTS,
  });
}
