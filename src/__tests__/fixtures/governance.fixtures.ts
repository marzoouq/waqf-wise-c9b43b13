/**
 * Governance Test Fixtures - بيانات اختبار الحوكمة
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// تصديرات فارغة
export const mockGovernanceDecisions: any[] = [];
export const mockDecisionVotes: any[] = [];
export const mockBoardMembers: any[] = [];
export const mockPolicies: any[] = [];
export const mockAnnualDisclosures: any[] = [];
export const mockEligibleVoters: any[] = [];
export const mockApprovals: any[] = [];

export const mockGovernanceStats = {
  total_decisions: 0,
  approved_decisions: 0,
  rejected_decisions: 0,
  pending_decisions: 0,
  total_meetings_this_year: 0,
  avg_attendance_rate: 0,
  disclosures_published: 0,
  active_policies: 0,
};

export const governanceTestUsers: Record<string, { id: string; email: string; role: string }> = {
  nazer: { id: 'nazer-1', email: 'nazer@waqf.sa', role: 'nazer' },
  admin: { id: 'admin-1', email: 'admin@waqf.sa', role: 'admin' },
  boardMember: { id: 'board-1', email: 'board@waqf.sa', role: 'board_member' },
};

export const mockOrganizationSettings = {};
export const mockVisibilitySettings = {};
export const createDecisionInput = {};
export const castVoteInput = {};
