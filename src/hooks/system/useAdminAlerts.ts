/**
 * Hook لإدارة تنبيهات النظام
 * Admin Alerts Hook
 * @version 2.8.54
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SystemService } from '@/services/system.service';
import { QUERY_KEYS } from '@/lib/query-keys';
import { toast } from 'sonner';

export interface SystemAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: string;
  created_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

export function useAdminAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, refetch, error } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_ALERTS,
    queryFn: () => SystemService.getAdminAlerts(),
    staleTime: 60 * 1000,
    refetchInterval: false,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => SystemService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ALERTS });
      toast.success('تم الاعتراف بالتنبيه');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => SystemService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ALERTS });
      toast.success('تم حل التنبيه');
    },
  });

  // تجميع التنبيهات
  const activeAlerts = alerts.filter((a: SystemAlert) => a.status === 'active');
  const acknowledgedAlerts = alerts.filter((a: SystemAlert) => a.status === 'acknowledged');

  return {
    alerts: alerts as SystemAlert[],
    activeAlerts,
    acknowledgedAlerts,
    isLoading,
    refetch,
    error,
    acknowledge: acknowledgeMutation.mutate,
    resolve: resolveMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
}
