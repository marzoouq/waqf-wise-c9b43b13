/**
 * useCashierStats Hook
 * Hook لجلب إحصائيات أمين الصندوق - يستخدم Service Layer
 */

import { useQuery } from '@tanstack/react-query';
import { AccountingService } from '@/services';

interface CashierStats {
  cashBalance: number;
  todayReceipts: number;
  todayPayments: number;
  pendingTransactions: number;
}

export function useCashierStats() {
  return useQuery({
    queryKey: ['cashier-stats'],
    queryFn: (): Promise<CashierStats> => AccountingService.getCashierStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
