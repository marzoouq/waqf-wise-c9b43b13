import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HeirDistribution {
  id: string;
  share_amount: number;
  heir_type: string;
  distribution_date: string;
  fiscal_year_id: string;
  fiscal_years: {
    name: string;
    is_closed: boolean;
  } | null;
}

export function useBeneficiaryDistributions(beneficiaryId: string) {
  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["beneficiary-heir-distributions", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heir_distributions")
        .select(`
          id,
          share_amount,
          heir_type,
          distribution_date,
          fiscal_year_id,
          fiscal_years (
            name,
            is_closed
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return (data || []) as HeirDistribution[];
    },
    enabled: !!beneficiaryId,
  });

  const currentDistributions = distributions.filter((d: HeirDistribution) => !d.fiscal_years?.is_closed);
  const historicalDistributions = distributions.filter((d: HeirDistribution) => d.fiscal_years?.is_closed);
  
  const currentTotal = currentDistributions.reduce((sum: number, d: HeirDistribution) => sum + (d.share_amount || 0), 0);
  const historicalTotal = historicalDistributions.reduce((sum: number, d: HeirDistribution) => sum + (d.share_amount || 0), 0);
  const totalDistributed = currentTotal + historicalTotal;

  return {
    distributions,
    currentDistributions,
    historicalDistributions,
    currentTotal,
    historicalTotal,
    totalDistributed,
    isLoading,
  };
}
