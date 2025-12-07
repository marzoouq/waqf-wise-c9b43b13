import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBeneficiaryId } from "@/hooks/beneficiary/useBeneficiaryId";

export function useBeneficiaryLoans() {
  const { beneficiaryId, isLoading: idLoading } = useBeneficiaryId();

  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ["beneficiary-loans", beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return [];

      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map database fields to expected format
      return (data || []).map(loan => ({
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
    activeLoans: loans.filter(l => l.status === "active").length,
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
