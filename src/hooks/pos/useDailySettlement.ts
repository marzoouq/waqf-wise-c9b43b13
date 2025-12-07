import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export interface ShiftReport {
  shift_id: string;
  shift_number: string;
  cashier_name: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  total_collections: number;
  total_payments: number;
  variance: number;
  status: string;
}

export const useDailySettlement = (startDate: Date, endDate: Date) => {
  const queryClient = useQueryClient();

  const { data: shiftsReport, isLoading, refetch } = useQuery({
    queryKey: ["pos-shifts-report", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_shifts_report", {
        p_start_date: format(startDate, "yyyy-MM-dd"),
        p_end_date: format(endDate, "yyyy-MM-dd"),
      });

      if (error) throw error;
      return (data as ShiftReport[]) || [];
    },
  });

  const settlementMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase
        .from("cashier_shifts")
        .update({ status: "مغلقة" })
        .eq("id", shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تمت التسوية بنجاح");
      queryClient.invalidateQueries({ queryKey: ["pos-shifts-report"] });
      queryClient.invalidateQueries({ queryKey: ["cashier-shift"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التسوية");
    },
  });

  const totalCollections = shiftsReport?.reduce((sum, s) => sum + (s.total_collections || 0), 0) || 0;
  const totalPayments = shiftsReport?.reduce((sum, s) => sum + (s.total_payments || 0), 0) || 0;
  const totalVariance = shiftsReport?.reduce((sum, s) => sum + (s.variance || 0), 0) || 0;

  return {
    shiftsReport: shiftsReport || [],
    isLoading,
    refetch,
    settleShift: settlementMutation.mutate,
    isSettling: settlementMutation.isPending,
    summary: {
      totalCollections,
      totalPayments,
      netAmount: totalCollections - totalPayments,
      totalVariance,
      shiftsCount: shiftsReport?.length || 0,
    },
  };
};
