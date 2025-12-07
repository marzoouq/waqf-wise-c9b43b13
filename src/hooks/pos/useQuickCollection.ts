import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

export interface CollectionInput {
  shiftId: string;
  rentalPaymentId: string;
  contractId: string;
  amount: number;
  paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
  payerName: string;
  referenceNumber?: string;
  description?: string;
}

export function useQuickCollection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const collectMutation = useMutation({
    mutationFn: async (input: CollectionInput) => {
      // 1. توليد رقم العملية
      const { data: transactionNumber } = await supabase.rpc('generate_pos_transaction_number');

      // 2. إنشاء عملية التحصيل
      const { data: transaction, error: transError } = await supabase
        .from('pos_transactions')
        .insert({
          transaction_number: transactionNumber,
          shift_id: input.shiftId,
          transaction_type: 'تحصيل',
          rental_payment_id: input.rentalPaymentId,
          contract_id: input.contractId,
          amount: input.amount,
          payment_method: input.paymentMethod,
          payer_name: input.payerName,
          reference_number: input.referenceNumber,
          description: input.description || `تحصيل إيجار - ${input.payerName}`,
          cashier_id: user?.id,
          net_amount: input.amount,
        })
        .select()
        .single();

      if (transError) throw transError;

      // 3. تحديث حالة دفعة الإيجار
      const { error: paymentError } = await supabase
        .from('rental_payments')
        .update({
          status: 'مدفوع',
          amount_paid: input.amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: input.paymentMethod,
        })
        .eq('id', input.rentalPaymentId);

      if (paymentError) throw paymentError;

      // 4. إنشاء قيد محاسبي تلقائي (اختياري - يمكن تفعيله لاحقاً)
      // يمكن استخدام create_auto_journal_entry

      return transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      queryClient.invalidateQueries({ queryKey: ['rental-payments'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(`تم التحصيل بنجاح - رقم العملية: ${data.transaction_number}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء التحصيل');
    },
  });

  return {
    collect: collectMutation.mutateAsync,
    isCollecting: collectMutation.isPending,
  };
}
