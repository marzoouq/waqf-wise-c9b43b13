/**
 * Beneficiary Export Hook
 * @version 2.8.40
 */

import { supabase } from "@/integrations/supabase/client";

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
    const { data: transactions, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines(
          *,
          accounts(name_ar, code)
        )
      `)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return transactions as JournalExportEntry[];
  };

  return { exportJournalEntries };
}
