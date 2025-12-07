import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_CONFIG } from '@/lib/queryOptimization';
import { useEffect } from 'react';

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
    queryFn: async () => {
      const [
        beneficiariesCount,
        propertiesCount,
        totalPayments,
        activeContracts
      ] = await Promise.all([
        supabase
          .from('beneficiaries')
          .select('id', { count: 'exact', head: true }),
        
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true }),
        
        supabase
          .from('payments')
          .select('amount')
          .limit(1000)
          .then(res => {
            if (res.error) throw res.error;
            return res.data.reduce((sum, p) => sum + Number(p.amount), 0);
          }),
        
        supabase
          .from('contracts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'نشط'),
      ]);

      return {
        beneficiaries: beneficiariesCount.count || 0,
        properties: propertiesCount.count || 0,
        totalPayments,
        activeContracts: activeContracts.count || 0,
      } as DashboardKPIs;
    },
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
