/**
 * Beneficiary Hooks - خطافات المستفيدين
 * جميع hooks المستفيدين مُصدَّرة من مكان واحد
 * @version 2.6.33
 */

// ==================== Core Beneficiary Hooks ====================
export { useBeneficiaryId } from './useBeneficiaryId';
export { useBeneficiaryPortalData, type BeneficiaryStatistics } from './useBeneficiaryPortalData';
export { useBeneficiaryProfile } from './useBeneficiaryProfile';
export { useBeneficiaryLoans } from './useBeneficiaryLoans';
export { useBeneficiaryEmergencyAid } from './useBeneficiaryEmergencyAid';

// ==================== Data Hooks ====================
export { useBeneficiaryAccountStatementData } from './useBeneficiaryAccountStatementData';
export { useBeneficiaryPersonalReportsData } from './useBeneficiaryPersonalReportsData';

// ==================== Beneficiaries Management ====================
export { useBeneficiaries } from './useBeneficiaries';
export { useBeneficiaryRequests, type BeneficiaryRequestData } from './useBeneficiaryRequests';
export { useBeneficiaryAttachments, type BeneficiaryAttachment } from './useBeneficiaryAttachments';
export { useBeneficiaryActivityLog, type BeneficiaryActivity } from './useBeneficiaryActivityLog';
export { useBeneficiaryCategories } from '@/hooks/useBeneficiaryCategories';
export { useBeneficiariesFilters } from './useBeneficiariesFilters';
export { useEligibilityAssessment } from './useEligibilityAssessment';
export { useFamilies, useFamilyMembers } from './useFamilies';
export { useFamiliesPage, type FamilyWithHead } from './useFamiliesPage';
export { useTribes, useAddTribe, useUpdateTribe, useDeleteTribe } from './useTribes';
export { useMyBeneficiaryRequests, type BeneficiaryRequest, type RequestFormData } from './useMyBeneficiaryRequests';
export { useWaqfSummary } from './useWaqfSummary';
