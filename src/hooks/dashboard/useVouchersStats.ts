/**
 * useVouchersStats Hook
 * Hook لإحصائيات سندات الدفع
 * @version 2.9.2
 */
import { useQuery } from "@tanstack/react-query";
import { PaymentService } from "@/services/payment.service";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.VOUCHERS_STATS,
    queryFn: () => PaymentService.getVouchersStats(),
    ...QUERY_CONFIG.DEFAULT,
  });
}
