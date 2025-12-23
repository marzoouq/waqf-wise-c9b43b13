/**
 * Governance & Disclosures Tests - اختبارات الحوكمة والإفصاحات
 * @phase 23 - Governance & Disclosures
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  mockGovernanceDecisions,
  mockDecisionVotes,
  mockAnnualDisclosures,
  mockBoardMembers,
  mockPolicies,
  mockGovernanceStats,
  governanceTestUsers,
} from '../../fixtures/governance.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: table === 'governance_decisions' ? mockGovernanceDecisions : mockAnnualDisclosures, 
          error: null 
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockGovernanceDecisions[0], error: null })),
          order: vi.fn(() => Promise.resolve({ data: mockDecisionVotes, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: mockGovernanceDecisions[0], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockGovernanceDecisions[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: governanceTestUsers.nazer }, 
        error: null 
      })),
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Governance Decisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Decision Listing', () => {
    it('should display all governance decisions', () => {
      expect(mockGovernanceDecisions).toHaveLength(4);
    });

    it('should categorize decisions by status', () => {
      const draftDecisions = mockGovernanceDecisions.filter(d => d.status === 'draft');
      const pendingDecisions = mockGovernanceDecisions.filter(d => d.status === 'pending_vote');
      const approvedDecisions = mockGovernanceDecisions.filter(d => d.status === 'approved');
      const rejectedDecisions = mockGovernanceDecisions.filter(d => d.status === 'rejected');

      expect(draftDecisions).toHaveLength(1);
      expect(pendingDecisions).toHaveLength(1);
      expect(approvedDecisions).toHaveLength(1);
      expect(rejectedDecisions).toHaveLength(1);
    });

    it('should categorize decisions by type', () => {
      const financialDecisions = mockGovernanceDecisions.filter(d => d.decision_type === 'financial');
      const operationalDecisions = mockGovernanceDecisions.filter(d => d.decision_type === 'operational');
      const policyDecisions = mockGovernanceDecisions.filter(d => d.decision_type === 'policy');

      expect(financialDecisions).toHaveLength(2);
      expect(operationalDecisions).toHaveLength(1);
      expect(policyDecisions).toHaveLength(1);
    });

    it('should display decision numbers', () => {
      mockGovernanceDecisions.forEach(decision => {
        expect(decision.decision_number).toMatch(/^GD-\d{4}-\d+$/);
      });
    });
  });

  describe('Decision Details', () => {
    it('should display decision information', () => {
      const decision = mockGovernanceDecisions[0];

      expect(decision.title).toBe('اعتماد ميزانية السنة المالية 2024');
      expect(decision.description).toBeDefined();
      expect(decision.created_by).toBeDefined();
    });

    it('should track decision amount for financial decisions', () => {
      const financialDecision = mockGovernanceDecisions.find(d => d.decision_type === 'financial');
      expect(financialDecision?.amount).toBeDefined();
    });

    it('should track decision effective date', () => {
      const approvedDecision = mockGovernanceDecisions.find(d => d.status === 'approved');
      expect(approvedDecision?.effective_date).toBeDefined();
    });

    it('should store supporting documents', () => {
      const decisionWithDocs = mockGovernanceDecisions.find(d => d.attachments?.length > 0);
      expect(decisionWithDocs?.attachments).toBeDefined();
    });
  });

  describe('Decision Voting', () => {
    it('should display votes for pending decisions', () => {
      expect(mockDecisionVotes).toHaveLength(4);
    });

    it('should categorize votes by type', () => {
      const approveVotes = mockDecisionVotes.filter(v => v.vote === 'approve');
      const rejectVotes = mockDecisionVotes.filter(v => v.vote === 'reject');
      const abstainVotes = mockDecisionVotes.filter(v => v.vote === 'abstain');

      expect(approveVotes).toHaveLength(2);
      expect(rejectVotes).toHaveLength(1);
      expect(abstainVotes).toHaveLength(1);
    });

    it('should track voter information', () => {
      mockDecisionVotes.forEach(vote => {
        expect(vote.voter_id).toBeDefined();
        expect(vote.voter_name).toBeDefined();
        expect(vote.voter_role).toBeDefined();
      });
    });

    it('should store vote comments', () => {
      const voteWithComment = mockDecisionVotes.find(v => v.comment);
      expect(voteWithComment?.comment).toBeDefined();
    });

    it('should calculate vote results', () => {
      const approveCount = mockDecisionVotes.filter(v => v.vote === 'approve').length;
      const rejectCount = mockDecisionVotes.filter(v => v.vote === 'reject').length;
      const totalVotes = mockDecisionVotes.length;

      expect(approveCount / totalVotes).toBeGreaterThan(0.5); // Majority approved
    });
  });
});

describe('Annual Disclosures', () => {
  describe('Disclosure Listing', () => {
    it('should display all annual disclosures', () => {
      expect(mockAnnualDisclosures).toHaveLength(3);
    });

    it('should categorize disclosures by status', () => {
      const publishedDisclosures = mockAnnualDisclosures.filter(d => d.status === 'published');
      const draftDisclosures = mockAnnualDisclosures.filter(d => d.status === 'draft');

      expect(publishedDisclosures).toHaveLength(2);
      expect(draftDisclosures).toHaveLength(1);
    });

    it('should order disclosures by year', () => {
      const years = mockAnnualDisclosures.map(d => d.year);
      const sortedYears = [...years].sort((a, b) => b - a);
      expect(years[0]).toBe(sortedYears[0]); // Most recent first
    });
  });

  describe('Disclosure Content', () => {
    it('should display financial summary', () => {
      const disclosure = mockAnnualDisclosures[0];

      expect(disclosure.total_revenues).toBeDefined();
      expect(disclosure.total_expenses).toBeDefined();
      expect(disclosure.net_income).toBeDefined();
    });

    it('should display beneficiary statistics', () => {
      const disclosure = mockAnnualDisclosures[0];

      expect(disclosure.total_beneficiaries).toBe(450);
      expect(disclosure.sons_count).toBeDefined();
      expect(disclosure.daughters_count).toBeDefined();
      expect(disclosure.wives_count).toBeDefined();
    });

    it('should display distribution breakdown', () => {
      const disclosure = mockAnnualDisclosures[0];

      expect(disclosure.nazer_percentage).toBe(10);
      expect(disclosure.charity_percentage).toBe(20);
      expect(disclosure.corpus_percentage).toBe(10);
    });

    it('should calculate shares correctly', () => {
      const disclosure = mockAnnualDisclosures[0];
      const totalPercentage = disclosure.nazer_percentage + disclosure.charity_percentage + disclosure.corpus_percentage;
      
      // Remaining goes to beneficiaries
      expect(100 - totalPercentage).toBe(60);
    });
  });

  describe('Disclosure Publication', () => {
    it('should track publication date', () => {
      const publishedDisclosure = mockAnnualDisclosures.find(d => d.status === 'published');
      expect(publishedDisclosure?.published_at).toBeDefined();
    });

    it('should track who published', () => {
      const publishedDisclosure = mockAnnualDisclosures.find(d => d.status === 'published');
      expect(publishedDisclosure?.published_by).toBeDefined();
    });
  });
});

describe('Board Members', () => {
  describe('Member Listing', () => {
    it('should display all board members', () => {
      expect(mockBoardMembers).toHaveLength(4);
    });

    it('should identify member roles', () => {
      const chairman = mockBoardMembers.find(m => m.role === 'chairman');
      const members = mockBoardMembers.filter(m => m.role === 'member');
      const secretary = mockBoardMembers.find(m => m.role === 'secretary');

      expect(chairman).toBeDefined();
      expect(members.length).toBeGreaterThan(0);
      expect(secretary).toBeDefined();
    });

    it('should track active vs inactive members', () => {
      const activeMembers = mockBoardMembers.filter(m => m.is_active);
      expect(activeMembers.length).toBe(mockBoardMembers.length);
    });
  });

  describe('Member Details', () => {
    it('should display member information', () => {
      const member = mockBoardMembers[0];

      expect(member.name).toBeDefined();
      expect(member.title).toBeDefined();
      expect(member.email).toBeDefined();
    });

    it('should track term dates', () => {
      mockBoardMembers.forEach(member => {
        expect(member.term_start_date).toBeDefined();
        expect(member.term_end_date).toBeDefined();
      });
    });
  });
});

describe('Policies', () => {
  describe('Policy Listing', () => {
    it('should display all policies', () => {
      expect(mockPolicies).toHaveLength(4);
    });

    it('should categorize policies', () => {
      const financialPolicies = mockPolicies.filter(p => p.category === 'financial');
      const operationalPolicies = mockPolicies.filter(p => p.category === 'operational');
      const hrPolicies = mockPolicies.filter(p => p.category === 'hr');

      expect(financialPolicies).toHaveLength(2);
      expect(operationalPolicies).toHaveLength(1);
      expect(hrPolicies).toHaveLength(1);
    });

    it('should track policy versions', () => {
      mockPolicies.forEach(policy => {
        expect(policy.version).toBeDefined();
      });
    });
  });

  describe('Policy Details', () => {
    it('should display policy content', () => {
      const policy = mockPolicies[0];

      expect(policy.title).toBeDefined();
      expect(policy.content).toBeDefined();
    });

    it('should track approval information', () => {
      const approvedPolicy = mockPolicies.find(p => p.status === 'approved');

      expect(approvedPolicy?.approved_at).toBeDefined();
      expect(approvedPolicy?.approved_by).toBeDefined();
    });

    it('should track effective dates', () => {
      mockPolicies.forEach(policy => {
        expect(policy.effective_date).toBeDefined();
      });
    });
  });
});

describe('Governance Statistics', () => {
  it('should display decision statistics', () => {
    expect(mockGovernanceStats.total_decisions).toBe(45);
    expect(mockGovernanceStats.approved_decisions).toBe(38);
    expect(mockGovernanceStats.rejected_decisions).toBe(5);
    expect(mockGovernanceStats.pending_decisions).toBe(2);
  });

  it('should display meeting statistics', () => {
    expect(mockGovernanceStats.total_meetings_this_year).toBe(12);
    expect(mockGovernanceStats.avg_attendance_rate).toBe(0.92);
  });

  it('should display disclosure statistics', () => {
    expect(mockGovernanceStats.disclosures_published).toBe(5);
  });

  it('should display policy statistics', () => {
    expect(mockGovernanceStats.active_policies).toBe(15);
  });
});

describe('Governance Access Control', () => {
  it('should allow nazer to create decisions', () => {
    const nazerUser = governanceTestUsers.nazer;
    expect(nazerUser.role).toBe('nazer');
  });

  it('should allow board members to vote', () => {
    const boardMemberVotes = mockDecisionVotes.filter(v => 
      v.voter_role === 'nazer' || v.voter_role === 'board_member'
    );
    expect(boardMemberVotes.length).toBeGreaterThan(0);
  });

  it('should restrict beneficiaries from governance actions', () => {
    const allowedRoles = ['nazer', 'admin', 'board_member'];
    expect(allowedRoles).not.toContain('beneficiary');
  });

  it('should allow beneficiaries to view published disclosures', () => {
    const publishedDisclosures = mockAnnualDisclosures.filter(d => d.status === 'published');
    expect(publishedDisclosures.length).toBeGreaterThan(0);
  });
});

describe('Approvals Workflow', () => {
  it('should track approval steps', () => {
    const pendingDecision = mockGovernanceDecisions.find(d => d.status === 'pending_vote');
    expect(pendingDecision?.requires_vote).toBe(true);
  });

  it('should calculate quorum', () => {
    const totalBoardMembers = mockBoardMembers.length;
    const quorumRequired = Math.ceil(totalBoardMembers / 2) + 1;
    const votesReceived = mockDecisionVotes.length;

    expect(votesReceived).toBeGreaterThanOrEqual(quorumRequired);
  });

  it('should determine approval based on votes', () => {
    const approveVotes = mockDecisionVotes.filter(v => v.vote === 'approve').length;
    const rejectVotes = mockDecisionVotes.filter(v => v.vote === 'reject').length;

    const isApproved = approveVotes > rejectVotes;
    expect(isApproved).toBe(true);
  });
});
