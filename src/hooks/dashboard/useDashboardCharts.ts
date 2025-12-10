/**
 * Dashboard Charts Hooks - خطافات رسوم لوحة التحكم
 * @version 2.8.68
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardService } from "@/services";
import type { BudgetComparison } from "@/types/dashboard";
import { QUERY_KEYS } from "@/lib/query-keys";

// ==================== Budget Comparison Hook ====================
export function useBudgetComparison() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.BUDGET_COMPARISON_CHART,
    queryFn: (): Promise<BudgetComparison[]> => DashboardService.getBudgetComparison(),
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('budgets-realtime-chart')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budgets'
      }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGET_COMPARISON_CHART });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// ==================== Revenue Expense Chart Hook ====================
export function useRevenueExpenseChart() {
  return useQuery({
    queryKey: QUERY_KEYS.REVENUE_EXPENSE_CHART,
    queryFn: () => DashboardService.getRevenueExpenseChartData(),
  });
}
