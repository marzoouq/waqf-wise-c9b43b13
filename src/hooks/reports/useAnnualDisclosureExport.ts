/**
 * Hook لتصدير الإفصاح السنوي
 */
import { supabase } from "@/integrations/supabase/client";

export function useAnnualDisclosureExport() {
  const fetchLatestDisclosure = async () => {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("*")
      .order("year", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  };

  const fetchPropertiesWithContracts = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select(`*, contracts:contracts(*)`)
      .order("name");
    
    if (error) throw error;
    return data;
  };

  const fetchDisclosureBeneficiaries = async (disclosureId: string) => {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("*")
      .eq("disclosure_id", disclosureId);
    
    if (error) throw error;
    return data || [];
  };

  return {
    fetchLatestDisclosure,
    fetchPropertiesWithContracts,
    fetchDisclosureBeneficiaries,
  };
}
