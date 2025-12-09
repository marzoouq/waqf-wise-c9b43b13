/**
 * Disclosure Beneficiaries Hook
 * @version 2.8.40
 */

import { supabase } from "@/integrations/supabase/client";

export interface DisclosureBeneficiary {
  id: string;
  disclosure_id: string;
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_type: string;
  relationship: string;
  allocated_amount: number;
  payments_count: number;
  created_at: string;
}

export function useDisclosureBeneficiaries() {
  const fetchDisclosureBeneficiaries = async (disclosureId: string) => {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("*")
      .eq("disclosure_id", disclosureId);
    
    if (error) throw error;
    return data as DisclosureBeneficiary[];
  };

  return { fetchDisclosureBeneficiaries };
}
