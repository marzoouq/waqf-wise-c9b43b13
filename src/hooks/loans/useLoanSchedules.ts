/**
 * Loan Schedules Hook
 * @version 2.8.37
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoanSchedule } from "@/types/loans";

export function useLoanSchedules(loanId: string) {
  return useQuery({
    queryKey: ["loan-schedules", loanId],
    queryFn: async (): Promise<LoanSchedule[]> => {
      const { data, error } = await supabase
        .from("loan_schedules")
        .select("*")
        .eq("loan_id", loanId)
        .order("installment_number");

      if (error) throw error;
      return data as LoanSchedule[];
    },
    enabled: !!loanId,
  });
}
