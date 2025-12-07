import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface POSDailyStats {
  total_collections: number;
  total_payments: number;
  net_amount: number;
  transactions_count: number;
  cash_amount: number;
  card_amount: number;
  transfer_amount: number;
}

export const usePOSStats = (date: Date = new Date()) => {
  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: dailyStats, isLoading, refetch } = useQuery({
    queryKey: ["pos-daily-stats", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_pos_daily_stats", {
        p_date: formattedDate,
      });

      if (error) throw error;
      return (data?.[0] as POSDailyStats) || {
        total_collections: 0,
        total_payments: 0,
        net_amount: 0,
        transactions_count: 0,
        cash_amount: 0,
        card_amount: 0,
        transfer_amount: 0,
      };
    },
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
    queryFn: async () => {
      if (!shiftId) return null;
      
      const { data, error } = await supabase.rpc("get_shift_stats", {
        p_shift_id: shiftId,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!shiftId,
  });

  return { shiftStats, isLoading, refetch };
};
