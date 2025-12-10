/**
 * useGeneralLedger Hook
 * Hook لدفتر الأستاذ العام
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { AccountRow, GeneralLedgerEntry } from "@/types/supabase-helpers";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseGeneralLedgerParams {
  accountId: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useGeneralLedger({ accountId, dateFrom, dateTo }: UseGeneralLedgerParams) {
  const { data: accounts, error: accountsError, refetch: refetchAccounts } = useQuery({
    queryKey: QUERY_KEYS.ACCOUNTS_FOR_LEDGER,
    queryFn: () => AccountingService.getAccountsForLedger(),
  });

  const { data: ledgerData, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.GENERAL_LEDGER(accountId || undefined, dateFrom || undefined, dateTo || undefined),
    queryFn: async () => {
      if (!accountId) return null;

      const data = await AccountingService.getGeneralLedgerForHook({
        accountId,
        dateFrom,
        dateTo,
      });

      if (!data) return null;

      let balance = 0;
      
      interface LedgerLineData {
        id?: string;
        debit_amount: number | null;
        credit_amount: number | null;
        description?: string;
        journal_entry_id: string;
        journal_entry: {
          entry_date: string;
          entry_number: string;
          description: string;
        };
      }
      
      const processedData: GeneralLedgerEntry[] = data.map((line: LedgerLineData, index: number) => {
        const debit = Number(line.debit_amount);
        const credit = Number(line.credit_amount);
        balance += debit - credit;
        return {
          id: line.id || `line-${index}`,
          entry_date: line.journal_entry.entry_date,
          entry_number: line.journal_entry.entry_number,
          description: line.description || line.journal_entry.description,
          debit_amount: debit,
          credit_amount: credit,
          balance,
          journal_entry: {
            id: line.journal_entry_id,
            entry_number: line.journal_entry.entry_number,
            entry_date: line.journal_entry.entry_date,
            description: line.journal_entry.description
          }
        };
      });

      return processedData;
    },
    enabled: !!accountId,
  });

  const selectedAccount = accounts?.find((acc: AccountRow) => acc.id === accountId);

  return {
    accounts,
    accountsError,
    ledgerData,
    isLoading,
    error,
    refetch,
    refetchAccounts,
    selectedAccount,
  };
}
