/**
 * Hook لإدارة تنبيهات النظام
 * Admin Alerts Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('id, alert_type, severity, title, description, status, created_at, acknowledged_at, resolved_at')
        .in('status', ['active', 'acknowledged'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as SystemAlert[];
    },
    staleTime: 60 * 1000,
    refetchInterval: false,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('system_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      toast.success('تم الاعتراف بالتنبيه');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('system_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      toast.success('تم حل التنبيه');
    },
  });

  // تجميع التنبيهات
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged');

  return {
    alerts,
    activeAlerts,
    acknowledgedAlerts,
    isLoading,
    refetch,
    acknowledge: acknowledgeMutation.mutate,
    resolve: resolveMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
}
