/**
 * useCashierStats Hook
 * Hook لجلب إحصائيات أمين الصندوق - يستخدم Service Layer
 */

import { useQuery } from '@tanstack/react-query';
import { AccountingService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';

interface CashierStats {
  cashBalance: number;
  todayReceipts: number;
  todayPayments: number;
  pendingTransactions: number;
}

export function useCashierStats() {
  return useQuery({
    queryKey: QUERY_KEYS.CASHIER_STATS,
    queryFn: (): Promise<CashierStats> => AccountingService.getCashierStats(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
