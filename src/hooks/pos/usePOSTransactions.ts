import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

export interface POSTransaction {
  id: string;
  transaction_number: string;
  shift_id: string;
  transaction_type: 'تحصيل' | 'صرف' | 'تعديل';
  rental_payment_id: string | null;
  contract_id: string | null;
  beneficiary_id: string | null;
  amount: number;
  tax_amount: number;
  net_amount: number | null;
  payment_method: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
  reference_number: string | null;
  payer_name: string | null;
  expense_category: string | null;
  description: string | null;
  cashier_id: string;
  journal_entry_id: string | null;
  receipt_printed: boolean;
  voided: boolean;
  created_at: string;
}

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
    queryFn: async () => {
      if (!shiftId) return [];
      
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('shift_id', shiftId)
        .eq('voided', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as POSTransaction[];
    },
    enabled: !!shiftId,
  });

  // جلب عمليات اليوم
  const { data: todayTransactions = [] } = useQuery({
    queryKey: ['pos', 'transactions', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .eq('voided', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as POSTransaction[];
    },
  });

  // إنشاء عملية جديدة
  const createTransactionMutation = useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      // توليد رقم العملية
      const { data: transactionNumber } = await supabase.rpc('generate_pos_transaction_number');

      const { data, error } = await supabase
        .from('pos_transactions')
        .insert({
          transaction_number: transactionNumber,
          shift_id: input.shiftId,
          transaction_type: input.transactionType,
          amount: input.amount,
          payment_method: input.paymentMethod,
          rental_payment_id: input.rentalPaymentId,
          contract_id: input.contractId,
          beneficiary_id: input.beneficiaryId,
          payer_name: input.payerName,
          expense_category: input.expenseCategory,
          description: input.description,
          reference_number: input.referenceNumber,
          cashier_id: user?.id,
          net_amount: input.amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('pos_transactions')
        .update({
          voided: true,
          voided_at: new Date().toISOString(),
          voided_by: user?.id,
          void_reason: reason,
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
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

  return {
    transactions,
    todayTransactions,
    isLoading,
    stats,
    createTransaction: createTransactionMutation.mutateAsync,
    voidTransaction: voidTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isVoiding: voidTransactionMutation.isPending,
  };
}
