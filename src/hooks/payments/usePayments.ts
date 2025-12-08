import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentService, RealtimeService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { paymentRequiresApproval } from "@/lib/supabase-wrappers";
import { createMutationErrorHandler } from "@/lib/errors";

export interface Payment {
  id: string;
  payment_type: "receipt" | "payment";
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "card";
  payer_name: string;
  reference_number?: string;
  description: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export function usePayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

  // Real-time subscription using RealtimeService
  useEffect(() => {
    const { unsubscribe } = RealtimeService.subscribeToTable('payments', () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => PaymentService.getAll(),
    staleTime: 3 * 60 * 1000,
  });

  const addPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at" | "updated_at">) => {
      // التحقق من حاجة المدفوعة للموافقة
      const result = await paymentRequiresApproval(payment.amount);
      const requiresApproval = result.data || false;

      const paymentStatus = requiresApproval ? 'pending' : 'completed';
      
      const data = await PaymentService.create({ 
        ...payment, 
        status: paymentStatus 
      } as any);

      // إذا كانت تحتاج موافقة، إنشاء موافقات
      if (requiresApproval) {
        await PaymentService.createApprovals(data.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة السند وإنشاء القيد المحاسبي",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_payment',
      toastTitle: 'خطأ في الإضافة',
    }),
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      return PaymentService.update(id, updates as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات السند بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_payment',
      toastTitle: 'خطأ في التحديث',
    }),
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      return PaymentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف السند بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'delete_payment',
      toastTitle: 'خطأ في الحذف',
    }),
  });

  return {
    payments,
    isLoading,
    addPayment: addPayment.mutateAsync,
    updatePayment: updatePayment.mutateAsync,
    deletePayment: deletePayment.mutateAsync,
  };
}
