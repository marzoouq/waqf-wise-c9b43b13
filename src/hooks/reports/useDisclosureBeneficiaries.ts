/**
 * Hook لجلب المستفيدين من الإفصاح
 */
import { supabase } from "@/integrations/supabase/client";

export function useDisclosureBeneficiaries() {
  const fetchDisclosureBeneficiaries = async (disclosureId: string) => {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("*")
      .eq("disclosure_id", disclosureId);
    
    if (error) throw error;
    return data || [];
  };

  return {
    fetchDisclosureBeneficiaries,
  };
}
