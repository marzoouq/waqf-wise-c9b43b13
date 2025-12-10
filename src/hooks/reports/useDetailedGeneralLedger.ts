/**
 * useDetailedGeneralLedger Hook
 * Hook لدفتر الأستاذ التفصيلي
 * @version 2.8.68
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AccountingService } from '@/services';

export interface LedgerEntry {
  id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  running_balance: number;
  journal_entries: {
    entry_number: string;
    entry_date: string;
    description: string;
    status: string;
  };
}

export function useDetailedGeneralLedger() {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts_list'],
    queryFn: async () => {
      const data = await AccountingService.getAccounts();
      return (data || []).filter(acc => acc.is_active).sort((a, b) => a.code.localeCompare(b.code));
    },
  });

  const { data: ledgerEntries, isLoading: loadingEntries, error } = useQuery({
    queryKey: ['general_ledger', selectedAccount, startDate, endDate],
    queryFn: async (): Promise<LedgerEntry[]> => {
      if (!selectedAccount) return [];

      const data = await AccountingService.getJournalEntryLinesByAccount(selectedAccount, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // حساب الرصيد الجاري
      let runningBalance = 0;
      return (data || []).map((entry) => {
        runningBalance += entry.debit_amount - entry.credit_amount;
        return {
          id: entry.id,
          debit_amount: entry.debit_amount,
          credit_amount: entry.credit_amount,
          description: entry.description,
          running_balance: runningBalance,
          journal_entries: entry.journal_entries,
        };
      });
    },
    enabled: !!selectedAccount,
  });

  const totalDebit = ledgerEntries?.reduce((sum, entry) => sum + entry.debit_amount, 0) || 0;
  const totalCredit = ledgerEntries?.reduce((sum, entry) => sum + entry.credit_amount, 0) || 0;
  const finalBalance = ledgerEntries?.[ledgerEntries.length - 1]?.running_balance || 0;

  return {
    accounts,
    ledgerEntries,
    selectedAccount,
    setSelectedAccount,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    totalDebit,
    totalCredit,
    finalBalance,
    isLoading: loadingAccounts || loadingEntries,
    error,
  };
}
