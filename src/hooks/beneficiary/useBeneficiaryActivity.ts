import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";

export function useBeneficiaryActivity(beneficiaryId: string) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["beneficiary-activity", beneficiaryId],
    queryFn: () => BeneficiaryService.getActivity(beneficiaryId),
    enabled: !!beneficiaryId,
  });

  return {
    activities,
    isLoading,
  };
}
