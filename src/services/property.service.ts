/**
 * Property Service - خدمة إدارة العقارات
 * 
 * تحتوي على منطق الأعمال المتعلق بالعقارات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

// استخدام الأنواع من قاعدة البيانات
type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

export interface PropertyStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
}

export interface PropertyFilters {
  type?: string;
  status?: string;
  location?: string;
  search?: string;
}

export class PropertyService {
  /**
   * جلب جميع العقارات
   */
  static async getAll(filters?: PropertyFilters): Promise<PropertyRow[]> {
    try {
      let query = supabase
        .from('properties')
        .select('*');

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching properties', error);
      throw error;
    }
  }

  /**
   * جلب عقار واحد
   */
  static async getById(id: string): Promise<PropertyRow | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching property', error);
      throw error;
    }
  }

  /**
   * إضافة عقار جديد
   */
  static async create(property: Omit<PropertyInsert, 'id' | 'created_at' | 'updated_at'>): Promise<PropertyRow> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating property', error);
      throw error;
    }
  }

  /**
   * تحديث عقار
   */
  static async update(id: string, updates: Partial<PropertyInsert>): Promise<PropertyRow> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating property', error);
      throw error;
    }
  }

  /**
   * حذف عقار
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting property', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات العقارات
   */
  static async getStats(): Promise<PropertyStats> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('units, occupied, monthly_revenue, revenue_type');

      if (error) throw error;

      const properties = data || [];
      const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied || 0), 0);
      const monthlyRevenue = properties.reduce((sum, p) => {
        if (p.revenue_type === 'سنوي') {
          return sum + ((p.monthly_revenue || 0) / 12);
        }
        return sum + (p.monthly_revenue || 0);
      }, 0);

      return {
        totalProperties: properties.length,
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
        totalMonthlyRevenue: monthlyRevenue,
        totalAnnualRevenue: monthlyRevenue * 12,
      };
    } catch (error) {
      productionLogger.error('Error fetching property stats', error);
      throw error;
    }
  }

  /**
   * تحديث نسبة الإشغال
   */
  static async updateOccupancy(id: string, occupied: number): Promise<PropertyRow> {
    return this.update(id, { occupied });
  }

  /**
   * جلب العقارات حسب النوع
   */
  static async getByType(type: string): Promise<PropertyRow[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', type)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching properties by type', error);
      throw error;
    }
  }

  /**
   * جلب العقارات الشاغرة
   */
  static async getVacant(): Promise<PropertyRow[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*');

      if (error) throw error;
      
      // فلترة العقارات التي بها وحدات شاغرة
      return (data || []).filter(p => (p.occupied || 0) < (p.units || 0));
    } catch (error) {
      productionLogger.error('Error fetching vacant properties', error);
      throw error;
    }
  }

  /**
   * حساب الإيراد المتوقع
   */
  static calculateExpectedRevenue(properties: PropertyRow[]): number {
    return properties.reduce((total, property) => {
      const monthlyRevenue = property.monthly_revenue || 0;
      const units = property.units || 1;
      const occupied = property.occupied || 0;
      const occupancyRate = units > 0 ? occupied / units : 0;
      return total + (monthlyRevenue * occupancyRate);
    }, 0);
  }
}
