import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardKPIs {
  beneficiaries: number;
  properties: number;
  totalPayments: number;
  activeContracts: number;
}

export function useDashboardKPIs() {
  return useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}
