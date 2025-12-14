import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/auth/useAuth";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useEffect } from "react";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { logger } from "@/lib/logger";
import { LoansService, RealtimeService } from "@/services";

export interface LoanPayment {
  id: string;
  loan_id: string;
  installment_id?: string;
  payment_number: string;
  payment_amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card';
  journal_entry_id?: string;
  notes?: string;
  created_at: string;
}

export function useLoanPayments(loanId?: string) {
  const { toast } = useToast();
  const { addActivity } = useActivities();
  const { user } = useAuth();
  const { createAutoEntry } = useJournalEntries();
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable('loan_payments', () => {
      queryClient.invalidateQueries({ queryKey: ['loan_payments'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch payments
  const { data: payments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['loan_payments', loanId],
    queryFn: () => LoansService.getLoanPayments(loanId),
    enabled: !!loanId,
    ...QUERY_CONFIG.LOANS,
  });

  // Add payment mutation
  const addPayment = useMutation({
    mutationFn: async (payment: Omit<LoanPayment, 'id' | 'payment_number' | 'created_at' | 'journal_entry_id'>) => {
      // Insert payment
      const paymentData = await LoansService.addLoanPayment({
        loan_id: payment.loan_id,
        installment_id: payment.installment_id,
        payment_amount: payment.payment_amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        notes: payment.notes,
      });

      // Update installment if specified
      if (payment.installment_id) {
        const installments = await LoansService.getInstallments(payment.loan_id);
        const installment = installments.find(i => i.id === payment.installment_id);

        if (installment) {
          const newPaidAmount = (installment.paid_amount || 0) + payment.payment_amount;
          const newRemainingAmount = installment.total_amount - newPaidAmount;
          const newStatus = newRemainingAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : installment.status;

          await LoansService.updateInstallment(payment.installment_id, {
            paid_amount: newPaidAmount,
            remaining_amount: newRemainingAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : installment.paid_at
          });
        }
      }

      // Create journal entry
      if (payment.payment_amount && payment.payment_date) {
        try {
          const entryId = await createAutoEntry(
            'general_payment',
            paymentData.id,
            payment.payment_amount,
            `سداد قسط قرض - ${paymentData.payment_number}`,
            payment.payment_date
          );

          // Update payment with journal entry ID
          await LoansService.updateLoanPaymentJournalEntry(paymentData.id, entryId);
        } catch (error) {
          logger.error(error, { context: 'loan_payment_journal_entry', severity: 'medium' });
        }
      }

      return paymentData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loan_payments'] });
      queryClient.invalidateQueries({ queryKey: ['loan_installments'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      
      addActivity({
        action: `تم تسجيل دفعة قرض: ${data.payment_number}`,
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      }).catch((error) => {
        logger.error(error, { context: 'loan_payment_activity', severity: 'low' });
      });

      toast({
        title: "تم تسجيل الدفعة بنجاح",
        description: `رقم الدفعة: ${data.payment_number}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدفعة",
        description: error.message,
      });
    },
  });

  return {
    payments: payments as LoanPayment[],
    isLoading,
    error,
    refetch,
    addPayment: addPayment.mutateAsync,
  };
}
