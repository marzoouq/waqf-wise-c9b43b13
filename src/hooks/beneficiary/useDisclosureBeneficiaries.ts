/**
 * Disclosure Beneficiaries Hook
 * @version 2.8.44
 */

import { DistributionService } from "@/services";

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
    return DistributionService.getDisclosureBeneficiaries(disclosureId) as Promise<DisclosureBeneficiary[]>;
  };

  return { fetchDisclosureBeneficiaries };
}
