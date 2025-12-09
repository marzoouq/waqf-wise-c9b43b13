/**
 * Journal Entry Form Data Hook
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService, FiscalYearService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useJournalEntryAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL_ENTRY_ACCOUNTS,
    queryFn: () => AccountingService.getActiveAccountsForJournalEntry(),
  });
}

export function useActiveFiscalYears() {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVE_FISCAL_YEARS,
    queryFn: () => FiscalYearService.getActiveFiscalYears(),
  });
}
