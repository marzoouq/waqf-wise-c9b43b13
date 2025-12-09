/**
 * Cash Flow Report Hook
 * @version 2.8.37
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CashFlowStats {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  avgMonthlyIncome: number;
}

export function useCashFlowReport() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const query = useQuery({
    queryKey: ["cash-flow-report"],
    ...QUERY_CONFIG.REPORTS,
    queryFn: async (): Promise<CashFlowData[]> => {
      const { data, error } = await supabase
        .from("unified_transactions_view")
        .select("transaction_date, amount, transaction_type")
        .gte("transaction_date", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // تجميع البيانات حسب الشهر
      const monthlyData: Record<string, { income: number; expense: number }> = {};

      data.forEach((transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
        });

        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }

        if (transaction.transaction_type === "قبض") {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expense += transaction.amount;
        }
      });

      const chartData: CashFlowData[] = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }));

      return chartData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    },
  });

  // تحديث وقت آخر تحديث
  useEffect(() => {
    if (query.dataUpdatedAt) {
      setLastUpdated(new Date(query.dataUpdatedAt));
    }
  }, [query.dataUpdatedAt]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('cash-flow-report-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ["cash-flow-report"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries' }, () => {
        queryClient.invalidateQueries({ queryKey: ["cash-flow-report"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["cash-flow-report"] });
  };

  // حساب الإحصائيات
  const cashFlowData = query.data || [];
  const stats: CashFlowStats = {
    totalIncome: cashFlowData.reduce((sum, d) => sum + d.income, 0),
    totalExpense: cashFlowData.reduce((sum, d) => sum + d.expense, 0),
    netCashFlow: cashFlowData.reduce((sum, d) => sum + d.net, 0),
    avgMonthlyIncome: cashFlowData.length > 0 
      ? cashFlowData.reduce((sum, d) => sum + d.income, 0) / cashFlowData.length 
      : 0,
  };

  return {
    ...query,
    stats,
    lastUpdated,
    handleRefresh,
  };
}
