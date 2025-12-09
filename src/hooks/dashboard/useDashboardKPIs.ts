/**
 * Dashboard KPIs Hook - خطاف مؤشرات الأداء
 * @version 2.8.42
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_CONFIG } from '@/lib/queryOptimization';
import { useEffect } from 'react';
import { DashboardService } from '@/services';

export interface DashboardKPIs {
  beneficiaries: number;
  properties: number;
  totalPayments: number;
  activeContracts: number;
}

export function useDashboardKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => DashboardService.getDashboardKPIs(),
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-kpis-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] }),
  };
}
