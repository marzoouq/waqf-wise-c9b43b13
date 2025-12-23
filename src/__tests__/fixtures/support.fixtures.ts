/**
 * Support Test Fixtures - بيانات اختبار الدعم الفني
 * @version 1.0.0
 */

export const mockSupportTickets = [
  {
    id: 'ticket-1',
    ticket_number: 'TKT-2024-001',
    subject: 'مشكلة في تسجيل الدخول',
    description: 'لا أستطيع الدخول إلى حسابي',
    category: 'technical',
    priority: 'high',
    status: 'open',
    user_id: 'user-1',
    beneficiary_id: 'ben-1',
    assigned_to: null,
    assigned_at: null,
    assigned_by: null,
    is_overdue: false,
    sla_due_at: '2024-01-16T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    closed_at: null,
    reopened_count: 0,
  },
  {
    id: 'ticket-2',
    ticket_number: 'TKT-2024-002',
    subject: 'استفسار عن التوزيعات',
    description: 'متى سيتم صرف التوزيعات؟',
    category: 'inquiry',
    priority: 'medium',
    status: 'in_progress',
    user_id: 'user-2',
    beneficiary_id: 'ben-2',
    assigned_to: 'user-support-1',
    assigned_at: '2024-01-15T11:00:00Z',
    assigned_by: 'user-admin-1',
    is_overdue: false,
    sla_due_at: '2024-01-17T10:00:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    closed_at: null,
    reopened_count: 0,
  },
  {
    id: 'ticket-3',
    ticket_number: 'TKT-2024-003',
    subject: 'طلب تحديث البيانات البنكية',
    description: 'أريد تغيير رقم الحساب البنكي',
    category: 'request',
    priority: 'low',
    status: 'closed',
    user_id: 'user-3',
    beneficiary_id: 'ben-3',
    assigned_to: 'user-support-1',
    assigned_at: '2024-01-14T09:00:00Z',
    assigned_by: 'user-admin-1',
    is_overdue: false,
    sla_due_at: '2024-01-16T09:00:00Z',
    created_at: '2024-01-14T08:00:00Z',
    updated_at: '2024-01-14T15:00:00Z',
    closed_at: '2024-01-14T15:00:00Z',
    reopened_count: 0,
  },
];

export const mockTicketComments = [
  {
    id: 'comment-1',
    ticket_id: 'ticket-1',
    user_id: 'user-1',
    comment: 'لقد حاولت عدة مرات ولم أستطع الدخول',
    is_internal: false,
    is_solution: false,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'comment-2',
    ticket_id: 'ticket-1',
    user_id: 'user-support-1',
    comment: 'سأقوم بمراجعة الحساب',
    is_internal: true,
    is_solution: false,
    created_at: '2024-01-15T10:30:00Z',
  },
];

export const mockTicketRatings = [
  {
    id: 'rating-1',
    ticket_id: 'ticket-3',
    rating: 5,
    feedback: 'خدمة ممتازة',
    response_speed_rating: 5,
    solution_quality_rating: 5,
    staff_friendliness_rating: 5,
    rated_by: 'user-3',
    created_at: '2024-01-14T16:00:00Z',
  },
];

export const mockSupportStats = {
  ticketsByStatus: {
    open: 5,
    in_progress: 3,
    closed: 12,
    pending: 2,
  },
  ticketsByCategory: {
    technical: 8,
    inquiry: 7,
    request: 5,
    complaint: 2,
  },
  ticketsByPriority: {
    high: 4,
    medium: 10,
    low: 8,
  },
  avgSatisfaction: 4.2,
  totalRatings: 15,
};

export const mockAgentAvailability = {
  id: 'avail-1',
  user_id: 'user-support-1',
  is_available: true,
  current_load: 3,
  max_capacity: 10,
  skills: ['technical', 'inquiry'],
  priority_level: 1,
};

export const mockAgentStats = [
  {
    id: 'stat-1',
    user_id: 'user-support-1',
    date: '2024-01-15',
    total_assigned: 5,
    total_resolved: 4,
    total_closed: 3,
    avg_response_minutes: 15,
    avg_resolution_minutes: 120,
    customer_satisfaction_avg: 4.5,
    created_at: '2024-01-15T23:59:59Z',
  },
];

export const mockKnowledgeArticles = [
  {
    id: 'article-1',
    title: 'كيفية تحديث البيانات الشخصية',
    content: 'يمكنك تحديث بياناتك من خلال...',
    category: 'beneficiaries',
    tags: ['بيانات', 'تحديث'],
    views_count: 150,
    helpful_count: 45,
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'article-2',
    title: 'الأسئلة الشائعة عن التوزيعات',
    content: 'التوزيعات تتم بشكل دوري...',
    category: 'distributions',
    tags: ['توزيعات', 'مستحقات'],
    views_count: 320,
    helpful_count: 98,
    is_published: true,
    created_at: '2024-01-05T00:00:00Z',
  },
];

export const supportFilters = {
  byStatus: { status: ['open', 'in_progress'] },
  byCategory: { category: ['technical'] },
  byPriority: { priority: ['high'] },
  byAssignee: { assigned_to: 'user-support-1' },
  overdue: { is_overdue: true },
  withSearch: { search: 'تسجيل الدخول' },
};
