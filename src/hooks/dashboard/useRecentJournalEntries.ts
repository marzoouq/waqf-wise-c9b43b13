/**
 * useRecentJournalEntries Hook
 * Hook لجلب آخر القيود المحاسبية
 */
import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";

export function useRecentJournalEntries(limit: number = 5) {
  return useQuery({
    queryKey: ["recent_journal_entries", limit],
    queryFn: () => AccountingService.getRecentJournalEntries(limit),
    staleTime: 2 * 60 * 1000,
  });
}
