/**
 * Property Core Service - خدمة العقارات الأساسية
 * @description CRUD operations للعقارات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

export interface PropertyFilters {
  type?: string;
  status?: string;
  location?: string;
  search?: string;
}

export class PropertyCoreService {
  /**
   * جلب جميع العقارات (مع استثناء المحذوفة)
   */
  static async getAll(filters?: PropertyFilters): Promise<PropertyRow[]> {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .is('deleted_at', null);

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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء العقار');
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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('العقار غير موجود');
      return data;
    } catch (error) {
      productionLogger.error('Error updating property', error);
      throw error;
    }
  }

  /**
   * حذف عقار (Soft Delete - أرشفة)
   */
  static async delete(id: string, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('properties')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
          deletion_reason: reason || 'تم أرشفة العقار',
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error archiving property', error);
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
      return (data || []).filter(p => (p.occupied || 0) < (p.units || 0));
    } catch (error) {
      productionLogger.error('Error fetching vacant properties', error);
      throw error;
    }
  }

  /**
   * جلب العقارات غير المربوطة بأقلام الوقف
   */
  static async getUnlinkedToWaqf(): Promise<{ id: string; name: string; location: string; type: string; waqf_unit_id: string | null }[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, location, type, waqf_unit_id')
        .is('waqf_unit_id', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching unlinked properties', error);
      throw error;
    }
  }

  /**
   * ربط عقار بقلم وقف
   */
  static async linkToWaqfUnit(propertyId: string, waqfUnitId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ waqf_unit_id: waqfUnitId })
        .eq('id', propertyId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error linking property to waqf unit', error);
      throw error;
    }
  }
}
