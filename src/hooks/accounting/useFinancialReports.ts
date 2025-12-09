import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services";
import type { TrialBalanceAccount, BalanceSheetData, IncomeStatementData } from "@/services/accounting.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { TrialBalanceAccount, BalanceSheetData, IncomeStatementData };

export function useFinancialReports(fiscalYearId?: string) {
  const { data: trialBalance = [], isLoading: isLoadingTrial } = useQuery({
    queryKey: QUERY_KEYS.TRIAL_BALANCE_BY_YEAR(fiscalYearId),
    queryFn: () => AccountingService.getTrialBalanceSimple(),
    enabled: true,
  });

  const { data: balanceSheet, isLoading: isLoadingBalance } = useQuery({
    queryKey: QUERY_KEYS.BALANCE_SHEET_BY_YEAR(fiscalYearId),
    queryFn: () => AccountingService.getBalanceSheet(),
  });

  const { data: incomeStatement, isLoading: isLoadingIncome } = useQuery({
    queryKey: QUERY_KEYS.INCOME_STATEMENT_BY_YEAR(fiscalYearId),
    queryFn: () => AccountingService.getIncomeStatement(),
  });

  return {
    trialBalance,
    balanceSheet,
    incomeStatement,
    isLoading: isLoadingTrial || isLoadingBalance || isLoadingIncome,
  };
}
