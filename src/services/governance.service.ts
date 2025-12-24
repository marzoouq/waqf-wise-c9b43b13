/**
 * Governance Service - خدمة الحوكمة (Facade)
 * @version 3.0.0
 * 
 * يعيد تصدير جميع الخدمات من الملفات المقسمة للحفاظ على التوافق
 */

import { 
  GovernanceDecisionsService,
  GovernanceVotingService,
  GovernanceSettingsService,
  type EligibleVoter,
  type GovernanceDecisionInput
} from './governance';

// إعادة تصدير الأنواع
export type { EligibleVoter, GovernanceDecisionInput };

/**
 * Facade Class للحفاظ على التوافق مع الكود القديم
 */
export class GovernanceService {
  // === Decisions Operations ===
  static getDecisions = GovernanceDecisionsService.getDecisions;
  static getDecisionsPaginated = GovernanceDecisionsService.getDecisionsPaginated;
  static getDecisionById = GovernanceDecisionsService.getDecisionById;
  static createDecision = GovernanceDecisionsService.createDecision;
  static updateDecision = GovernanceDecisionsService.updateDecision;
  static deleteDecision = GovernanceDecisionsService.deleteDecision;
  static getRecentDecisions = GovernanceDecisionsService.getRecentDecisions;

  // === Voting Operations ===
  static closeVoting = GovernanceVotingService.closeVoting;
  static getVotes = GovernanceVotingService.getVotes;
  static getUserVote = GovernanceVotingService.getUserVote;
  static castVote = GovernanceVotingService.castVote;
  static getEligibleVoters = GovernanceVotingService.getEligibleVoters;

  // === Settings Operations ===
  static getVisibilitySettings = GovernanceSettingsService.getVisibilitySettings;
  static createDefaultVisibilitySettings = GovernanceSettingsService.createDefaultVisibilitySettings;
  static updateVisibilitySettings = GovernanceSettingsService.updateVisibilitySettings;
  static getOrganizationSettings = GovernanceSettingsService.getOrganizationSettings;
  static updateOrganizationSettings = GovernanceSettingsService.updateOrganizationSettings;
}
