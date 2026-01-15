/**
 * Support Service - خدمة الدعم الفني
 * @version 2.8.52
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert'];

export interface SupportFilters {
  status?: string[];
  category?: string[];
  priority?: string[];
  assigned_to?: string;
  is_overdue?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export class SupportService {
  /**
   * جلب جميع التذاكر
   */
  static async getTickets(filters?: SupportFilters): Promise<SupportTicket[]> {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id(id, email),
        beneficiary:beneficiary_id(id, full_name, national_id),
        assigned_user:assigned_to(id, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }
    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.is_overdue) {
      query = query.eq('is_overdue', true);
    }
    if (filters?.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب تذكرة واحدة
   */
  static async getById(ticketId: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id(id, email),
        beneficiary:beneficiary_id(id, full_name, national_id),
        assigned_user:assigned_to(id, email),
        assigned_by_user:assigned_by(id, email)
      `)
      .eq('id', ticketId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إنشاء تذكرة
   */
  static async create(input: SupportTicketInsert): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([input])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء التذكرة');
    return data;
  }

  /**
   * تحديث تذكرة
   */
  static async update(id: string, updates: Partial<SupportTicketInsert>): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إغلاق تذكرة
   */
  static async close(id: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إعادة فتح تذكرة
   */
  static async reopen(id: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'open',
        closed_at: null,
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // تحديث عداد إعادة الفتح
    await supabase
      .from('support_tickets')
      .update({ reopened_count: (data.reopened_count || 0) + 1 })
      .eq('id', id);

    return data;
  }

  /**
   * تعيين تذكرة لموظف
   */
  static async assign(ticketId: string, userId: string, assignedBy: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: userId,
        assigned_at: new Date().toISOString(),
        assigned_by: assignedBy,
        status: 'in_progress',
      })
      .eq('id', ticketId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * جلب تقييم تذكرة
   */
  static async getTicketRating(ticketId: string) {
    const { data, error } = await supabase
      .from('support_ticket_ratings')
      .select('id, ticket_id, rating, feedback, response_speed_rating, solution_quality_rating, staff_friendliness_rating, rated_by, created_at')
      .eq('ticket_id', ticketId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إضافة تقييم تذكرة
   */
  static async addTicketRating(params: {
    ticketId: string;
    rating: number;
    feedback?: string;
    responseSpeedRating?: number;
    solutionQualityRating?: number;
    staffFriendlinessRating?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('support_ticket_ratings')
      .insert({
        ticket_id: params.ticketId,
        rating: params.rating,
        feedback: params.feedback,
        response_speed_rating: params.responseSpeedRating,
        solution_quality_rating: params.solutionQualityRating,
        staff_friendliness_rating: params.staffFriendlinessRating,
        rated_by: user?.id,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إضافة التقييم');
    return data;
  }

  /**
   * جلب تعليقات التذكرة
   */
  static async getTicketComments(ticketId: string) {
    const { data, error } = await supabase
      .from('support_ticket_comments')
      .select(`*, user:user_id(id, email)`)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب إحصائيات الدعم الفني
   */
  static async getOverviewStats() {
    // عدد التذاكر حسب الحالة
    const { data: allTickets } = await supabase
      .from('support_tickets')
      .select('status, category, priority');

    const ticketsByStatus = allTickets?.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {}) || {};

    const ticketsByCategory = allTickets?.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {}) || {};

    const ticketsByPriority = allTickets?.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {}) || {};

    // معدل الرضا
    const { data: ratings } = await supabase
      .from('support_ticket_ratings')
      .select('rating');

    const avgSatisfaction = ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return {
      ticketsByStatus,
      ticketsByCategory,
      ticketsByPriority,
      avgSatisfaction,
      totalRatings: ratings?.length || 0,
    };
  }

  /**
   * جلب التذاكر المتأخرة
   */
  static async getOverdueTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('id, ticket_number, subject, status, priority, category, is_overdue, sla_due_at, created_at')
      .eq('is_overdue', true)
      .order('sla_due_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب التذاكر الحديثة
   */
  static async getRecentTickets(limit: number = 10) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id(email),
        beneficiary:beneficiary_id(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الإحصائيات التاريخية
   */
  static async getHistoricalStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('support_statistics')
      .select('id, date, total_tickets, new_tickets, resolved_tickets, closed_tickets, reopened_tickets, avg_first_response_minutes, avg_resolution_minutes, sla_compliance_rate, avg_rating, total_ratings, active_agents, total_responses, created_at')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // ============ Agent Availability ============

  /**
   * جلب توافر وكيل الدعم
   */
  static async getAgentAvailability(userId: string) {
    const { data, error } = await supabase
      .from('support_agent_availability')
      .select('id, user_id, is_available, current_load, max_capacity, skills, priority_level')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث توافر وكيل الدعم
   */
  static async updateAgentAvailability(params: {
    userId: string;
    isAvailable?: boolean;
    maxCapacity?: number;
    skills?: string[];
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('غير مصرح');

    interface AvailabilityUpdate {
      is_available?: boolean;
      max_capacity?: number;
      skills?: string[];
      updated_at: string;
    }

    const updates: AvailabilityUpdate = {
      updated_at: new Date().toISOString()
    };
    if (params.isAvailable !== undefined) updates.is_available = params.isAvailable;
    if (params.maxCapacity !== undefined) updates.max_capacity = params.maxCapacity;
    if (params.skills !== undefined) updates.skills = params.skills;

    const { data, error } = await supabase
      .from('support_agent_availability')
      .upsert({
        user_id: params.userId,
        ...updates,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل تحديث التوافر');
    return data;
  }

  // ============ Agent Stats ============

  /**
   * جلب إحصائيات وكيل الدعم
   */
  static async getAgentStats(userId?: string, dateRange?: { from: string; to: string }) {
    let query = supabase
      .from('support_agent_stats')
      .select('id, user_id, date, total_assigned, total_resolved, total_closed, avg_response_minutes, avg_resolution_minutes, customer_satisfaction_avg, created_at');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (dateRange) {
      query = query
        .gte('date', dateRange.from)
        .lte('date', dateRange.to);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // ============ Escalations ============

  /**
   * جلب التصعيدات
   */
  static async getEscalations() {
    const { data, error } = await supabase
      .from('support_escalations')
      .select(`
        *,
        ticket:support_tickets(ticket_number, subject, status),
        escalated_from_user:escalated_from(id),
        escalated_to_user:escalated_to(id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ============ Assignment Settings ============

  /**
   * جلب إعدادات التعيين
   */
  static async getAssignmentSettings() {
    const { data, error } = await supabase
      .from('support_assignment_settings')
      .select('id, assignment_type, auto_assign, max_tickets_per_agent, created_at, updated_at')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * تحديث إعدادات التعيين
   */
  static async updateAssignmentSettings(newSettings: {
    assignment_type?: string;
    auto_assign?: boolean;
    max_tickets_per_agent?: number;
  }) {
    const { data, error } = await supabase
      .from('support_assignment_settings')
      .upsert({
        ...newSettings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل تحديث الإعدادات');
    return data;
  }

  // ============ Ticket Comments ============

  /**
   * إضافة تعليق على تذكرة
   */
  static async addTicketComment(params: {
    ticketId: string;
    comment: string;
    isInternal?: boolean;
    isSolution?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول');

    const { data, error } = await supabase
      .from('support_ticket_comments')
      .insert({
        ticket_id: params.ticketId,
        user_id: user.id,
        comment: params.comment,
        is_internal: params.isInternal || false,
        is_solution: params.isSolution || false,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إضافة التعليق');

    // إذا كان حل، تحديث حالة التذكرة
    if (params.isSolution) {
      await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', params.ticketId);
    }

    return data;
  }

  /**
   * تحديث تعليق
   */
  static async updateTicketComment(id: string, comment: string) {
    const { data, error } = await supabase
      .from('support_ticket_comments')
      .update({
        comment,
        edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('التعليق غير موجود');
    return data;
  }
}
