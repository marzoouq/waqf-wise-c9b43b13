/**
 * useBudgetVarianceReport Hook
 * Hook لتقرير مقارنة الميزانيات
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    queryKey: ['fiscal_years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('id, name, start_date, end_date')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: budgets, isLoading: loadingBudgets, error } = useQuery({
    queryKey: ['budgets_variance', selectedFiscalYear],
    queryFn: async () => {
      if (!selectedFiscalYear) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select('*, accounts(code, name_ar)')
        .eq('fiscal_year_id', selectedFiscalYear)
        .order('variance_amount', { ascending: true });

      if (error) throw error;
      return data as BudgetData[];
    },
    enabled: !!selectedFiscalYear,
  });

  const summary: BudgetSummary | null = budgets?.reduce(
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
    budgets,
    summary,
    selectedFiscalYear,
    setSelectedFiscalYear,
    getVarianceStatus,
    isLoading: loadingFiscalYears || loadingBudgets,
    error,
  };
}
