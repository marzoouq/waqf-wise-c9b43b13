/**
 * Hook لجلب المستفيدين من الإفصاح
 * @version 2.8.67
 */
import { DisclosureService } from "@/services/disclosure.service";

export function useDisclosureBeneficiaries() {
  const fetchDisclosureBeneficiaries = async (disclosureId: string) => {
    return DisclosureService.getBeneficiaries(disclosureId);
  };

  return {
    fetchDisclosureBeneficiaries,
  };
}
