/**
 * Property Maintenance Service - خدمة صيانة العقارات
 * @description إدارة طلبات الصيانة ومزودي الخدمات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database, Json } from '@/integrations/supabase/types';

export class PropertyMaintenanceService {
  /**
   * جلب طلبات الصيانة للعقار
   */
  static async getMaintenanceRequests(propertyId: string): Promise<Database['public']['Tables']['maintenance_requests']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching maintenance requests', error);
      throw error;
    }
  }

  /**
   * جلب مزودي الصيانة
   */
  static async getMaintenanceProviders(): Promise<Database['public']['Tables']['maintenance_providers']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select('*')
        .eq('is_active', true)
        .order('provider_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching maintenance providers', error);
      throw error;
    }
  }

  /**
   * إضافة مزود صيانة
   */
  static async addMaintenanceProvider(provider: Omit<Database['public']['Tables']['maintenance_providers']['Insert'], 'id'>): Promise<Database['public']['Tables']['maintenance_providers']['Row']> {
    try {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .insert([provider])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء مزود الصيانة');
      return data;
    } catch (error) {
      productionLogger.error('Error adding maintenance provider', error);
      throw error;
    }
  }
}
