/**
 * useBeneficiaryLoans Hook
 * Hook لجلب قروض المستفيد الحالي
 */

import { useQuery } from "@tanstack/react-query";
import { LoansService } from "@/services/loans.service";
import { useBeneficiaryId } from "./useBeneficiaryId";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaryLoans() {
  const { beneficiaryId, isLoading: idLoading } = useBeneficiaryId();

  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_LOANS(beneficiaryId),
    queryFn: async () => {
      if (!beneficiaryId) return [];
      const data = await LoansService.getByBeneficiary(beneficiaryId);
      
      // Map database fields to expected format
      return data.map(loan => ({
        ...loan,
        principal_amount: loan.loan_amount,
        paid_amount: loan.paid_amount || 0,
        start_date: loan.disbursement_date,
        due_date: loan.end_date,
      }));
    },
    enabled: !!beneficiaryId,
  });

  // Calculate statistics
  const statistics = {
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status === "active" || l.status === "نشط").length,
    totalAmount: loans.reduce((sum, l) => sum + (l.principal_amount || 0), 0),
    totalPaid: loans.reduce((sum, l) => sum + (l.paid_amount || 0), 0),
  };

  return {
    loans,
    statistics,
    isLoading: idLoading || loansLoading,
    hasLoans: loans.length > 0,
  };
}
