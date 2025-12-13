/**
 * Governance Data Hooks - خطافات بيانات الحوكمة
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { GovernanceService } from "@/services";
import type { EligibleVoter, GovernanceDecisionInput } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";

// ==================== Legacy Hook ====================
export function useGovernanceData() {
  // Tables don't exist yet - return empty data
  return {
    meetings: [],
    decisions: [],
    auditReports: [],
    isLoading: false,
    hasMeetings: false,
    hasDecisions: false,
    hasAuditReports: false,
  };
}

// ==================== Eligible Voters Hook ====================
export function useEligibleVoters(decision: GovernanceDecisionInput) {
  return useQuery({
    queryKey: QUERY_KEYS.ELIGIBLE_VOTERS(decision.id || ''),
    queryFn: () => GovernanceService.getEligibleVoters(decision),
    enabled: !!decision.id,
  });
}

// ==================== Recent Governance Decisions Hook ====================
export function useRecentGovernanceDecisions() {
  return useQuery({
    queryKey: QUERY_KEYS.RECENT_GOVERNANCE_DECISIONS,
    queryFn: () => GovernanceService.getRecentDecisions(),
  });
}

export type { EligibleVoter, GovernanceDecisionInput };
