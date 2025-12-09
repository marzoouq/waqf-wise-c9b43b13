/**
 * useBudgetManagement Hook
 * Hook لإدارة الموازنات التقديرية
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface BudgetData {
  id: string;
  account_id: string;
  fiscal_year_id: string;
  period_type: string;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  accounts: {
    code: string;
    name_ar: string;
  };
}

export function useBudgetManagement(periodType: string) {
  const { data: budgets, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.BUDGETS_BY_PERIOD(periodType),
    queryFn: async () => {
      const data = await AccountingService.getBudgetsByPeriod(periodType);
      return data as BudgetData[];
    },
  });

  const calculatePercentage = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return Math.round((actual / budgeted) * 100);
  };

  return {
    budgets,
    isLoading,
    error,
    refetch,
    calculatePercentage,
  };
}
