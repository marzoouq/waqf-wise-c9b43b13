import { useQuery } from "@tanstack/react-query";
import { DistributionService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { HeirDistribution } from "@/types/distributions";

export function useBeneficiaryDistributions(beneficiaryId: string) {
  const { data: distributions = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_HEIR_DISTRIBUTIONS(beneficiaryId),
    queryFn: async () => {
      const data = await DistributionService.getHeirDistributions(beneficiaryId);
      return (data || []) as HeirDistribution[];
    },
    enabled: !!beneficiaryId,
  });

  const currentDistributions = distributions.filter((d: HeirDistribution) => !d.fiscal_years?.is_closed);
  const historicalDistributions = distributions.filter((d: HeirDistribution) => d.fiscal_years?.is_closed);
  
  const currentTotal = currentDistributions.reduce((sum: number, d: HeirDistribution) => sum + (d.share_amount || 0), 0);
  const historicalTotal = historicalDistributions.reduce((sum: number, d: HeirDistribution) => sum + (d.share_amount || 0), 0);
  const totalDistributed = currentTotal + historicalTotal;

  return {
    distributions,
    currentDistributions,
    historicalDistributions,
    currentTotal,
    historicalTotal,
    totalDistributed,
    isLoading,
  };
}
