/**
 * Dashboard Charts Hooks - خطافات رسوم لوحة التحكم
 * @version 2.8.35
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BudgetComparison } from "@/types/dashboard";
import { JournalEntryLineRow, AccountRow } from "@/types/supabase-helpers";
import { QUERY_KEYS } from "@/lib/query-keys";

// ==================== Types ====================
interface BudgetData {
  accounts: {
    name_ar: string;
  };
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
}

interface JournalLineWithRelations extends JournalEntryLineRow {
  journal_entries: {
    entry_date: string;
  };
  accounts: AccountRow;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

// ==================== Budget Comparison Hook ====================
export function useBudgetComparison() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.BUDGET_COMPARISON_CHART,
    queryFn: async (): Promise<BudgetComparison[]> => {
      const { data: budgets, error } = await supabase
        .from("budgets")
        .select(`
          budgeted_amount,
          actual_amount,
          variance_amount,
          accounts!inner (
            name_ar
          )
        `)
        .limit(10);

      if (error) throw error;

      return budgets?.map((budget: BudgetData) => ({
        account: budget.accounts.name_ar.substring(0, 15) + '...',
        budgeted: Number(budget.budgeted_amount || 0),
        actual: Number(budget.actual_amount || 0),
        variance: Number(budget.variance_amount || 0),
      })) || [];
    },
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
    queryFn: async (): Promise<MonthlyData[]> => {
      const { data: entries, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount,
          credit_amount,
          journal_entries!inner (
            entry_date
          ),
          accounts!inner (
            account_type,
            account_nature
          )
        `)
        .order('journal_entries(entry_date)', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyMap = new Map<string, { revenue: number; expense: number }>();

      (entries as JournalLineWithRelations[] | null)?.forEach((line) => {
        const date = new Date(line.journal_entries.entry_date);
        const monthKey = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { revenue: 0, expense: 0 });
        }

        const monthData = monthlyMap.get(monthKey)!;
        const accountType = line.accounts.account_type;
        const accountNature = line.accounts.account_nature;
        const debit = Number(line.debit_amount || 0);
        const credit = Number(line.credit_amount || 0);

        if (accountType === 'revenue') {
          monthData.revenue += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'expense') {
          monthData.expense += accountNature === 'debit' ? debit - credit : credit - debit;
        }
      });

      return Array.from(monthlyMap.entries()).map(([month, values]) => ({
        month,
        revenue: values.revenue,
        expense: values.expense,
      }));
    },
  });
}
