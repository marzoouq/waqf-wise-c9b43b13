import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services";
import { ContractService } from "@/services";

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
    queryKey: ["properties-for-beneficiary"],
    queryFn: () => PropertyService.getAll(),
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts-for-beneficiary", isCurrentYearPublished],
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
