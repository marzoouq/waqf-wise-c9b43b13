import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import { POSService, POSTransaction } from '@/services/pos.service';

export type { POSTransaction };

export interface CreateTransactionInput {
  shiftId: string;
  transactionType: 'تحصيل' | 'صرف';
  amount: number;
  paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
  rentalPaymentId?: string;
  contractId?: string;
  beneficiaryId?: string;
  payerName?: string;
  expenseCategory?: string;
  description?: string;
  referenceNumber?: string;
}

export function usePOSTransactions(shiftId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب عمليات وردية معينة
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['pos', 'transactions', shiftId],
    queryFn: () => POSService.getTransactions(shiftId!),
    enabled: !!shiftId,
  });

  // جلب عمليات اليوم
  const { data: todayTransactions = [] } = useQuery({
    queryKey: ['pos', 'transactions', 'today'],
    queryFn: () => POSService.getTodayTransactions(),
  });

  // إنشاء عملية جديدة
  const createTransactionMutation = useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      return POSService.createTransaction({
        ...input,
        cashierId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      queryClient.invalidateQueries({ queryKey: ['rental-payments'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء تسجيل العملية');
    },
  });

  // إلغاء عملية
  const voidTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: string; reason: string }) => {
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      return POSService.voidTransaction(transactionId, user.id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('تم إلغاء العملية');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'حدث خطأ أثناء إلغاء العملية');
    },
  });

  // إحصائيات العمليات
  const stats = {
    totalCollections: transactions.filter(t => t.transaction_type === 'تحصيل').reduce((sum, t) => sum + t.amount, 0),
    totalPayments: transactions.filter(t => t.transaction_type === 'صرف').reduce((sum, t) => sum + t.amount, 0),
    transactionsCount: transactions.length,
    cashTransactions: transactions.filter(t => t.payment_method === 'نقدي').reduce((sum, t) => sum + t.amount, 0),
    cardTransactions: transactions.filter(t => t.payment_method === 'شبكة').reduce((sum, t) => sum + t.amount, 0),
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['pos', 'transactions'] });
  };

  return {
    transactions,
    todayTransactions,
    isLoading,
    stats,
    refetch,
    createTransaction: createTransactionMutation.mutateAsync,
    voidTransaction: voidTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isVoiding: voidTransactionMutation.isPending,
  };
}