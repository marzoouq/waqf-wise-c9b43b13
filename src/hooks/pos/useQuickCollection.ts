import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import { POSService } from '@/services/pos.service';

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
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      return POSService.quickCollection({
        ...input,
        cashierId: user.id,
      });
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