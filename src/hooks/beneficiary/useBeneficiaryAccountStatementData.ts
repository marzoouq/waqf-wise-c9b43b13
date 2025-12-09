/**
 * Hook for BeneficiaryAccountStatement data fetching
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

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

export function useBeneficiaryAccountStatementData(userId: string | undefined, filters: PaymentFilters) {
  const { data: beneficiary, isLoading: beneficiaryLoading } = useQuery({
    queryKey: QUERY_KEYS.MY_BENEFICIARY(userId),
    queryFn: async () => {
      if (!userId) return null;
      return BeneficiaryService.getAccountStatementData(userId);
    },
    enabled: !!userId,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_PAYMENTS(beneficiary?.id || '', filters.dateFrom, filters.dateTo, filters.paymentMethod),
    queryFn: async () => {
      if (!beneficiary?.id) return [];
      return BeneficiaryService.getBeneficiaryPayments(beneficiary.id, {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        paymentMethod: filters.paymentMethod,
      });
    },
    enabled: !!beneficiary?.id,
  });

  const calculateStats = (filteredPayments: BeneficiaryPayment[]) => ({
    totalPayments: filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: filteredPayments.length,
    avgPayment: filteredPayments.length > 0 ? filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0) / filteredPayments.length : 0,
    largestPayment: filteredPayments.length > 0 ? Math.max(...filteredPayments.map((p) => Number(p.amount))) : 0,
  });

  return { beneficiary, payments, isLoading: beneficiaryLoading || paymentsLoading, calculateStats };
}
