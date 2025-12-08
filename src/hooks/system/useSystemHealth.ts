import { useQuery } from "@tanstack/react-query";
import { SystemService, type SystemHealth } from "@/services/system.service";

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: (): Promise<SystemHealth> => SystemService.getSystemHealth(),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
