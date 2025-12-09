/**
 * Hook for beneficiary profile payments history
 * نقل منطق البيانات من ProfilePaymentsHistory component
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useBeneficiaryProfilePayments(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_PROFILE_PAYMENTS(beneficiaryId),
    queryFn: () => BeneficiaryService.getPaymentsHistory(beneficiaryId),
    enabled: !!beneficiaryId,
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
