import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { useEffect } from "react";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { LoansService } from "@/services/loans.service";
import { RealtimeService } from "@/services/realtime.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface LoanInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paid_at?: string;
  created_at: string;
}

export function useLoanInstallments(loanId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'loan_installments',
      () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOAN_INSTALLMENTS() })
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch installments
  const { data: installments = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.LOAN_INSTALLMENTS(loanId),
    queryFn: () => LoansService.getInstallments(loanId),
    enabled: !!loanId,
    ...QUERY_CONFIG.LOANS,
  });

  // Update installment mutation (for marking as paid)
  const updateInstallment = useMutation({
    mutationFn: async ({ 
      id, 
      paid_amount,
      status 
    }: { 
      id: string; 
      paid_amount: number;
      status: 'pending' | 'partial' | 'paid' | 'overdue';
    }) => {
      const installment = installments.find(i => i.id === id);
      if (!installment) throw new Error('القسط غير موجود');

      const newPaidAmount = paid_amount;
      const newRemainingAmount = installment.total_amount - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : status;

      return LoansService.updateInstallment(id, {
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOAN_INSTALLMENTS() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      
      toast({
        title: "تم تحديث القسط بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تحديث القسط",
        description: error.message,
      });
    },
  });

  return {
    installments: installments as LoanInstallment[],
    isLoading,
    updateInstallment: updateInstallment.mutateAsync,
  };
}
