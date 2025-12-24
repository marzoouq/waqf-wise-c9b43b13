/**
 * Support Test Fixtures - بيانات اختبار الدعم الفني
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockSupportTickets: any[] = [];
export const mockTicketComments: any[] = [];
export const mockTicketRatings: any[] = [];

export const mockSupportStats = {
  ticketsByStatus: {
    open: 0,
    in_progress: 0,
    closed: 0,
  },
  ticketsByCategory: {
    technical: 0,
    financial: 0,
    general: 0,
    inquiry: 0,
  },
  ticketsByPriority: {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  },
  avgSatisfaction: 0,
  totalRatings: 0,
};

export const mockAgentAvailability = {
  is_available: true,
  current_load: 0,
  max_capacity: 10,
  skills: [] as string[],
};

export const mockAgentStats: any[] = [];
export const mockKnowledgeArticles: any[] = [];

export const supportFilters = {
  byStatus: { status: 'open' },
  byCategory: { category: 'technical' },
  byPriority: { priority: 'high' },
  byAssignee: { assignee_id: 'agent-1', assigned_to: 'agent-1' },
  overdue: { is_overdue: true },
  withSearch: { search: 'test' },
};
