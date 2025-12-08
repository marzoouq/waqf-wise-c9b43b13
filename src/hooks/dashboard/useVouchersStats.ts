/**
 * useVouchersStats Hook
 * Hook لإحصائيات سندات الدفع
 */
import { useQuery } from "@tanstack/react-query";
import { PaymentService } from "@/services/payment.service";

export interface VouchersStats {
  total: number;
  draft: number;
  paid: number;
  thisMonth: number;
  totalAmount: number;
  paidAmount: number;
}

export function useVouchersStats() {
  return useQuery<VouchersStats>({
    queryKey: ["vouchers-stats"],
    queryFn: () => PaymentService.getVouchersStats(),
  });
}
