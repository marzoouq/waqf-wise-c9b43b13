import { useQuery } from "@tanstack/react-query";
import { FundService } from "@/services/fund.service";
import { QUERY_KEYS } from "@/lib/query-keys";

interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  percentage: number;
}

export function useWaqfBudgets(fiscalYearId?: string) {
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: QUERY_KEYS.WAQF_BUDGETS(fiscalYearId),
    queryFn: () => FundService.getBudgets(fiscalYearId),
  });

  const { data: reserves, isLoading: reservesLoading } = useQuery({
    queryKey: QUERY_KEYS.WAQF_RESERVES,
    queryFn: () => FundService.getReserves(),
  });

  const budgetCategories: BudgetCategory[] = budgets?.map(budget => ({
    name: budget.accounts?.name_ar || "غير محدد",
    budget: budget.budgeted_amount || 0,
    spent: budget.actual_amount || 0,
    percentage: budget.budgeted_amount 
      ? Math.round((budget.actual_amount / budget.budgeted_amount) * 100)
      : 0,
  })) || [];

  const annualBudget = {
    total: budgets?.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0) || 0,
    spent: budgets?.reduce((sum, b) => sum + (b.actual_amount || 0), 0) || 0,
    remaining: 0,
    percentage: 0,
  };
  annualBudget.remaining = annualBudget.total - annualBudget.spent;
  annualBudget.percentage = annualBudget.total 
    ? Math.round((annualBudget.spent / annualBudget.total) * 100)
    : 0;

  const reserveTotals = {
    total: reserves?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0,
    invested: 0,
    liquid: reserves?.reduce((sum, r) => sum + (r.current_balance || 0), 0) || 0,
  };

  return {
    budgets: budgets || [],
    reserves: reserves || [],
    budgetCategories,
    annualBudget,
    reserveTotals,
    isLoading: budgetsLoading || reservesLoading,
    hasBudgets: (budgets?.length || 0) > 0,
    hasReserves: (reserves?.length || 0) > 0,
  };
}
