import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaryActivity(beneficiaryId: string) {
  const { data: activities = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_ACTIVITY_LOG(beneficiaryId),
    queryFn: () => BeneficiaryService.getActivity(beneficiaryId),
    enabled: !!beneficiaryId,
  });

  return {
    activities,
    isLoading,
    error,
    refetch,
  };
}
