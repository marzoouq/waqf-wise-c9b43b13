// Barrel exports for hooks
export * from './use-toast';
export * from './use-mobile';
export { useAuth } from './useAuth';
export { useBeneficiaries } from './useBeneficiaries';
export { useProperties } from './useProperties';
export { useFunds } from './useFunds';
export { usePayments } from './usePayments';
export { useDistributions } from './useDistributions';
export { useJournalEntries } from './useJournalEntries';
export { useActivities } from './useActivities';
export { useTasks } from './useTasks';
export { useSavedSearches } from './useSavedSearches';
export { usePrint } from './usePrint';
export { useBeneficiariesFilters } from './useBeneficiariesFilters';
export { usePropertiesDialogs } from './usePropertiesDialogs';
export { useAccountingTabs } from './useAccountingTabs';

// New hooks for architecture improvements
export { useApprovals } from './useApprovals';
export { useApprovalHistory } from './useApprovalHistory';
export { useMessages } from './useMessages';
export { useDashboardKPIs } from './useDashboardKPIs';
export { useGlobalSearch } from './useGlobalSearch';
export { useBeneficiaryRequests } from './useBeneficiaryRequests';

// Phase 1: Approval & RBAC hooks
export { useApprovalPermissions } from './useApprovalPermissions';

// Phase 3: Shared utility hooks
export { useCrudDialog } from './useCrudDialog';

// Phase 4: Distribution & Payment hooks
export { useDistributionEngine } from './useDistributionEngine';
export { useDistributionDetails } from './useDistributionDetails';
export { useDistributionSettings } from './useDistributionSettings';
export { useBatchPayments } from './useBatchPayments';

// Phase 5: Biometric Authentication
export { useBiometricAuth } from './useBiometricAuth';
