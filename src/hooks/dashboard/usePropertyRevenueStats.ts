/**
 * usePropertyRevenueStats Hook
 * Hook لإحصائيات إيرادات العقارات
 * @version 2.9.2
 */
import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export interface RentalPaymentWithContract {
  amount_paid: number | null;
  tax_amount: number | null;
  contracts: {
    payment_frequency: string | null;
  } | null;
}

export function usePropertyRevenueStats() {
  return useQuery<RentalPaymentWithContract[]>({
    queryKey: QUERY_KEYS.RENTAL_PAYMENTS_WITH_FREQUENCY,
    queryFn: () => PropertyService.getRentalPaymentsWithFrequency(),
    ...QUERY_CONFIG.DEFAULT,
  });
}
