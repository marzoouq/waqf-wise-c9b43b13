/**
 * Hook لجلب مستفيدي الإفصاح
 */

import { supabase } from "@/integrations/supabase/client";

export async function getDisclosureBeneficiaries(disclosureId: string) {
  const { data, error } = await supabase
    .from("disclosure_beneficiaries")
    .select("*")
    .eq("disclosure_id", disclosureId);

  if (error) throw error;
  return data || [];
}
