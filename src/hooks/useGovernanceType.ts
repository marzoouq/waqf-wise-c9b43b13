import { useOrganizationSettings } from "./useOrganizationSettings";
import type { GovernanceType } from "@/types/waqf";

export function useGovernanceType() {
  const { settings, isLoading } = useOrganizationSettings();
  
  const governanceType = (settings?.governance_type as GovernanceType) || 'nazer_only';
  const hasBoard = governanceType === 'nazer_with_board';
  const nazerOnly = governanceType === 'nazer_only';
  
  const nazerInfo = settings ? {
    name: settings.nazer_name,
    title: settings.nazer_title,
    appointmentDate: settings.nazer_appointment_date,
    phone: settings.nazer_contact_phone,
    email: settings.nazer_contact_email,
  } : null;
  
  const waqfInfo = settings ? {
    type: settings.waqf_type,
    establishmentDate: settings.waqf_establishment_date,
    registrationNumber: settings.waqf_registration_number,
    deedUrl: settings.waqf_deed_url,
  } : null;
  
  return {
    governanceType,
    hasBoard,
    nazerOnly,
    nazerInfo,
    waqfInfo,
    isLoading,
  };
}
