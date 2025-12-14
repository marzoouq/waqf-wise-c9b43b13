import { useQuery } from "@tanstack/react-query";
import { DistributionDetail } from "@/types/distributions";
import { FundService } from "@/services/fund.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useDistributionDetails(distributionId?: string) {
  const { data: details = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.DISTRIBUTION_DETAILS(distributionId || ''),
    queryFn: () => FundService.getDistributionDetails(distributionId!),
    enabled: !!distributionId,
  });

  return {
    details: details as DistributionDetail[],
    isLoading,
  };
}
