/**
 * useRecentJournalEntries Hook
 * Hook لجلب آخر القيود المحاسبية
 * @version 2.9.2
 */
import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export function useRecentJournalEntries(limit: number = 5) {
  return useQuery({
    queryKey: QUERY_KEYS.RECENT_JOURNAL_ENTRIES(limit),
    queryFn: () => AccountingService.getRecentJournalEntries(limit),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
