/**
 * Property Units Service - خدمة وحدات العقارات
 * @description إدارة الوحدات العقارية (شقق، محلات، إلخ)
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type PropertyUnitRow = Database['public']['Tables']['property_units']['Row'];
type PropertyUnitInsert = Database['public']['Tables']['property_units']['Insert'];
type PropertyUnitUpdate = Database['public']['Tables']['property_units']['Update'];

export class PropertyUnitsService {
  /**
   * جلب وحدات العقار
   */
  static async getUnits(propertyId?: string): Promise<PropertyUnitRow[]> {
    try {
      let query = supabase
        .from('property_units')
        .select('*')
        .order('unit_number');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching property units', error);
      throw error;
    }
  }

  /**
   * جلب جميع الوحدات
   */
  static async getAllUnits(): Promise<PropertyUnitRow[]> {
    return this.getUnits();
  }

  /**
   * جلب الرقم التالي للوحدة
   */
  static async getNextUnitNumber(propertyId: string): Promise<string> {
    try {
      const { data: units, error } = await supabase
        .from('property_units')
        .select('unit_number')
        .eq('property_id', propertyId)
        .order('unit_number', { ascending: false });

      if (error) throw error;

      if (!units || units.length === 0) {
        return '101';
      }

      const numbers = units
        .map(u => parseInt(u.unit_number.replace(/\D/g, ''), 10))
        .filter(n => !isNaN(n));

      if (numbers.length === 0) {
        return '101';
      }

      const maxNumber = Math.max(...numbers);
      return String(maxNumber + 1);
    } catch (error) {
      productionLogger.error('Error getting next unit number', error);
      return '101';
    }
  }

  /**
   * إنشاء وحدة جديدة
   */
  static async createUnit(unit: PropertyUnitInsert): Promise<PropertyUnitRow> {
    try {
      const { data, error } = await supabase
        .from('property_units')
        .insert([unit])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في إنشاء الوحدة");

      // تحديث عدد الوحدات في العقار
      if (unit.property_id) {
        const { data: units } = await supabase
          .from('property_units')
          .select('id')
          .eq('property_id', unit.property_id);

        await supabase
          .from('properties')
          .update({ units: units?.length || 0 })
          .eq('id', unit.property_id);
      }

      return data;
    } catch (error) {
      productionLogger.error('Error creating property unit', error);
      throw error;
    }
  }

  /**
   * تحديث وحدة
   */
  static async updateUnit(unitId: string, updates: Partial<PropertyUnitUpdate>): Promise<PropertyUnitRow> {
    try {
      const { data, error } = await supabase
        .from('property_units')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', unitId)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("الوحدة غير موجودة");
      return data;
    } catch (error) {
      productionLogger.error('Error updating property unit', error);
      throw error;
    }
  }

  /**
   * حذف وحدة
   */
  static async deleteUnit(unitId: string): Promise<void> {
    try {
      const { data: unit } = await supabase
        .from('property_units')
        .select('property_id')
        .eq('id', unitId)
        .maybeSingle();

      const { error } = await supabase
        .from('property_units')
        .delete()
        .eq('id', unitId);

      if (error) throw error;

      // تحديث عدد الوحدات في العقار
      if (unit?.property_id) {
        const { data: units } = await supabase
          .from('property_units')
          .select('id')
          .eq('property_id', unit.property_id);

        await supabase
          .from('properties')
          .update({ units: units?.length || 0 })
          .eq('id', unit.property_id);
      }
    } catch (error) {
      productionLogger.error('Error deleting property unit', error);
      throw error;
    }
  }

  /**
   * جلب بيانات وحدات وعقود العقار
   */
  static async getPropertyUnitsAndContracts(propertyId: string) {
    try {
      const [unitsResult, contractsResult] = await Promise.all([
        supabase
          .from("property_units")
          .select("id, unit_number, unit_type, floor_number, area, annual_rent, occupancy_status, current_contract_id")
          .eq("property_id", propertyId)
          .order("unit_number"),
        supabase
          .from("contracts")
          .select("id, tenant_name, monthly_rent")
          .eq("property_id", propertyId)
          .eq("status", "نشط")
      ]);

      if (unitsResult.error) throw unitsResult.error;
      if (contractsResult.error) throw contractsResult.error;

      return {
        units: unitsResult.data || [],
        contracts: contractsResult.data || []
      };
    } catch (error) {
      productionLogger.error('Error fetching property units and contracts', error);
      throw error;
    }
  }
}
