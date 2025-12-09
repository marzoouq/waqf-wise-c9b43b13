import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services";
import { ContractService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ContractWithProperty {
  id: string;
  contract_number: string;
  tenant_name: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  status: string;
  properties?: {
    name: string;
    type: string;
    location: string;
  } | null;
}

export function useBeneficiaryProperties(isCurrentYearPublished: boolean, publishStatusLoading: boolean) {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: QUERY_KEYS.PROPERTIES_FOR_BENEFICIARY,
    queryFn: () => PropertyService.getAll(),
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: QUERY_KEYS.CONTRACTS_FOR_BENEFICIARY(isCurrentYearPublished),
    queryFn: async (): Promise<ContractWithProperty[]> => {
      if (!isCurrentYearPublished) {
        return [];
      }
      return ContractService.getActiveWithProperties();
    },
    enabled: !publishStatusLoading,
  });

  return {
    properties,
    contracts,
    isLoading: propertiesLoading || contractsLoading,
  };
}
