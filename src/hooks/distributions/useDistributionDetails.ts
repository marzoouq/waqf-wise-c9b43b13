import { useQuery } from "@tanstack/react-query";
import { DistributionDetail } from "@/types/distributions";
import { FundService } from "@/services/fund.service";

export function useDistributionDetails(distributionId?: string) {
  const { data: details = [], isLoading } = useQuery({
    queryKey: ["distribution-details", distributionId],
    queryFn: () => FundService.getDistributionDetails(distributionId!),
    enabled: !!distributionId,
  });

  return {
    details: details as DistributionDetail[],
    isLoading,
  };
}
