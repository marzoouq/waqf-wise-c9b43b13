/**
 * Hook for DecisionDetails data fetching
 * يجلب تفاصيل قرار حوكمي محدد
 */

import { useQuery } from "@tanstack/react-query";
import { GovernanceService } from "@/services/governance.service";

export function useGovernanceDecisionDetails(decisionId: string | undefined) {
  const {
    data: decision,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["governance-decision", decisionId],
    queryFn: () => GovernanceService.getDecisionById(decisionId!),
    enabled: !!decisionId,
  });

  return {
    decision,
    isLoading,
    error,
  };
}
