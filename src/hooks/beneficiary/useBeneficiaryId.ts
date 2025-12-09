/**
 * useBeneficiaryId Hook - جلب beneficiary_id للمستخدم الحالي
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaryId() {
  const { user } = useAuth();

  const { data: beneficiaryId, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_ID(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      return BeneficiaryService.getBeneficiaryIdByUserId(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  return { beneficiaryId, isLoading, error, hasId: !!beneficiaryId };
}
