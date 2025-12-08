import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { POSService } from "@/services/pos.service";
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
    queryFn: () => POSService.getShiftsReport(
      format(startDate, "yyyy-MM-dd"),
      format(endDate, "yyyy-MM-dd")
    ),
  });

  const settlementMutation = useMutation({
    mutationFn: (shiftId: string) => POSService.settleShift(shiftId),
    onSuccess: () => {
      toast.success("تمت التسوية بنجاح");
      queryClient.invalidateQueries({ queryKey: ["pos-shifts-report"] });
      queryClient.invalidateQueries({ queryKey: ["cashier-shift"] });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التسوية");
    },
  });

  const totalCollections = shiftsReport?.reduce((sum: number, s: any) => sum + (s.total_collections || 0), 0) || 0;
  const totalPayments = shiftsReport?.reduce((sum: number, s: any) => sum + (s.total_payments || 0), 0) || 0;
  const totalVariance = shiftsReport?.reduce((sum: number, s: any) => sum + (s.variance || 0), 0) || 0;

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
