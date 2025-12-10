/**
 * Hook لتصدير الإفصاح السنوي
 * @version 2.8.65
 */
import { DisclosureService } from "@/services/disclosure.service";

export function useAnnualDisclosureExport() {
  const fetchLatestDisclosure = async () => {
    return DisclosureService.getLatest();
  };

  const fetchPropertiesWithContracts = async () => {
    return DisclosureService.getPropertiesWithContracts();
  };

  const fetchDisclosureBeneficiaries = async (disclosureId: string) => {
    return DisclosureService.getBeneficiaries(disclosureId);
  };

  return {
    fetchLatestDisclosure,
    fetchPropertiesWithContracts,
    fetchDisclosureBeneficiaries,
  };
}
