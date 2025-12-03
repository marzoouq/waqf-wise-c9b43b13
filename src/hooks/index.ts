/**
 * Barrel exports for all hooks
 * تصدير مركزي لجميع الـ Hooks
 * 
 * يمكن الاستيراد من:
 * 1. المجلد الرئيسي: @/hooks
 * 2. المجلدات الفرعية: @/hooks/auth, @/hooks/beneficiary, etc.
 * 3. الملفات المباشرة: @/hooks/useAuth
 */

// ==================== UI & Utility ====================
export * from './use-toast';
export * from './use-mobile';
export { useMediaQuery } from './use-media-query';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { usePrint } from './usePrint';
export { useExport } from './useExport';
export { useExportToExcel } from './useExportToExcel';
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';
export { useDebouncedCallback } from './useDebouncedCallback';
export { useThrottledCallback } from './useThrottledCallback';
export { useTableSort } from './useTableSort';
export { useBulkSelection } from './useBulkSelection';
export { useCrudDialog } from './useCrudDialog';
export { useImageOptimization } from './useImageOptimization';
export { useTranslation } from './useTranslation';

// ==================== Auth & Security ====================
export { useAuth } from './useAuth';
export { useBiometricAuth } from './useBiometricAuth';
export { useActiveSessions } from './useActiveSessions';
export { useLeakedPassword } from './useLeakedPassword';
export { useIdleTimeout } from './useIdleTimeout';
export { usePermissions } from './usePermissions';
export { useUserRole } from './useUserRole';

// ==================== Beneficiary ====================
export { useBeneficiaries } from './useBeneficiaries';
export { useBeneficiaryProfile } from './useBeneficiaryProfile';
export { useBeneficiaryRequests } from './useBeneficiaryRequests';
export { useBeneficiaryAttachments } from './useBeneficiaryAttachments';
export { useBeneficiaryActivityLog } from './useBeneficiaryActivityLog';
export { useBeneficiaryCategories } from './useBeneficiaryCategories';
export { useBeneficiariesFilters } from './useBeneficiariesFilters';
export { useBeneficiaryEmergencyAid } from './useBeneficiaryEmergencyAid';
export { useBeneficiaryLoans } from './useBeneficiaryLoans';
export { useFamilies } from './useFamilies';
export { useTribes } from './useTribes';
export { useEligibilityAssessment } from './useEligibilityAssessment';
export { useWaqfSummary } from './useWaqfSummary';
export { useMyBeneficiaryRequests } from './useMyBeneficiaryRequests';

// ==================== Accounting ====================
export { useJournalEntries } from './useJournalEntries';
export { useAccounts } from './useAccounts';
export { useAccountingStats } from './useAccountingStats';
export { useAccountingTabs } from './useAccountingTabs';
export { useAccountingFilters } from './useAccountingFilters';
export { useBudgets } from './useBudgets';
export { useCashFlows } from './useCashFlows';
export { useFiscalYears } from './useFiscalYears';
export { useAutoJournalTemplates } from './useAutoJournalTemplates';
export { useFinancialData } from './useFinancialData';
export { useFinancialAnalytics } from './useFinancialAnalytics';
export { useFinancialReports } from './useFinancialReports';

// ==================== Distribution ====================
export { useDistributions } from './useDistributions';
export { useDistributionEngine } from './useDistributionEngine';
export { useDistributionDetails } from './useDistributionDetails';
export { useDistributionSettings } from './useDistributionSettings';
export { useDistributionApprovals } from './useDistributionApprovals';
export { useBatchPayments } from './useBatchPayments';
export { useEmergencyAid } from './useEmergencyAid';

// ==================== Property ====================
export { useProperties } from './useProperties';
export { usePropertiesDialogs } from './usePropertiesDialogs';
export { usePropertiesStats } from './usePropertiesStats';
export { usePropertyUnits } from './usePropertyUnits';
export { useContracts } from './useContracts';
export { useRentalPayments } from './useRentalPayments';
export { useMaintenanceRequests } from './useMaintenanceRequests';
export { useMaintenanceSchedules } from './useMaintenanceSchedules';
export { useMaintenanceProviders } from './useMaintenanceProviders';

// ==================== Banking ====================
export { useBankAccounts } from './useBankAccounts';
export { useBankReconciliation } from './useBankReconciliation';
export { useBankMatching } from './useBankMatching';
export { usePayments } from './usePayments';
export { usePaymentVouchers } from './usePaymentVouchers';
export { useInvoices } from './useInvoices';
export { useInvoiceOCR } from './useInvoiceOCR';

// ==================== Notifications ====================
export { useNotifications } from './useNotifications';
export { useRealtimeNotifications } from './useRealtimeNotifications';
export { usePushNotifications } from './usePushNotifications';
export { useNotificationSystem } from './useNotificationSystem';
export { useDisclosureNotifications } from './useDisclosureNotifications';
export { useSmartAlerts } from './useSmartAlerts';
export { useSecurityAlerts } from './useSecurityAlerts';

// ==================== Dashboard & KPIs ====================
export { useDashboardKPIs } from './useDashboardKPIs';
export { useDashboardConfigs } from './useDashboardConfig';
export { useAdminKPIs } from './useAdminKPIs';
export { useNazerKPIs } from './useNazerKPIs';
export { useAccountantKPIs } from './useAccountantKPIs';
export { useCashierStats } from './useCashierStats';
export { useArchivistDashboard, useArchivistStats, useRecentDocuments } from './useArchivistDashboard';
export { useKPIs } from './useKPIs';
export { useAIInsights } from './useAIInsights';

// ==================== Search ====================
export { useGlobalSearch } from './useGlobalSearch';
export { useAdvancedSearch } from './useAdvancedSearch';
export { useIntelligentSearch } from './useIntelligentSearch';
export { useSavedSearches } from './useSavedSearches';
export { useSavedFilters } from './useSavedFilters';

// ==================== Support & Messages ====================
export { useSupportTickets } from './useSupportTickets';
export { useSupportStats } from './useSupportStats';
export { useTicketComments } from './useTicketComments';
export { useTicketRating } from './useTicketRatings';
export { useMessages } from './useMessages';
export { useInternalMessages } from './useInternalMessages';
export { useChatbot } from './useChatbot';
export { useKnowledgeBase } from './useKnowledgeBase';
export { useContactForm } from './useContactForm';
export { useAgentAvailability, useUpdateAvailability, useAgentStats, useEscalations, useAssignmentSettings } from './useAgentAvailability';

// ==================== Archive & Documents ====================
export { useDocuments } from './useDocuments';
export { useDocumentUpload } from './useDocumentUpload';
export { useDocumentVersions } from './useDocumentVersions';
export { useDocumentTags } from './useDocumentTags';
export { useFolders } from './useFolders';
export { useArchiveStats } from './useArchiveStats';

// ==================== Loans ====================
export { useLoans } from './useLoans';
export { useLoanInstallments } from './useLoanInstallments';
export { useLoanPayments } from './useLoanPayments';

// ==================== Approvals ====================
export { useApprovals } from './useApprovals';
export { useApprovalHistory } from './useApprovalHistory';
export { useApprovalWorkflows } from './useApprovalWorkflows';
export { useApprovalPermissions } from './useApprovalPermissions';
export { usePendingApprovals } from './usePendingApprovals';
export { useRequestApprovals } from './useRequestApprovals';

// ==================== System & Admin ====================
export { useSystemSettings } from './useSystemSettings';
export { useSystemHealth } from './useSystemHealth';
export { useSystemPerformanceMetrics } from './useSystemPerformanceMetrics';
export { useAuditLogs } from './useAuditLogs';
export { useActivities } from './useActivities';
export { useBackup } from './useBackup';
export { useUsersManagement, useUsersQuery, useDeleteUser, useUpdateUserRoles, useUpdateUserStatus, useResetUserPassword, type UserProfile } from './useUsersManagement';
export { useUsersActivityMetrics } from './useUsersActivityMetrics';
export { useOrganizationSettings } from './useOrganizationSettings';
export { useVisibilitySettings } from './useVisibilitySettings';
export { useProfile } from './useProfile';
export { useAlertCleanup } from './useAlertCleanup';
export { useSelfHealing } from './useSelfHealing';
export { useQueryPrefetch } from './useQueryPrefetch';
export { useSystemMonitoring } from './useSystemMonitoring';
export { usePermissionsManagement } from './usePermissionsManagement';
export { useRolesManagement } from './useRolesManagement';

// ==================== Governance ====================
export { useGovernanceDecisions } from './useGovernanceDecisions';
export { useGovernanceVoting } from './useGovernanceVoting';
export { useGovernanceData } from './useGovernanceData';
export { useFunds } from './useFunds';
export { useWaqfUnits } from './useWaqfUnits';
export { useWaqfBudgets } from './useWaqfBudgets';
export { useAnnualDisclosures, useDisclosureBeneficiaries } from './useAnnualDisclosures';
export { useFiscalYearClosings } from './useFiscalYearClosings';

// ==================== Reports ====================
export { useReports } from './useReports';
export { useCustomReports } from './useCustomReports';
export { useScheduledReports } from './useScheduledReports';
export { useProjectDocumentation } from './useProjectDocumentation';

// ==================== Requests ====================
export { useRequests } from './useRequests';
export { useRequestAttachments } from './useRequestAttachments';
export { useRequestComments } from './useRequestComments';
export { useTasks } from './useTasks';
export { useRequestsPage } from './useRequestsPage';

// ==================== Page Hooks ====================
export { useFamiliesPage } from './useFamiliesPage';
export { useInvoicesPage } from './useInvoicesPage';
