/**
 * Hook for Payments page data fetching
 * يجلب السندات مع تفاصيل العقود
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePaymentsWithContracts(payments: any[]) {
  const [paymentsWithContracts, setPaymentsWithContracts] = useState<PaymentWithContract[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["payments-with-contracts", payments.length],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments_with_contract_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PaymentWithContract[];
    },
    enabled: payments.length > 0,
  });

  useEffect(() => {
    if (data) {
      setPaymentsWithContracts(data);
    } else if (payments.length > 0) {
      setPaymentsWithContracts(payments as PaymentWithContract[]);
    }
  }, [data, payments]);

  return {
    paymentsWithContracts,
    isLoading,
  };
}
