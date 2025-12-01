import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EmergencyAid } from "@/types/loans";

export function useBeneficiaryEmergencyAid() {
  const { user } = useAuth();

  const { data: emergencyAids = [], isLoading } = useQuery({
    queryKey: ["beneficiary-emergency-aid", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get beneficiary_id for current user
      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from("beneficiaries")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (beneficiaryError || !beneficiary) return [];

      // Fetch emergency aid for this beneficiary
      const { data, error } = await supabase
        .from("emergency_aid")
        .select("*")
        .eq("beneficiary_id", beneficiary.id)
        .order("requested_date", { ascending: false });

      if (error) throw error;
      return data as EmergencyAid[] || [];
    },
    enabled: !!user?.id,
  });

  // Calculate total aid amount
  const totalAidAmount = emergencyAids.reduce((sum, aid) => sum + (aid.amount || 0), 0);

  return {
    emergencyAids,
    totalAidAmount,
    isLoading,
    hasEmergencyAid: emergencyAids.length > 0,
  };
}
