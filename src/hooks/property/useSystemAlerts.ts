/**
 * Hook for system alerts
 * نقل منطق البيانات من AlertsPanel component
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useSystemAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.SYSTEM_ALERTS,
    queryFn: () => NotificationService.getSystemAlerts(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
    refetchInterval: false,
  });

  const resolveAlert = async (alertId: string) => {
    try {
      await NotificationService.resolveAlert(alertId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_ALERTS });
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  const criticalAlerts = alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  );

  return {
    alerts,
    criticalAlerts,
    isLoading,
    resolveAlert,
  };
}
