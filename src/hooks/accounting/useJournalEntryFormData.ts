/**
 * Journal Entry Form Data Hook
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService, FiscalYearService } from "@/services";

export function useJournalEntryAccounts() {
  return useQuery({
    queryKey: ["journal-entry-accounts"],
    queryFn: () => AccountingService.getActiveAccountsForJournalEntry(),
  });
}

export function useActiveFiscalYears() {
  return useQuery({
    queryKey: ["active-fiscal-years"],
    queryFn: () => FiscalYearService.getActiveFiscalYears(),
  });
}
