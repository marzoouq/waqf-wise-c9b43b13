import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { useToast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";

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
    queryKey: ["cash_flows", fiscalYearId],
    queryFn: () => AccountingService.getCashFlows(fiscalYearId),
  });

  const calculateCashFlow = useMutation({
    mutationFn: (params: { fiscalYearId: string; periodStart: string; periodEnd: string }) =>
      AccountingService.calculateCashFlow(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_flows"] });
      toast({
        title: "تم الحساب بنجاح",
        description: "تم حساب قائمة التدفقات النقدية",
      });
    },
    onError: createMutationErrorHandler({
      context: 'calculate_cash_flow',
      toastTitle: 'خطأ في الحساب',
    }),
  });

  return {
    cashFlows,
    isLoading,
    calculateCashFlow: calculateCashFlow.mutateAsync,
  };
}
