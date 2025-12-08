/**
 * useTenantContracts Hook
 * Hook لجلب عقود المستأجر
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantContract {
  id: string;
  contract_number: string;
  property_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
  payment_frequency: string;
  properties: {
    name: string;
  };
}

export function useTenantContracts(tenantId: string) {
  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['tenant-contracts', tenantId],
    queryFn: async (): Promise<TenantContract[]> => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          contract_number,
          property_id,
          start_date,
          end_date,
          monthly_rent,
          status,
          payment_frequency,
          properties!inner (name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(contract => ({
        id: contract.id,
        contract_number: contract.contract_number,
        property_id: contract.property_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        status: contract.status,
        payment_frequency: contract.payment_frequency || 'شهري',
        properties: contract.properties as unknown as { name: string },
      }));
    },
    enabled: !!tenantId,
  });

  return {
    contracts,
    isLoading,
    error,
  };
}
