/**
 * Beneficiary Hooks - خطافات المستفيدين
 * جميع hooks المستفيدين مُصدَّرة من مكان واحد
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

// ==================== External Re-exports ====================
export { useBeneficiaries } from '../useBeneficiaries';
export { useBeneficiaryRequests } from '../useBeneficiaryRequests';
export { useBeneficiaryAttachments } from '../useBeneficiaryAttachments';
export { useBeneficiaryActivityLog } from '../useBeneficiaryActivityLog';
export { useBeneficiaryCategories } from '../useBeneficiaryCategories';
export { useBeneficiariesFilters } from '../useBeneficiariesFilters';
export { useEligibilityAssessment } from '../useEligibilityAssessment';
export { useFamilies } from '../useFamilies';
export { useFamiliesPage } from '../useFamiliesPage';
export { useTribes } from '../useTribes';
export { useMyBeneficiaryRequests } from '../useMyBeneficiaryRequests';
