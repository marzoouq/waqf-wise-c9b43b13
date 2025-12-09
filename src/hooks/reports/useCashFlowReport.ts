/**
 * Cash Flow Report Hook
 * @version 2.8.44
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { ReportsService, type CashFlowData } from "@/services/reports.service";

export type { CashFlowData };

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
    queryFn: () => ReportsService.getCashFlowData(),
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
