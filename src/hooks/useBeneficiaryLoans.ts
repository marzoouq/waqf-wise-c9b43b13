import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBeneficiaryLoans() {
  const { user } = useAuth();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["beneficiary-loans", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get beneficiary_id for current user
      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from("beneficiaries")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (beneficiaryError || !beneficiary) return [];

      // Fetch loans for this beneficiary
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("beneficiary_id", beneficiary.id)
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
    enabled: !!user?.id,
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
    isLoading,
    hasLoans: loans.length > 0,
  };
}
