/**
 * usePropertyRevenueStats Hook
 * Hook لإحصائيات إيرادات العقارات
 */
import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";

export interface RentalPaymentWithContract {
  amount_paid: number | null;
  tax_amount: number | null;
  contracts: {
    payment_frequency: string | null;
  } | null;
}

export function usePropertyRevenueStats() {
  return useQuery<RentalPaymentWithContract[]>({
    queryKey: ["rental-payments-with-frequency"],
    queryFn: () => PropertyService.getRentalPaymentsWithFrequency(),
  });
}
