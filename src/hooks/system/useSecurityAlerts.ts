import { useQuery } from "@tanstack/react-query";
import { SystemService, type SecurityAlert } from "@/services/system.service";

export type { SecurityAlert };

export function useSecurityAlerts() {
  return useQuery({
    queryKey: ["security-alerts"],
    queryFn: (): Promise<SecurityAlert[]> => SystemService.getSecurityAlerts(),
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
  });
}
