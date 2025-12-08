/**
 * useJournalApprovals Hook
 * Hook لموافقات القيود المحاسبية
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { JournalApproval } from "@/types";

export function useJournalApprovals() {
  return useQuery<JournalApproval[]>({
    queryKey: ["journal_approvals"],
    queryFn: () => ApprovalService.getJournalApprovalsWithEntries(),
  });
}
