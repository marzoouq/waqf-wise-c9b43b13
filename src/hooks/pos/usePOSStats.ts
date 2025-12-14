/**
 * usePOSStats Hook - إحصائيات نقاط البيع
 * يستخدم POSService
 */
import { useQuery } from "@tanstack/react-query";
import { POSService, type POSDailyStats } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { POSDailyStats };

export const usePOSStats = (date: Date = new Date()) => {
  const dateStr = date.toISOString().split('T')[0];
  const { data: dailyStats, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.POS_DAILY_STATS(dateStr),
    queryFn: () => POSService.getDailyStats(date),
  });

  return {
    dailyStats: dailyStats || {
      total_collections: 0,
      total_payments: 0,
      net_amount: 0,
      transactions_count: 0,
      cash_amount: 0,
      card_amount: 0,
      transfer_amount: 0,
    },
    isLoading,
    refetch,
  };
};

export const useShiftStats = (shiftId: string | null) => {
  const { data: shiftStats, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.POS_SHIFT_STATS(shiftId || ''),
    queryFn: () => POSService.getShiftStats(shiftId!),
    enabled: !!shiftId,
  });

  return { shiftStats, isLoading, refetch };
};
