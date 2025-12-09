/**
 * Beneficiary Hooks - خطافات المستفيدين
 * جميع hooks المستفيدين مُصدَّرة من مكان واحد
 * @version 2.8.5
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
export { useBeneficiaryActivity } from './useBeneficiaryActivity';
export { useBeneficiaryDistributions } from './useBeneficiaryDistributions';
export { useBeneficiaryProperties } from './useBeneficiaryProperties';

// ==================== Beneficiaries Management ====================
export { useBeneficiaries } from './useBeneficiaries';
export { useBeneficiaryRequests, type BeneficiaryRequestData } from './useBeneficiaryRequests';
export { useBeneficiaryAttachments, type BeneficiaryAttachment } from './useBeneficiaryAttachments';
export { useBeneficiaryActivityLog, type BeneficiaryActivity as BeneficiaryActivityLogType } from './useBeneficiaryActivityLog';
export { useBeneficiaryCategories } from './useBeneficiaryCategories';
export { useBeneficiariesFilters } from './useBeneficiariesFilters';
export { useEligibilityAssessment } from './useEligibilityAssessment';
export { useFamilies, useFamilyMembers } from './useFamilies';
export { useFamiliesPage, type FamilyWithHead } from './useFamiliesPage';
export { useTribes, useAddTribe, useUpdateTribe, useDeleteTribe } from './useTribes';
export { useMyBeneficiaryRequests, type BeneficiaryRequest, type RequestFormData } from './useMyBeneficiaryRequests';
export { useWaqfSummary } from './useWaqfSummary';
export { useEmergencyAid } from './useEmergencyAid';
export { useBeneficiarySession } from './useBeneficiarySession';
export { useIdentityVerification } from './useIdentityVerification';
export { useBeneficiaryTimeline, type TimelineEvent } from './useBeneficiaryTimeline';
export { useBeneficiaryFamilyTree } from './useBeneficiaryFamilyTree';

// ==================== Tabs Data Hooks ====================
export {
  useApprovalsLog,
  useBeneficiaryBankAccounts,
  useBeneficiaryDocuments,
  useBeneficiaryStatements,
  useDisclosures,
  useDistributionChartData,
  useBeneficiaryRequestsTab,
  useYearlyComparison,
  useMonthlyRevenue,
  usePropertyStats
} from './useBeneficiaryTabsData';

// ==================== Profile Data Hooks ====================
export {
  useFamilyTree,
  useRequestDetails,
  useBeneficiaryIntegrationStats,
  useWaqfDistributionsSummary
} from './useBeneficiaryProfileData';
export type { RequestWithDetails, HeirDistribution } from './useBeneficiaryProfileData';

// ==================== Profile Components Hooks ====================
export { useBeneficiaryProfileStats, type BeneficiaryProfileStats } from './useBeneficiaryProfileStats';
export { useBeneficiaryProfileDocuments } from './useBeneficiaryProfileDocuments';
export { useBeneficiaryProfilePayments } from './useBeneficiaryProfilePayments';
export { useBeneficiaryProfileRequests } from './useBeneficiaryProfileRequests';

// ==================== Export & Disclosure Hooks ====================
export { useBeneficiaryExport, type JournalExportEntry } from './useBeneficiaryExport';
export { useDisclosureBeneficiaries, type DisclosureBeneficiary } from './useDisclosureBeneficiaries';
