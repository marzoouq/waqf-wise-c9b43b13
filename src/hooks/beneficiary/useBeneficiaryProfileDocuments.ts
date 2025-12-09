/**
 * Hook for beneficiary profile documents
 * نقل منطق البيانات من ProfileDocumentsGallery component
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useBeneficiaryProfileDocuments(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_DOCUMENTS(beneficiaryId),
    queryFn: () => BeneficiaryService.getDocuments(beneficiaryId),
    enabled: !!beneficiaryId,
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
