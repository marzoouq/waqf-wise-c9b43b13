/**
 * useBudgetVarianceReport Hook
 * Hook لتقرير مقارنة الميزانيات
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AccountingService } from '@/services/accounting.service';
import { FiscalYearService } from '@/services/fiscal-year.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface BudgetData {
  id: string;
  budgeted_amount: number;
  actual_amount: number | null;
  variance_amount: number | null;
  period_type: string;
  period_number: number | null;
  accounts: {
    code: string;
    name_ar: string;
  } | null;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
}

export function useBudgetVarianceReport() {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');

  const { data: fiscalYears, isLoading: loadingFiscalYears } = useQuery({
    queryKey: QUERY_KEYS.FISCAL_YEARS,
    queryFn: () => FiscalYearService.getAll(),
  });

  const { data: budgets, isLoading: loadingBudgets, error } = useQuery({
    queryKey: QUERY_KEYS.BUDGETS_VARIANCE(selectedFiscalYear),
    queryFn: () => AccountingService.getBudgetsByFiscalYear(selectedFiscalYear),
    enabled: !!selectedFiscalYear,
  });

  const typedBudgets = (budgets || []) as BudgetData[];

  const summary: BudgetSummary | null = typedBudgets.reduce(
    (acc, budget) => ({
      totalBudgeted: acc.totalBudgeted + budget.budgeted_amount,
      totalActual: acc.totalActual + (budget.actual_amount || 0),
      totalVariance: acc.totalVariance + (budget.variance_amount || 0),
    }),
    { totalBudgeted: 0, totalActual: 0, totalVariance: 0 }
  ) || null;

  const getVarianceStatus = (variance: number, budgeted: number): 'good' | 'warning' | 'critical' => {
    const percentage = (variance / budgeted) * 100;
    if (Math.abs(percentage) <= 5) return 'good';
    if (Math.abs(percentage) <= 15) return 'warning';
    return 'critical';
  };

  return {
    fiscalYears,
    budgets: typedBudgets,
    summary,
    selectedFiscalYear,
    setSelectedFiscalYear,
    getVarianceStatus,
    isLoading: loadingFiscalYears || loadingBudgets,
    error,
  };
}
