/**
 * useBudgetManagement Hook
 * Hook لإدارة الموازنات التقديرية
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    queryKey: ["budgets", periodType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          accounts (
            code,
            name_ar
          )
        `)
        .eq("period_type", periodType)
        .order("accounts(code)", { ascending: true });
      
      if (error) throw error;
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
