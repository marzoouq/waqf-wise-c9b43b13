/**
 * Hook for Payments page data fetching
 * يجلب السندات مع تفاصيل العقود
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PaymentService } from "@/services";

export interface PaymentWithContract {
  id: string;
  payment_number: string;
  amount: number;
  payment_type: string;
  payment_date: string;
  description: string;
  payer_name: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contract_number?: string;
  tenant_name?: string;
  property_name?: string;
}

export function usePaymentsWithContracts(payments: Array<{ id: string }>) {
  const [paymentsWithContracts, setPaymentsWithContracts] = useState<PaymentWithContract[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["payments-with-contracts", payments.length],
    queryFn: () => PaymentService.getPaymentsWithContractDetails(),
    enabled: payments.length > 0,
  });

  useEffect(() => {
    if (data) {
      setPaymentsWithContracts(data as PaymentWithContract[]);
    } else if (payments.length > 0) {
      setPaymentsWithContracts(payments as unknown as PaymentWithContract[]);
    }
  }, [data, payments]);

  return {
    paymentsWithContracts,
    isLoading,
  };
}
