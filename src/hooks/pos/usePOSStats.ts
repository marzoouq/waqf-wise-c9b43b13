/**
 * usePOSStats Hook - إحصائيات نقاط البيع
 * يستخدم POSService
 */
import { useQuery } from "@tanstack/react-query";
import { POSService, type POSDailyStats } from "@/services";

export type { POSDailyStats };

export const usePOSStats = (date: Date = new Date()) => {
  const { data: dailyStats, isLoading, refetch } = useQuery({
    queryKey: ["pos-daily-stats", date.toISOString().split('T')[0]],
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
    queryKey: ["pos-shift-stats", shiftId],
    queryFn: () => POSService.getShiftStats(shiftId!),
    enabled: !!shiftId,
  });

  return { shiftStats, isLoading, refetch };
};
