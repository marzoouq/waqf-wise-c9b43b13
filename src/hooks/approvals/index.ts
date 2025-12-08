/**
 * Approvals Hooks - خطافات الموافقات
 * @version 2.8.3
 */

export { useApprovalsOverview, type ApprovalsStats } from './useApprovalsOverview';
export { useJournalApprovals } from './useJournalApprovals';
export { usePaymentApprovals } from './usePaymentApprovals';
export { useDistributionApprovals } from './useDistributionApprovals';
export { useRequestApprovals } from './useRequestApprovals';
export { useLoanApprovals } from './useLoanApprovals';
export { useEmergencyAidApprovals, type EmergencyRequest } from './useEmergencyAidApprovals';

// Re-exports from requests folder
export { useApprovals, type ApprovalData } from '../requests/useApprovals';
export { useApprovalHistory } from '../requests/useApprovalHistory';
export { useApprovalPermissions } from '../requests/useApprovalPermissions';
export { useApprovalWorkflows } from '../requests/useApprovalWorkflows';
