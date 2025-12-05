/**
 * Hook for BeneficiaryAccountStatement data fetching
 * يجلب بيانات كشف حساب المستفيد
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BeneficiaryInfo {
  id: string;
  full_name: string;
  beneficiary_number: string | null;
  account_balance: number | null;
  total_received: number | null;
}

export interface BeneficiaryPayment {
  id: string;
  amount: number;
  payment_date: string;
  description: string | null;
  payment_method: string | null;
}

export interface PaymentFilters {
  dateFrom: string;
  dateTo: string;
  paymentMethod: string;
}

export function useBeneficiaryAccountStatementData(
  userId: string | undefined,
  filters: PaymentFilters
) {
  // جلب بيانات المستفيد
  const {
    data: beneficiary,
    isLoading: beneficiaryLoading,
  } = useQuery({
    queryKey: ["my-beneficiary", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, beneficiary_number, account_balance, total_received")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as BeneficiaryInfo;
    },
    enabled: !!userId,
  });

  // جلب المدفوعات
  const {
    data: payments = [],
    isLoading: paymentsLoading,
  } = useQuery({
    queryKey: ["beneficiary-payments", beneficiary?.id, filters.dateFrom, filters.dateTo, filters.paymentMethod],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      let query = supabase
        .from("payments")
        .select("id, amount, payment_date, description, payment_method")
        .eq("beneficiary_id", beneficiary.id)
        .order("payment_date", { ascending: false });

      if (filters.dateFrom) {
        query = query.gte("payment_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("payment_date", filters.dateTo);
      }
      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        query = query.eq("payment_method", filters.paymentMethod);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as BeneficiaryPayment[];
    },
    enabled: !!beneficiary?.id,
  });

  // حساب الإحصائيات
  const calculateStats = (filteredPayments: BeneficiaryPayment[]) => ({
    totalPayments: filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: filteredPayments.length,
    avgPayment: filteredPayments.length > 0
      ? filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0) / filteredPayments.length
      : 0,
    largestPayment: filteredPayments.length > 0
      ? Math.max(...filteredPayments.map((p) => Number(p.amount)))
      : 0,
  });

  return {
    beneficiary,
    payments,
    isLoading: beneficiaryLoading || paymentsLoading,
    calculateStats,
  };
}
