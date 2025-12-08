/**
 * Hook for BankTransfers data fetching
 * يجلب التوزيعات المعتمدة للتصدير البنكي
 */

import { useQuery } from "@tanstack/react-query";
import { FundService } from "@/services/fund.service";

export interface ApprovedDistribution {
  id: string;
  distribution_date: string;
  total_amount: number;
  status: string;
  distribution_details: {
    beneficiary_id: string;
    allocated_amount: number;
    beneficiaries: {
      full_name: string;
      bank_account_number: string | null;
      iban: string | null;
    };
  }[];
}

export function useBankTransfersData() {
  const { data: distributions = [], isLoading, error } = useQuery({
    queryKey: ["approved-distributions"],
    queryFn: () => FundService.getApprovedDistributions(),
  });

  return {
    distributions: distributions as ApprovedDistribution[],
    isLoading,
    error,
  };
}
