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

      // تنفيذ جميع الاستعلامات بشكل متوازي
      const [cashAccountsResult, receiptsResult, paymentsResult, pendingResult] = await Promise.all([
        supabase.from('bank_accounts').select('current_balance').eq('is_active', true),
        supabase.from('journal_entries')
          .select('*, journal_entry_lines(debit_amount, credit_amount)')
          .eq('entry_date', today)
          .eq('status', 'posted')
          .eq('reference_type', 'payment_receipt'),
        supabase.from('journal_entries')
          .select('*, journal_entry_lines(debit_amount, credit_amount)')
          .eq('entry_date', today)
          .eq('status', 'posted')
          .eq('reference_type', 'payment_voucher'),
        supabase.from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft')
      ]);

      // معالجة الأخطاء
      if (cashAccountsResult.error) throw cashAccountsResult.error;
      if (receiptsResult.error) throw receiptsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;
      if (pendingResult.error) throw pendingResult.error;

      // حساب رصيد الصندوق
      const cashBalance = cashAccountsResult.data?.reduce(
        (sum, acc) => sum + Number(acc.current_balance || 0),
        0
      ) || 0;

      // حساب مقبوضات اليوم
      const todayReceipts = receiptsResult.data?.reduce((sum, entry) => {
        const debitTotal = (Array.isArray(entry.journal_entry_lines) ? entry.journal_entry_lines : []).reduce(
          (s: number, line: { debit_amount?: number }) => s + Number(line.debit_amount || 0),
          0
        );
        return sum + debitTotal;
      }, 0) || 0;

      // حساب مدفوعات اليوم
      const todayPayments = paymentsResult.data?.reduce((sum, entry) => {
        const creditTotal = (Array.isArray(entry.journal_entry_lines) ? entry.journal_entry_lines : []).reduce(
          (s: number, line: { credit_amount?: number }) => s + Number(line.credit_amount || 0),
          0
        );
        return sum + creditTotal;
      }, 0) || 0;

      return {
        cashBalance,
        todayReceipts,
        todayPayments,
        pendingTransactions: pendingResult.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (محسّن)
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false, // إيقاف التحديث التلقائي
  });
}
