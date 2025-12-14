/**
 * Governance Hooks - خطافات الحوكمة
 * @version 2.8.35
 */

export { useGovernanceData, useEligibleVoters, useRecentGovernanceDecisions } from './useGovernanceData';
export type { EligibleVoter, GovernanceDecisionInput } from './useGovernanceData';
export { useGovernanceDecisions } from './useGovernanceDecisions';
export { useGovernanceDecisionsPaginated } from './useGovernanceDecisionsPaginated';
export { useGovernanceVoting } from './useGovernanceVoting';
export { useVisibilitySettings } from './useVisibilitySettings';
export { useOrganizationSettings, type OrganizationSettings } from './useOrganizationSettings';
export { useGovernanceDecisionDetails } from './useGovernanceDecisionDetails';
