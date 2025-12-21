/**
 * Support Query Keys - مفاتيح استعلامات الدعم الفني
 */

export const SUPPORT_KEYS = {
  // Support Tickets
  SUPPORT_TICKETS: ['support-tickets'] as const,
  SUPPORT_TICKET: (id: string) => ['support-ticket', id] as const,
  TICKET_COMMENTS: (ticketId: string) => ['ticket-comments', ticketId] as const,
  SUPPORT_STATS: ['support-stats'] as const,
  SUPPORT_ESCALATIONS: ['support-escalations'] as const,
  
  // Agent
  AGENT_AVAILABILITY: (userId: string) => ['agent-availability', userId] as const,
  AGENT_STATS: (userId: string, dateRange?: { from: string; to: string }) => ['agent-stats', userId, dateRange] as const,
  ASSIGNMENT_SETTINGS: ['assignment-settings'] as const,
  
  // Ticket Ratings
  TICKET_RATING: (ticketId: string) => ['ticket-rating', ticketId] as const,
  TICKET_RATINGS: ['ticket-ratings'] as const,

  // Chatbot
  CHATBOT_CONVERSATIONS: (userId?: string) => ['chatbot_conversations', userId] as const,
  CHATBOT_QUICK_REPLIES: ['chatbot_quick_replies'] as const,

  // Requests
  REQUESTS: ['requests'] as const,
  REQUEST: (id: string) => ['request', id] as const,
  REQUEST_TYPES: ['request-types'] as const,
  REQUEST_DETAILS: (requestId: string) => ['request-details', requestId] as const,
  REQUEST_MESSAGES: (requestId: string) => ['request-messages', requestId] as const,
  REQUEST_APPROVALS: (requestId?: string) => ['request_approvals', requestId] as const,
  REQUEST_COMMENTS: (requestId?: string) => ['request-comments', requestId] as const,
  REQUEST_ATTACHMENTS: (requestId?: string) => ['request-attachments', requestId] as const,

  // Emergency Aid
  EMERGENCY_AID: ['emergency-aid'] as const,
  EMERGENCY_APPROVALS: ['emergency-approvals'] as const,
} as const;
