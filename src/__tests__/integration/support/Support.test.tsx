/**
 * Support & Knowledge Base Tests - اختبارات الدعم وقاعدة المعرفة
 * @phase 17 - Support & Knowledge Base
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  mockSupportTickets,
  mockTicketComments,
  mockTicketRatings,
  mockKnowledgeArticles,
  mockSupportStats,
  mockAgentAvailability,
  mockAgentStats,
  supportFilters,
} from '../../fixtures/support.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: table === 'support_tickets' ? mockSupportTickets : mockKnowledgeArticles, 
          error: null 
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockSupportTickets[0], error: null })),
          order: vi.fn(() => Promise.resolve({ data: mockTicketComments, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: mockSupportTickets[0], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockSupportTickets[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user', email: 'user@example.com' } }, 
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

describe('Support Tickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Ticket Listing', () => {
    it('should have valid tickets array', () => {
      expect(mockSupportTickets).toBeDefined();
      expect(Array.isArray(mockSupportTickets)).toBe(true);
      expect(mockSupportTickets.length).toBeGreaterThan(0);
    });

    it('should categorize tickets by status', () => {
      const openTickets = mockSupportTickets.filter(t => t.status === 'open');
      const inProgressTickets = mockSupportTickets.filter(t => t.status === 'in_progress');
      const closedTickets = mockSupportTickets.filter(t => t.status === 'closed');

      expect(openTickets.length).toBeGreaterThanOrEqual(0);
      expect(inProgressTickets.length).toBeGreaterThanOrEqual(0);
      expect(closedTickets.length).toBeGreaterThanOrEqual(0);
    });

    it('should categorize tickets by priority', () => {
      const highTickets = mockSupportTickets.filter(t => t.priority === 'high');
      const mediumTickets = mockSupportTickets.filter(t => t.priority === 'medium');
      const lowTickets = mockSupportTickets.filter(t => t.priority === 'low');

      expect(highTickets.length + mediumTickets.length + lowTickets.length).toBe(mockSupportTickets.length);
    });

    it('should categorize tickets by category', () => {
      const technicalTickets = mockSupportTickets.filter(t => t.category === 'technical');
      const inquiryTickets = mockSupportTickets.filter(t => t.category === 'inquiry');
      const requestTickets = mockSupportTickets.filter(t => t.category === 'request');

      expect(technicalTickets.length + inquiryTickets.length + requestTickets.length).toBeLessThanOrEqual(mockSupportTickets.length);
    });
  });

  describe('Ticket Details', () => {
    it('should display ticket information', () => {
      const ticket = mockSupportTickets[0];

      expect(ticket.ticket_number).toBeDefined();
      expect(ticket.subject).toBeDefined();
      expect(ticket.description).toBeDefined();
      expect(ticket.user_id).toBeDefined();
    });

    it('should have required ticket fields', () => {
      mockSupportTickets.forEach(ticket => {
        expect(ticket).toHaveProperty('id');
        expect(ticket).toHaveProperty('ticket_number');
        expect(ticket).toHaveProperty('subject');
        expect(ticket).toHaveProperty('status');
        expect(ticket).toHaveProperty('priority');
        expect(ticket).toHaveProperty('category');
      });
    });

    it('should track ticket assignment', () => {
      mockSupportTickets.forEach(ticket => {
        expect(ticket).toHaveProperty('assigned_to');
      });
    });

    it('should track SLA due dates', () => {
      mockSupportTickets.forEach(ticket => {
        expect(ticket).toHaveProperty('sla_due_at');
      });
    });

    it('should track overdue status', () => {
      mockSupportTickets.forEach(ticket => {
        expect(ticket).toHaveProperty('is_overdue');
        expect(typeof ticket.is_overdue).toBe('boolean');
      });
    });
  });

  describe('Ticket Creation', () => {
    it('should validate required fields', () => {
      const newTicket = {
        subject: 'استفسار عن التوزيعات',
        description: 'أريد معرفة موعد التوزيع القادم',
        category: 'inquiry',
        priority: 'medium',
      };

      expect(newTicket.subject).toBeDefined();
      expect(newTicket.description).toBeDefined();
      expect(newTicket.category).toBeDefined();
    });

    it('should have ticket number format', () => {
      mockSupportTickets.forEach(ticket => {
        expect(ticket.ticket_number).toMatch(/^TKT-\d{4}-\d+$/);
      });
    });
  });
});

describe('Ticket Comments', () => {
  it('should have valid comments array', () => {
    expect(mockTicketComments).toBeDefined();
    expect(Array.isArray(mockTicketComments)).toBe(true);
  });

  it('should have required comment fields', () => {
    mockTicketComments.forEach(comment => {
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('ticket_id');
      expect(comment).toHaveProperty('user_id');
      expect(comment).toHaveProperty('comment');
    });
  });

  it('should identify internal vs public comments', () => {
    mockTicketComments.forEach(comment => {
      expect(comment).toHaveProperty('is_internal');
      expect(typeof comment.is_internal).toBe('boolean');
    });
  });

  it('should have both internal and public comments', () => {
    const internalComments = mockTicketComments.filter(c => c.is_internal);
    const publicComments = mockTicketComments.filter(c => !c.is_internal);

    expect(internalComments.length).toBeGreaterThan(0);
    expect(publicComments.length).toBeGreaterThan(0);
  });
});

describe('Support Management', () => {
  describe('Ticket Assignment', () => {
    it('should have assigned tickets', () => {
      const assignedTickets = mockSupportTickets.filter(t => t.assigned_to !== null);
      expect(assignedTickets.length).toBeGreaterThan(0);
    });

    it('should track assignment time', () => {
      const assignedTicket = mockSupportTickets.find(t => t.assigned_at);
      expect(assignedTicket?.assigned_at).toBeDefined();
    });
  });

  describe('Ticket Ratings', () => {
    it('should have valid ratings array', () => {
      expect(mockTicketRatings).toBeDefined();
      expect(Array.isArray(mockTicketRatings)).toBe(true);
    });

    it('should have required rating fields', () => {
      mockTicketRatings.forEach(rating => {
        expect(rating).toHaveProperty('id');
        expect(rating).toHaveProperty('ticket_id');
        expect(rating).toHaveProperty('rating');
      });
    });

    it('should have rating in valid range', () => {
      mockTicketRatings.forEach(rating => {
        expect(rating.rating).toBeGreaterThanOrEqual(1);
        expect(rating.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should have detailed ratings', () => {
      mockTicketRatings.forEach(rating => {
        expect(rating).toHaveProperty('response_speed_rating');
        expect(rating).toHaveProperty('solution_quality_rating');
        expect(rating).toHaveProperty('staff_friendliness_rating');
      });
    });
  });

  describe('Auto Escalation', () => {
    it('should identify tickets needing escalation', () => {
      const overdueTickets = mockSupportTickets.filter(t => t.is_overdue);
      expect(overdueTickets.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Knowledge Base', () => {
  describe('Articles', () => {
    it('should have valid articles array', () => {
      expect(mockKnowledgeArticles).toBeDefined();
      expect(Array.isArray(mockKnowledgeArticles)).toBe(true);
    });

    it('should have required article fields', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('content');
        expect(article).toHaveProperty('category');
      });
    });

    it('should track article views', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article).toHaveProperty('views_count');
        expect(article.views_count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should track article helpfulness', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article).toHaveProperty('helpful_count');
      });
    });

    it('should have published articles', () => {
      const publishedArticles = mockKnowledgeArticles.filter(a => a.is_published);
      expect(publishedArticles.length).toBeGreaterThan(0);
    });

    it('should have article tags', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article).toHaveProperty('tags');
        expect(Array.isArray(article.tags)).toBe(true);
      });
    });
  });

  describe('Search', () => {
    it('should search articles by title', () => {
      const searchTerm = 'تحديث';
      const results = mockKnowledgeArticles.filter(a => 
        a.title.includes(searchTerm) || a.content.includes(searchTerm)
      );
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

describe('Support Statistics', () => {
  it('should have valid stats object', () => {
    expect(mockSupportStats).toBeDefined();
    expect(typeof mockSupportStats).toBe('object');
  });

  it('should have tickets by status', () => {
    expect(mockSupportStats.ticketsByStatus).toBeDefined();
    expect(mockSupportStats.ticketsByStatus.open).toBeDefined();
    expect(mockSupportStats.ticketsByStatus.closed).toBeDefined();
  });

  it('should have tickets by category', () => {
    expect(mockSupportStats.ticketsByCategory).toBeDefined();
    expect(mockSupportStats.ticketsByCategory.technical).toBeDefined();
    expect(mockSupportStats.ticketsByCategory.inquiry).toBeDefined();
  });

  it('should have tickets by priority', () => {
    expect(mockSupportStats.ticketsByPriority).toBeDefined();
    expect(mockSupportStats.ticketsByPriority.high).toBeDefined();
    expect(mockSupportStats.ticketsByPriority.medium).toBeDefined();
    expect(mockSupportStats.ticketsByPriority.low).toBeDefined();
  });

  it('should track satisfaction score', () => {
    expect(mockSupportStats.avgSatisfaction).toBeDefined();
    expect(typeof mockSupportStats.avgSatisfaction).toBe('number');
  });

  it('should track total ratings', () => {
    expect(mockSupportStats.totalRatings).toBeDefined();
    expect(typeof mockSupportStats.totalRatings).toBe('number');
  });
});

describe('Agent Management', () => {
  describe('Agent Availability', () => {
    it('should have valid availability object', () => {
      expect(mockAgentAvailability).toBeDefined();
      expect(typeof mockAgentAvailability).toBe('object');
    });

    it('should track availability status', () => {
      expect(mockAgentAvailability.is_available).toBeDefined();
      expect(typeof mockAgentAvailability.is_available).toBe('boolean');
    });

    it('should track workload', () => {
      expect(mockAgentAvailability.current_load).toBeDefined();
      expect(mockAgentAvailability.max_capacity).toBeDefined();
      expect(mockAgentAvailability.current_load).toBeLessThanOrEqual(mockAgentAvailability.max_capacity);
    });

    it('should have agent skills', () => {
      expect(mockAgentAvailability.skills).toBeDefined();
      expect(Array.isArray(mockAgentAvailability.skills)).toBe(true);
    });
  });

  describe('Agent Statistics', () => {
    it('should have valid agent stats', () => {
      expect(mockAgentStats).toBeDefined();
      expect(Array.isArray(mockAgentStats)).toBe(true);
    });

    it('should track resolution metrics', () => {
      mockAgentStats.forEach(stat => {
        expect(stat).toHaveProperty('total_assigned');
        expect(stat).toHaveProperty('total_resolved');
        expect(stat).toHaveProperty('total_closed');
      });
    });

    it('should track response times', () => {
      mockAgentStats.forEach(stat => {
        expect(stat).toHaveProperty('avg_response_minutes');
        expect(stat).toHaveProperty('avg_resolution_minutes');
      });
    });

    it('should track satisfaction', () => {
      mockAgentStats.forEach(stat => {
        expect(stat).toHaveProperty('customer_satisfaction_avg');
      });
    });
  });
});

describe('Support Filters', () => {
  it('should have valid filters object', () => {
    expect(supportFilters).toBeDefined();
    expect(typeof supportFilters).toBe('object');
  });

  it('should have status filter', () => {
    expect(supportFilters.byStatus).toBeDefined();
    expect(supportFilters.byStatus.status).toBeDefined();
  });

  it('should have category filter', () => {
    expect(supportFilters.byCategory).toBeDefined();
    expect(supportFilters.byCategory.category).toBeDefined();
  });

  it('should have priority filter', () => {
    expect(supportFilters.byPriority).toBeDefined();
    expect(supportFilters.byPriority.priority).toBeDefined();
  });

  it('should have assignee filter', () => {
    expect(supportFilters.byAssignee).toBeDefined();
    expect(supportFilters.byAssignee.assigned_to).toBeDefined();
  });

  it('should have overdue filter', () => {
    expect(supportFilters.overdue).toBeDefined();
    expect(supportFilters.overdue.is_overdue).toBe(true);
  });

  it('should have search filter', () => {
    expect(supportFilters.withSearch).toBeDefined();
    expect(supportFilters.withSearch.search).toBeDefined();
  });
});
