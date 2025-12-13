import { useQuery } from "@tanstack/react-query";
import { SystemService, type SecurityAlert } from "@/services/system.service";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export type { SecurityAlert };

export function useSecurityAlerts() {
  return useQuery({
    queryKey: QUERY_KEYS.SECURITY_ALERTS,
    queryFn: (): Promise<SecurityAlert[]> => SystemService.getSecurityAlerts(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
    refetchOnWindowFocus: QUERY_CONFIG.DEFAULT.refetchOnWindowFocus,
  });
}
