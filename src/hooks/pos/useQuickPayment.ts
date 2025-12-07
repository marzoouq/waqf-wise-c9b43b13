import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

export interface PaymentInput {
  shiftId: string;
  amount: number;
  paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
  expenseCategory: string;
  payeeName: string;
  description: string;
  referenceNumber?: string;
  beneficiaryId?: string;
}

export const EXPENSE_CATEGORIES = [
  { value: 'صيانة', label: 'صيانة' },
  { value: 'رواتب', label: 'رواتب' },
  { value: 'مصاريف_إدارية', label: 'مصاريف إدارية' },
  { value: 'مرافق', label: 'مرافق (كهرباء/ماء)' },
  { value: 'توزيعات', label: 'توزيعات للمستفيدين' },
  { value: 'أخرى', label: 'أخرى' },
];

export function useQuickPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const payMutation = useMutation({
    mutationFn: async (input: PaymentInput) => {
      // 1. توليد رقم العملية
      const { data: transactionNumber } = await supabase.rpc('generate_pos_transaction_number');

      // 2. إنشاء عملية الصرف
      const { data: transaction, error } = await supabase
        .from('pos_transactions')
        .insert({
          transaction_number: transactionNumber,
          shift_id: input.shiftId,
          transaction_type: 'صرف',
          amount: input.amount,
          payment_method: input.paymentMethod,
          expense_category: input.expenseCategory,
          payer_name: input.payeeName,
          beneficiary_id: input.beneficiaryId,
          description: input.description,
          reference_number: input.referenceNumber,
          cashier_id: user?.id,
          net_amount: input.amount,
        })
        .select()
        .single();

      if (error) throw error;

      return transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success(`تم الصرف بنجاح - رقم العملية: ${data.transaction_number}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء الصرف');
    },
  });

  return {
    pay: payMutation.mutateAsync,
    isPaying: payMutation.isPending,
  };
}
