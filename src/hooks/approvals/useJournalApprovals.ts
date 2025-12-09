/**
 * useJournalApprovals Hook
 * Hook لموافقات القيود المحاسبية
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { JournalApproval } from "@/types";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useJournalApprovals() {
  return useQuery<JournalApproval[]>({
    queryKey: QUERY_KEYS.JOURNAL_APPROVALS,
    queryFn: () => ApprovalService.getJournalApprovalsWithEntries(),
  });
}
