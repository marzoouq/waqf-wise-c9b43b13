import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "./useActivities";
import { useAuth } from "./useAuth";
import { useJournalEntries } from "./useJournalEntries";
import { useEffect } from "react";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { logger } from "@/lib/logger";

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
    const channel = supabase
      .channel('loan-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_payments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['loan_payments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['loan_payments', loanId],
    queryFn: async () => {
      let query = supabase
        .from('loan_payments')
        .select('id, loan_id, installment_id, payment_number, payment_amount, payment_date, payment_method, journal_entry_id, notes, created_at')
        .order('created_at', { ascending: false });

      if (loanId) {
        query = query.eq('loan_id', loanId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LoanPayment[];
    },
    enabled: !!loanId,
    ...QUERY_CONFIG.LOANS,
  });

  // Add payment mutation
  const addPayment = useMutation({
    mutationFn: async (payment: Omit<LoanPayment, 'id' | 'payment_number' | 'created_at' | 'journal_entry_id'>) => {
      // Insert payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('loan_payments')
        .insert([payment])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update installment if specified
      if (payment.installment_id) {
        const { data: installment, error: installmentFetchError } = await supabase
          .from('loan_installments')
          .select('id, loan_id, installment_number, due_date, total_amount, paid_amount, remaining_amount, status, paid_at')
          .eq('id', payment.installment_id)
          .single();

        if (installmentFetchError) throw installmentFetchError;

        const newPaidAmount = (installment.paid_amount || 0) + payment.payment_amount;
        const newRemainingAmount = installment.total_amount - newPaidAmount;
        const newStatus = newRemainingAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : installment.status;

        const { error: updateError } = await supabase
          .from('loan_installments')
          .update({
            paid_amount: newPaidAmount,
            remaining_amount: newRemainingAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : installment.paid_at
          })
          .eq('id', payment.installment_id);

        if (updateError) throw updateError;
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
          await supabase
            .from('loan_payments')
            .update({ journal_entry_id: entryId })
            .eq('id', paymentData.id);
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
    payments,
    isLoading,
    addPayment: addPayment.mutateAsync,
  };
}
