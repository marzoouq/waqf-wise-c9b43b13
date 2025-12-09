/**
 * Loan Schedules Hook
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { LoansService } from "@/services";
import { LoanSchedule } from "@/types/loans";

export function useLoanSchedules(loanId: string) {
  return useQuery({
    queryKey: ["loan-schedules", loanId],
    queryFn: async (): Promise<LoanSchedule[]> => {
      return LoansService.getLoanSchedules(loanId) as Promise<LoanSchedule[]>;
    },
    enabled: !!loanId,
  });
}
