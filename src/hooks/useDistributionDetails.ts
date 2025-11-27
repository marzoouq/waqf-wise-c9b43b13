import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DistributionDetail } from "@/types/distribution/index";

export function useDistributionDetails(distributionId?: string) {
  const { data: details = [], isLoading } = useQuery({
    queryKey: ["distribution-details", distributionId],
    queryFn: async () => {
      if (!distributionId) return [];

      const { data, error } = await supabase
        .from("distribution_details")
        .select(`
          *,
          beneficiaries (
            id,
            full_name,
            beneficiary_type,
            iban,
            bank_name
          )
        `)
        .eq("distribution_id", distributionId)
        .order("allocated_amount", { ascending: false });

      if (error) throw error;
      return data as DistributionDetail[];
    },
    enabled: !!distributionId,
  });

  return {
    details,
    isLoading,
  };
}
