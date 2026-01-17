/**
 * Maintenance Service - خدمة الصيانة
 * @version 2.8.25
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MAINTENANCE_OPEN_STATUSES, matchesStatus } from "@/lib/constants";
import { withRetry, SUPABASE_RETRY_OPTIONS } from "@/lib/retry-helper";

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type MaintenanceRequestInsert = Database['public']['Tables']['maintenance_requests']['Insert'];
type MaintenanceProvider = Database['public']['Tables']['maintenance_providers']['Row'];
type MaintenanceProviderInsert = Database['public']['Tables']['maintenance_providers']['Insert'];
type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row'];
type MaintenanceScheduleInsert = Database['public']['Tables']['maintenance_schedules']['Insert'];

export interface ProviderRating {
  provider_id: string;
  maintenance_request_id?: string;
  rating: number;
  quality_score?: number;
  timeliness_score?: number;
  cost_score?: number;
  comments?: string;
}

export class MaintenanceService {
  static async getRequests(filters?: { status?: string; propertyId?: string }): Promise<MaintenanceRequest[]> {
    let query = supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.propertyId) query = query.eq('property_id', filters.propertyId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createRequest(request: MaintenanceRequestInsert): Promise<MaintenanceRequest> {
    const { data, error } = await supabase.from('maintenance_requests').insert(request).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("فشل في إنشاء طلب الصيانة");
    return data;
  }

  static async updateRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const { data, error } = await supabase.from('maintenance_requests').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("طلب الصيانة غير موجود");
    return data;
  }

  static async getProviders(activeOnly: boolean = true): Promise<MaintenanceProvider[]> {
    let query = supabase.from('maintenance_providers').select('*');
    if (activeOnly) query = query.eq('is_active', true);
    query = query.order('rating', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async addProvider(provider: MaintenanceProviderInsert): Promise<MaintenanceProvider> {
    const { data, error } = await supabase.from('maintenance_providers').insert(provider).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("فشل في إضافة مقدم الخدمة");
    return data;
  }

  static async getSchedule(propertyId: string) {
    const { data, error } = await supabase.from('maintenance_schedules').select('*').eq('property_id', propertyId);
    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const requests = await withRetry(() => this.getRequests(), SUPABASE_RETRY_OPTIONS);
    const openStatuses = [...MAINTENANCE_OPEN_STATUSES];
    return {
      total: requests.length,
      pending: requests.filter(r => openStatuses.includes(r.status as typeof MAINTENANCE_OPEN_STATUSES[number])).length,
      completed: requests.filter(r => matchesStatus(r.status, 'completed')).length,
      totalCost: requests.reduce((s, r) => s + (r.actual_cost || 0), 0),
    };
  }

  /**
   * جلب طلبات الصيانة مع بيانات العقار
   */
  static async getRequestsWithProperties() {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        properties(name, location)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * إنشاء طلب صيانة مع رقم تلقائي
   */
  static async createRequestWithNumber(request: Omit<MaintenanceRequestInsert, 'request_number'>) {
    const requestNumber = `MR-${Date.now().toString().slice(-8)}`;
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([{ ...request, request_number: requestNumber }])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في إنشاء طلب الصيانة");
    return data;
  }

  /**
   * تحديث طلب صيانة مع بيانات العقار
   */
  static async updateRequestWithProperties(id: string, updates: Partial<MaintenanceRequest>) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        properties(name, location)
      `)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("طلب الصيانة غير موجود");
    return data;
  }

  /**
   * حذف طلب صيانة
   */
  static async deleteRequest(id: string) {
    const { error } = await supabase
      .from('maintenance_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تحديث مقدم خدمة
   */
  static async updateProvider(id: string, updates: Partial<MaintenanceProvider>): Promise<MaintenanceProvider> {
    const { data, error } = await supabase
      .from('maintenance_providers')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("مقدم الخدمة غير موجود");
    return data;
  }

  /**
   * حذف مقدم خدمة
   */
  static async deleteProvider(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_providers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تقييم مقدم خدمة
   */
  static async rateProvider(rating: ProviderRating): Promise<{ id: string; rating: number; provider_id: string; rated_by?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("provider_ratings")
      .insert([{ ...rating, rated_by: user?.id }])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في إضافة التقييم");
    return data as { id: string; rating: number; provider_id: string; rated_by?: string };
  }

  /**
   * جلب جداول الصيانة
   */
  static async getSchedules(): Promise<MaintenanceSchedule[]> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select(`
        *,
        properties:property_id (
          id,
          name,
          location
        ),
        property_units:property_unit_id (
          id,
          unit_number,
          unit_name
        )
      `)
      .order('next_maintenance_date', { ascending: true });

    if (error) throw error;
    return data as MaintenanceSchedule[];
  }

  /**
   * إضافة جدول صيانة
   */
  static async addSchedule(schedule: MaintenanceScheduleInsert): Promise<MaintenanceSchedule> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .insert(schedule)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في إضافة جدول الصيانة");
    return data;
  }

  /**
   * تحديث جدول صيانة
   */
  static async updateSchedule(id: string, updates: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("جدول الصيانة غير موجود");
    return data;
  }

  /**
   * حذف جدول صيانة
   */
  static async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * جلب تقرير تكاليف الصيانة حسب العقار
   */
  static async getCostAnalysis() {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select(`
        id,
        estimated_cost,
        actual_cost,
        status,
        properties!inner(id, name)
      `);
    
    if (error) throw error;

    const propertyData: Record<string, { property_id: string; property_name: string; total_cost: number; completed_count: number; pending_count: number; avg_cost: number }> = {};
    
    (data || []).forEach((req) => {
      const property = req.properties as unknown as { id: string; name: string };
      const propertyId = property.id;
      const propertyName = property.name;
      
      if (!propertyData[propertyId]) {
        propertyData[propertyId] = {
          property_id: propertyId,
          property_name: propertyName,
          total_cost: 0,
          completed_count: 0,
          pending_count: 0,
          avg_cost: 0
        };
      }

      const cost = Number(req.actual_cost || req.estimated_cost || 0);
      propertyData[propertyId].total_cost += cost;
      const openStatuses = [...MAINTENANCE_OPEN_STATUSES];
      if (matchesStatus(req.status, 'completed')) {
        propertyData[propertyId].completed_count += 1;
      } else if (openStatuses.includes(req.status as typeof MAINTENANCE_OPEN_STATUSES[number])) {
        propertyData[propertyId].pending_count += 1;
      }
    });

    return Object.values(propertyData)
      .map(item => ({
        ...item,
        avg_cost: item.completed_count > 0 ? item.total_cost / item.completed_count : 0
      }))
      .sort((a, b) => b.total_cost - a.total_cost);
  }

  /**
   * جلب تحليل تكاليف الصيانة حسب النوع
   */
  static async getTypeAnalysis() {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('category, estimated_cost, actual_cost, status');
    
    if (error) throw error;

    const typeData = (data || []).reduce((acc, req) => {
      const category = req.category || 'غير محدد';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      const cost = Number(req.actual_cost || req.estimated_cost || 0);
      acc[category].value += cost;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number }>);

    return Object.values(typeData);
  }
}
