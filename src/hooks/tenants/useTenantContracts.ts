/**
 * useTenantContracts Hook
 * Hook لجلب عقود المستأجر
 * @version 2.8.56
 */
import { useQuery } from '@tanstack/react-query';
import { TenantService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';

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
    queryFn: () => TenantService.getContractsDetailed(tenantId) as Promise<TenantContract[]>,
    enabled: !!tenantId,
  });

  return {
    contracts,
    isLoading,
    error,
  };
}
