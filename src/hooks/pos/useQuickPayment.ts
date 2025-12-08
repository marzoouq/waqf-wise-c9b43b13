import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import { POSService } from '@/services/pos.service';

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
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      return POSService.quickPayment({
        ...input,
        cashierId: user.id,
      });
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