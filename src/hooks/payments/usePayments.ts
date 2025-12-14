import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentService, RealtimeService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { paymentRequiresApproval } from "@/lib/supabase-wrappers";
import { createMutationErrorHandler } from "@/lib/errors";
import type { Database } from "@/integrations/supabase/types";
import { QUERY_KEYS } from "@/lib/query-keys";

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export function usePayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

  // Real-time subscription using RealtimeService
  useEffect(() => {
    const { unsubscribe } = RealtimeService.subscribeToTable('payments', () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS,
    queryFn: () => PaymentService.getAll(),
    staleTime: 3 * 60 * 1000,
  });

  const addPayment = useMutation({
    mutationFn: async (payment: Omit<PaymentInsert, "id" | "created_at" | "updated_at">) => {
      // التحقق من حاجة المدفوعة للموافقة
      const result = await paymentRequiresApproval(payment.amount || 0);
      const requiresApproval = result.data || false;

      const paymentStatus = requiresApproval ? 'pending' : 'completed';
      
      const data = await PaymentService.create({ 
        ...payment, 
        status: paymentStatus 
      });

      // إذا كانت تحتاج موافقة، إنشاء موافقات
      if (requiresApproval) {
        await PaymentService.createApprovals(data.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
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
    mutationFn: async ({ id, ...updates }: PaymentUpdate & { id: string }) => {
      return PaymentService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
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
