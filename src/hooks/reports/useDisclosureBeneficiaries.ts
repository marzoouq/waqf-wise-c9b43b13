/**
 * Hook لجلب المستفيدين من الإفصاح
 * @version 2.9.0
 */
import { DisclosureService } from "@/services/disclosure.service";

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
  const fetchDisclosureBeneficiaries = async (disclosureId: string): Promise<DisclosureBeneficiary[]> => {
    return DisclosureService.getDisclosureBeneficiaries(disclosureId) as Promise<DisclosureBeneficiary[]>;
  };

  return {
    fetchDisclosureBeneficiaries,
  };
}
