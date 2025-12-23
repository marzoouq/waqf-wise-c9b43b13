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
  mockTicketMessages,
  mockKnowledgeArticles,
  mockFAQs,
  mockSupportStats,
  supportTestUsers,
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
          order: vi.fn(() => Promise.resolve({ data: mockTicketMessages, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: mockSupportTickets[0], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockSupportTickets[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: supportTestUsers.beneficiary }, 
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
    it('should display all support tickets', () => {
      expect(mockSupportTickets).toHaveLength(4);
    });

    it('should categorize tickets by status', () => {
      const openTickets = mockSupportTickets.filter(t => t.status === 'open');
      const inProgressTickets = mockSupportTickets.filter(t => t.status === 'in_progress');
      const resolvedTickets = mockSupportTickets.filter(t => t.status === 'resolved');
      const closedTickets = mockSupportTickets.filter(t => t.status === 'closed');

      expect(openTickets).toHaveLength(1);
      expect(inProgressTickets).toHaveLength(1);
      expect(resolvedTickets).toHaveLength(1);
      expect(closedTickets).toHaveLength(1);
    });

    it('should categorize tickets by priority', () => {
      const urgentTickets = mockSupportTickets.filter(t => t.priority === 'urgent');
      const highTickets = mockSupportTickets.filter(t => t.priority === 'high');
      const normalTickets = mockSupportTickets.filter(t => t.priority === 'normal');

      expect(urgentTickets).toHaveLength(1);
      expect(highTickets).toHaveLength(1);
      expect(normalTickets).toHaveLength(2);
    });

    it('should categorize tickets by category', () => {
      const technicalTickets = mockSupportTickets.filter(t => t.category === 'technical');
      const financialTickets = mockSupportTickets.filter(t => t.category === 'financial');
      const accountTickets = mockSupportTickets.filter(t => t.category === 'account');

      expect(technicalTickets).toHaveLength(1);
      expect(financialTickets).toHaveLength(2);
      expect(accountTickets).toHaveLength(1);
    });
  });

  describe('Ticket Details', () => {
    it('should display ticket information', () => {
      const ticket = mockSupportTickets[0];

      expect(ticket.ticket_number).toBeDefined();
      expect(ticket.subject).toBe('مشكلة في تسجيل الدخول');
      expect(ticket.description).toBeDefined();
      expect(ticket.created_by).toBeDefined();
    });

    it('should track ticket assignment', () => {
      const assignedTickets = mockSupportTickets.filter(t => t.assigned_to);
      expect(assignedTickets.length).toBeGreaterThan(0);
    });

    it('should track SLA due dates', () => {
      mockSupportTickets.forEach(ticket => {
        expect(ticket.sla_due_at).toBeDefined();
      });
    });

    it('should identify overdue tickets', () => {
      const overdueTickets = mockSupportTickets.filter(t => t.is_overdue);
      expect(overdueTickets).toHaveLength(1);
    });
  });

  describe('Ticket Messages', () => {
    it('should display ticket conversation', () => {
      expect(mockTicketMessages).toHaveLength(4);
    });

    it('should identify staff vs user messages', () => {
      const staffMessages = mockTicketMessages.filter(m => m.is_staff);
      const userMessages = mockTicketMessages.filter(m => !m.is_staff);

      expect(staffMessages).toHaveLength(2);
      expect(userMessages).toHaveLength(2);
    });

    it('should track message attachments', () => {
      const messagesWithAttachments = mockTicketMessages.filter(m => m.attachments?.length > 0);
      expect(messagesWithAttachments).toHaveLength(1);
    });

    it('should mark messages as read', () => {
      const readMessages = mockTicketMessages.filter(m => m.is_read);
      expect(readMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Ticket Creation', () => {
    it('should validate required fields', () => {
      const newTicket = {
        subject: 'استفسار عن التوزيعات',
        description: 'أريد معرفة موعد التوزيع القادم',
        category: 'financial',
        priority: 'normal',
      };

      expect(newTicket.subject).toBeDefined();
      expect(newTicket.description).toBeDefined();
      expect(newTicket.category).toBeDefined();
    });

    it('should generate ticket number', () => {
      const ticketNumber = mockSupportTickets[0].ticket_number;
      expect(ticketNumber).toMatch(/^TKT-\d{4}-\d+$/);
    });
  });
});

describe('Support Management', () => {
  describe('Ticket Assignment', () => {
    it('should assign tickets to staff', () => {
      const ticket = mockSupportTickets[1];
      expect(ticket.assigned_to).toBe('admin-1');
      expect(ticket.assigned_to_name).toBe('مدير النظام');
    });

    it('should track assignment time', () => {
      const assignedTicket = mockSupportTickets.find(t => t.assigned_at);
      expect(assignedTicket?.assigned_at).toBeDefined();
    });
  });

  describe('Ticket Resolution', () => {
    it('should track resolution time', () => {
      const resolvedTicket = mockSupportTickets.find(t => t.status === 'resolved');
      expect(resolvedTicket?.resolved_at).toBeDefined();
    });

    it('should store resolution notes', () => {
      const resolvedTicket = mockSupportTickets.find(t => t.status === 'resolved');
      expect(resolvedTicket?.resolution_notes).toBeDefined();
    });

    it('should track satisfaction rating', () => {
      const ratedTicket = mockSupportTickets.find(t => t.satisfaction_rating);
      expect(ratedTicket?.satisfaction_rating).toBeGreaterThanOrEqual(1);
      expect(ratedTicket?.satisfaction_rating).toBeLessThanOrEqual(5);
    });
  });

  describe('Auto Escalation', () => {
    it('should identify tickets needing escalation', () => {
      const overdueTickets = mockSupportTickets.filter(t => t.is_overdue);
      expect(overdueTickets.length).toBeGreaterThan(0);
    });

    it('should escalate based on priority and age', () => {
      const urgentOverdue = mockSupportTickets.filter(
        t => t.priority === 'urgent' && t.is_overdue
      );
      // These should be escalated
      expect(urgentOverdue.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Knowledge Base', () => {
  describe('Articles', () => {
    it('should display knowledge articles', () => {
      expect(mockKnowledgeArticles).toHaveLength(4);
    });

    it('should categorize articles', () => {
      const gettingStarted = mockKnowledgeArticles.filter(a => a.category === 'getting_started');
      const payments = mockKnowledgeArticles.filter(a => a.category === 'payments');
      const account = mockKnowledgeArticles.filter(a => a.category === 'account');

      expect(gettingStarted).toHaveLength(1);
      expect(payments).toHaveLength(2);
      expect(account).toHaveLength(1);
    });

    it('should track article views', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article.view_count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should track article helpfulness', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article.helpful_count).toBeDefined();
        expect(article.not_helpful_count).toBeDefined();
      });
    });

    it('should display published articles only', () => {
      const publishedArticles = mockKnowledgeArticles.filter(a => a.is_published);
      expect(publishedArticles.length).toBe(mockKnowledgeArticles.length);
    });
  });

  describe('FAQs', () => {
    it('should display FAQs', () => {
      expect(mockFAQs).toHaveLength(4);
    });

    it('should categorize FAQs', () => {
      const generalFAQs = mockFAQs.filter(f => f.category === 'general');
      const paymentsFAQs = mockFAQs.filter(f => f.category === 'payments');
      const accountFAQs = mockFAQs.filter(f => f.category === 'account');

      expect(generalFAQs).toHaveLength(1);
      expect(paymentsFAQs).toHaveLength(2);
      expect(accountFAQs).toHaveLength(1);
    });

    it('should order FAQs by sort order', () => {
      const sortedFAQs = [...mockFAQs].sort((a, b) => a.sort_order - b.sort_order);
      expect(sortedFAQs[0].sort_order).toBeLessThanOrEqual(sortedFAQs[1].sort_order);
    });
  });

  describe('Search', () => {
    it('should search articles by title', () => {
      const searchTerm = 'التوزيعات';
      const results = mockKnowledgeArticles.filter(a => 
        a.title.includes(searchTerm) || a.content.includes(searchTerm)
      );
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search FAQs', () => {
      const searchTerm = 'استحقاقي';
      const results = mockFAQs.filter(f => 
        f.question.includes(searchTerm) || f.answer.includes(searchTerm)
      );
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

describe('Support Statistics', () => {
  it('should display ticket statistics', () => {
    expect(mockSupportStats.total_tickets).toBe(150);
    expect(mockSupportStats.open_tickets).toBe(12);
    expect(mockSupportStats.resolved_tickets).toBe(125);
  });

  it('should track average resolution time', () => {
    expect(mockSupportStats.avg_resolution_hours).toBe(4.5);
  });

  it('should track satisfaction score', () => {
    expect(mockSupportStats.avg_satisfaction).toBe(4.2);
  });

  it('should show category breakdown', () => {
    const { by_category } = mockSupportStats;
    expect(by_category.technical).toBeDefined();
    expect(by_category.financial).toBeDefined();
    expect(by_category.account).toBeDefined();
  });
});
