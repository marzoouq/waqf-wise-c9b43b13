import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/ui/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface CashFlow {
  id: string;
  fiscal_year_id: string;
  period_start: string;
  period_end: string;
  operating_activities: number;
  investing_activities: number;
  financing_activities: number;
  net_cash_flow: number;
  opening_cash: number;
  closing_cash: number;
  created_at: string;
  updated_at: string;
}

export function useCashFlows(fiscalYearId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cashFlows = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.CASH_FLOWS(fiscalYearId),
    queryFn: () => AccountingService.getCashFlows(fiscalYearId),
  });

  const calculateCashFlow = useMutation({
    mutationFn: async (params: { fiscalYearId: string; periodStart: string; periodEnd: string }) => {
      // استدعاء Edge Function لحساب التدفقات النقدية
      const { data, error } = await supabase.functions.invoke('calculate-cash-flow', {
        body: {
          fiscal_year_id: params.fiscalYearId,
          period_start: params.periodStart,
          period_end: params.periodEnd,
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASH_FLOWS() });
      toast({
        title: "تم الحساب بنجاح",
        description: `تم حساب التدفقات النقدية - صافي التدفق: ${data?.data?.net_cash_flow?.toLocaleString('ar-SA') || 0} ر.س`,
      });
    },
    onError: createMutationErrorHandler({
      context: 'calculate_cash_flow',
      toastTitle: 'خطأ في حساب التدفقات النقدية',
    }),
  });

  return {
    cashFlows,
    isLoading,
    calculateCashFlow: calculateCashFlow.mutateAsync,
    isCalculating: calculateCashFlow.isPending,
  };
}
