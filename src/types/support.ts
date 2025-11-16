export type TicketCategory = 'technical' | 'financial' | 'account' | 'request' | 'complaint' | 'inquiry' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'cancelled';
export type TicketSource = 'portal' | 'email' | 'phone' | 'chatbot';
export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  beneficiary_id: string | null;
  
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  
  assigned_to: string | null;
  assigned_at: string | null;
  assigned_by: string | null;
  
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  sla_due_at: string | null;
  is_overdue: boolean;
  
  source: TicketSource;
  tags: string[] | null;
  metadata: any;
  
  response_count: number;
  reopened_count: number;
  last_activity_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string | null;
  comment: string;
  is_internal: boolean;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  metadata: any;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  comment_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface TicketRating {
  id: string;
  ticket_id: string;
  rating: number;
  feedback: string | null;
  response_speed_rating: number | null;
  solution_quality_rating: number | null;
  staff_friendliness_rating: number | null;
  rated_by: string | null;
  rated_at: string;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  changed_by: string | null;
  changed_at: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_reason: string | null;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  tags: string[] | null;
  status: ArticleStatus;
  is_featured: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
  slug: string | null;
  sort_order: number;
  metadata: any;
}

export interface KBFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  views_count: number;
  helpful_count: number;
}

export interface SupportStatistics {
  id: string;
  date: string;
  total_tickets: number;
  new_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  reopened_tickets: number;
  avg_first_response_minutes: number | null;
  avg_resolution_minutes: number | null;
  sla_compliance_rate: number | null;
  avg_rating: number | null;
  total_ratings: number;
  active_agents: number;
  total_responses: number;
  created_at: string;
}

export interface CreateTicketInput {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  beneficiary_id?: string;
  tags?: string[];
}

export interface UpdateTicketInput {
  subject?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: string;
  tags?: string[];
}

export interface SupportFilters {
  status?: TicketStatus[];
  category?: TicketCategory[];
  priority?: TicketPriority[];
  assigned_to?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  is_overdue?: boolean;
}
