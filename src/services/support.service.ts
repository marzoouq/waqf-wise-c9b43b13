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
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث تذكرة
   */
  static async update(id: string, updates: Partial<SupportTicketInsert>): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * إغلاق تذكرة
   */
  static async close(id: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * إعادة فتح تذكرة
   */
  static async reopen(id: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'open',
        closed_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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
  static async assign(ticketId: string, userId: string, assignedBy: string): Promise<SupportTicket> {
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
      .single();

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
}
