import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services";
import type { TrialBalanceAccount, BalanceSheetData, IncomeStatementData } from "@/services/accounting.service";

export type { TrialBalanceAccount, BalanceSheetData, IncomeStatementData };

export function useFinancialReports(fiscalYearId?: string) {
  const { data: trialBalance = [], isLoading: isLoadingTrial } = useQuery({
    queryKey: ["trial_balance", fiscalYearId],
    queryFn: () => AccountingService.getTrialBalanceSimple(),
    enabled: true,
  });

  const { data: balanceSheet, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["balance_sheet", fiscalYearId],
    queryFn: () => AccountingService.getBalanceSheet(),
  });

  const { data: incomeStatement, isLoading: isLoadingIncome } = useQuery({
    queryKey: ["income_statement", fiscalYearId],
    queryFn: () => AccountingService.getIncomeStatement(),
  });

  return {
    trialBalance,
    balanceSheet,
    incomeStatement,
    isLoading: isLoadingTrial || isLoadingBalance || isLoadingIncome,
  };
}
