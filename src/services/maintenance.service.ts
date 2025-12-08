/**
 * Maintenance Service - خدمة الصيانة
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type MaintenanceRequestInsert = Database['public']['Tables']['maintenance_requests']['Insert'];
type MaintenanceProvider = Database['public']['Tables']['maintenance_providers']['Row'];
type MaintenanceProviderInsert = Database['public']['Tables']['maintenance_providers']['Insert'];

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
    const { data, error } = await supabase.from('maintenance_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  }

  static async updateRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const { data, error } = await supabase.from('maintenance_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async getProviders(): Promise<MaintenanceProvider[]> {
    const { data, error } = await supabase.from('maintenance_providers').select('*').order('name');
    if (error) throw error;
    return data || [];
  }

  static async addProvider(provider: MaintenanceProviderInsert): Promise<MaintenanceProvider> {
    const { data, error } = await supabase.from('maintenance_providers').insert(provider).select().single();
    if (error) throw error;
    return data;
  }

  static async getSchedule(propertyId: string) {
    const { data, error } = await supabase.from('maintenance_schedules').select('*').eq('property_id', propertyId);
    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const requests = await this.getRequests();
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'معلق').length,
      completed: requests.filter(r => r.status === 'مكتمل').length,
      totalCost: requests.reduce((s, r) => s + (r.actual_cost || 0), 0),
    };
  }
}
