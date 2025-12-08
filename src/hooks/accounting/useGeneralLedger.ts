/**
 * useGeneralLedger Hook
 * Hook لدفتر الأستاذ العام
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountRow, GeneralLedgerEntry } from "@/types/supabase-helpers";

interface UseGeneralLedgerParams {
  accountId: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useGeneralLedger({ accountId, dateFrom, dateTo }: UseGeneralLedgerParams) {
  const { data: accounts, error: accountsError, refetch: refetchAccounts } = useQuery({
    queryKey: ["accounts_for_ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, code, name_ar")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: ledgerData, isLoading, error, refetch } = useQuery({
    queryKey: ["general_ledger", accountId || undefined, dateFrom || undefined, dateTo || undefined],
    queryFn: async () => {
      if (!accountId) return null;

      let query = supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entry:journal_entries!inner(
            entry_number,
            entry_date,
            description,
            status
          )
        `)
        .eq("account_id", accountId)
        .eq("journal_entry.status", "posted")
        .order("journal_entry(entry_date)", { ascending: true });

      if (dateFrom) {
        query = query.gte("journal_entry.entry_date", dateFrom);
      }
      if (dateTo) {
        query = query.lte("journal_entry.entry_date", dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      let balance = 0;
      
      const processedData: GeneralLedgerEntry[] = data.map((line, index: number) => {
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
