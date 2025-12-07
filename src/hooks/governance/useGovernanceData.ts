import { useQuery } from "@tanstack/react-query";

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
