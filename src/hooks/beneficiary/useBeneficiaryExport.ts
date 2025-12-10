/**
 * Beneficiary Export Hook
 * @version 2.8.65
 */

import { AccountingService } from "@/services";

export interface JournalExportEntry {
  entry_date: string;
  description: string | null;
  journal_entry_lines: Array<{
    debit_amount?: number;
    credit_amount?: number;
    accounts?: { name_ar: string; code: string } | null;
  }> | null;
}

export function useBeneficiaryExport() {
  const exportJournalEntries = async () => {
    const transactions = await AccountingService.getJournalEntriesWithLines();
    return transactions as JournalExportEntry[];
  };

  return { exportJournalEntries };
}
