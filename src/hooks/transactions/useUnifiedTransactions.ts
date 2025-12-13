/**
 * Hook for AllTransactions data fetching
 * يجلب المعاملات الموحدة من جميع المصادر
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UnifiedTransaction {
  source: string;
  source_name_ar: string;
  source_name_en: string;
  id: string;
  transaction_date: string;
  amount: number;
  party_name: string;
  transaction_type: string;
  payment_method: string;
  description: string;
  status: string;
  journal_entry_id: string | null;
  reference_number: string;
  created_at: string;
  beneficiary_id: string | null;
  contract_number: string | null;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  totalTransactions: number;
  netAmount: number;
}

export function useUnifiedTransactions() {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.UNIFIED_TRANSACTIONS,
    queryFn: () => AccountingService.getUnifiedTransactions(),
  });

  const calculateStats = (filteredTransactions: UnifiedTransaction[]): TransactionStats => {
    const totalIncome = filteredTransactions
      .filter((t) => t.transaction_type === "قبض")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter((t) => t.transaction_type === "صرف")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      totalTransactions: filteredTransactions.length,
      netAmount: totalIncome - totalExpense,
    };
  };

  return {
    transactions,
    isLoading,
    error,
    calculateStats,
  };
}
