import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CashierStats {
  cashBalance: number;
  todayReceipts: number;
  todayPayments: number;
  pendingTransactions: number;
}

export function useCashierStats() {
  return useQuery({
    queryKey: ['cashier-stats'],
    queryFn: async (): Promise<CashierStats> => {
      const today = new Date().toISOString().split('T')[0];

      // رصيد الصندوق من الحسابات البنكية
      const { data: cashAccounts, error: cashError } = await supabase
        .from('bank_accounts')
        .select('current_balance')
        .eq('is_active', true);

      if (cashError) throw cashError;

      const cashBalance = cashAccounts?.reduce(
        (sum, acc) => sum + Number(acc.current_balance || 0),
        0
      ) || 0;

      // مقبوضات اليوم من جدول journal_entries
      const { data: receipts, error: receiptsError } = await supabase
        .from('journal_entries')
        .select('*, journal_entry_lines(debit_amount, credit_amount)')
        .eq('entry_date', today)
        .eq('status', 'posted')
        .eq('reference_type', 'payment_receipt');

      if (receiptsError) throw receiptsError;

      const todayReceipts = receipts?.reduce((sum, entry) => {
        const debitTotal = (entry.journal_entry_lines as any[])?.reduce(
          (s, line) => s + Number(line.debit_amount || 0),
          0
        ) || 0;
        return sum + debitTotal;
      }, 0) || 0;

      // مدفوعات اليوم
      const { data: payments, error: paymentsError } = await supabase
        .from('journal_entries')
        .select('*, journal_entry_lines(debit_amount, credit_amount)')
        .eq('entry_date', today)
        .eq('status', 'posted')
        .eq('reference_type', 'payment_voucher');

      if (paymentsError) throw paymentsError;

      const todayPayments = payments?.reduce((sum, entry) => {
        const creditTotal = (entry.journal_entry_lines as any[])?.reduce(
          (s, line) => s + Number(line.credit_amount || 0),
          0
        ) || 0;
        return sum + creditTotal;
      }, 0) || 0;

      // المعاملات المعلقة
      const { count: pendingCount, error: pendingError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      if (pendingError) throw pendingError;

      return {
        cashBalance,
        todayReceipts,
        todayPayments,
        pendingTransactions: pendingCount || 0,
      };
    },
    staleTime: 30000, // 30 ثانية
    refetchInterval: 60000, // تحديث كل دقيقة
    refetchOnWindowFocus: true,
  });
}
