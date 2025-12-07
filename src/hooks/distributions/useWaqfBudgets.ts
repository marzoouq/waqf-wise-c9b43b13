import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  percentage: number;
}

interface WaqfReserve {
  id: string;
  reserve_type: string;
  amount: number;
  current_balance: number;
}

export function useWaqfBudgets(fiscalYearId?: string) {
  // Fetch budgets from database
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["waqf-budgets", fiscalYearId],
    queryFn: async () => {
      let query = supabase
        .from("budgets")
        .select("*, accounts(name_ar, code)")
        .order("created_at", { ascending: false });

      if (fiscalYearId) {
        query = query.eq("fiscal_year_id", fiscalYearId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch reserves
  const { data: reserves, isLoading: reservesLoading } = useQuery({
    queryKey: ["waqf-reserves"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waqf_reserves")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WaqfReserve[] || [];
    },
  });

  // Calculate budget categories
  const budgetCategories: BudgetCategory[] = budgets?.map(budget => ({
    name: budget.accounts?.name_ar || "غير محدد",
    budget: budget.budgeted_amount || 0,
    spent: budget.actual_amount || 0,
    percentage: budget.budgeted_amount 
      ? Math.round((budget.actual_amount / budget.budgeted_amount) * 100)
      : 0,
  })) || [];

  // Calculate annual totals
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

  // Calculate reserve totals
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
