import { useQuery } from "@tanstack/react-query";
import { SystemService, type SystemHealth } from "@/services/system.service";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_HEALTH,
    queryFn: (): Promise<SystemHealth> => SystemService.getSystemHealth(),
    refetchInterval: 5 * 60 * 1000,
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
