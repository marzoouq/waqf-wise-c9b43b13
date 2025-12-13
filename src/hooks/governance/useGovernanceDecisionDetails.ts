/**
 * Hook for DecisionDetails data fetching
 * يجلب تفاصيل قرار حوكمي محدد
 */

import { useQuery } from "@tanstack/react-query";
import { GovernanceService } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useGovernanceDecisionDetails(decisionId: string | undefined) {
  const {
    data: decision,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_DECISION(decisionId!),
    queryFn: () => GovernanceService.getDecisionById(decisionId!),
    enabled: !!decisionId,
  });

  return {
    decision,
    isLoading,
    error,
  };
}
