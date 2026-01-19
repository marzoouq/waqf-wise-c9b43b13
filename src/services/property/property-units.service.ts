/**
 * Property Units Service - خدمة وحدات العقارات
 * @description إدارة الوحدات العقارية (شقق، محلات، إلخ)
 * @version 2.1.0 - إضافة withRetry و FK validation
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { withRetry, SUPABASE_RETRY_OPTIONS } from '@/lib/retry-helper';
import type { Database } from '@/integrations/supabase/types';

type PropertyUnitRow = Database['public']['Tables']['property_units']['Row'];
type PropertyUnitInsert = Database['public']['Tables']['property_units']['Insert'];
type PropertyUnitUpdate = Database['public']['Tables']['property_units']['Update'];

export class PropertyUnitsService {
  /**
   * التحقق من وجود المستأجر قبل الربط
   */
  private static async validateTenantExists(tenantId: string | null | undefined): Promise<boolean> {
    if (!tenantId) return true; // null/undefined مقبول
    
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .maybeSingle();
    
    if (error) {
      productionLogger.error('Error validating tenant', { tenantId, error });
      return false;
    }
    
    return !!data;
  }

  /**
   * التحقق من وجود العقار قبل الربط
   */
  private static async validatePropertyExists(propertyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .maybeSingle();
    
    if (error) {
      productionLogger.error('Error validating property', { propertyId, error });
      return false;
    }
    
    return !!data;
  }
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
   * إنشاء وحدة جديدة مع التحقق من FK
   */
  static async createUnit(unit: PropertyUnitInsert): Promise<PropertyUnitRow> {
    try {
      // ✅ FK Validation - التحقق من وجود العقار
      if (unit.property_id) {
        const propertyExists = await this.validatePropertyExists(unit.property_id);
        if (!propertyExists) {
          throw new Error(`العقار غير موجود: ${unit.property_id}`);
        }
      }

      // ✅ FK Validation - التحقق من وجود المستأجر
      if (unit.current_tenant_id) {
        const tenantExists = await this.validateTenantExists(unit.current_tenant_id);
        if (!tenantExists) {
          throw new Error(`المستأجر غير موجود: ${unit.current_tenant_id}`);
        }
      }

      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('property_units')
          .insert([unit])
          .select()
          .maybeSingle();
      }, SUPABASE_RETRY_OPTIONS);

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
   * تحديث وحدة مع التحقق من FK
   */
  static async updateUnit(unitId: string, updates: Partial<PropertyUnitUpdate>): Promise<PropertyUnitRow> {
    try {
      // ✅ FK Validation - التحقق من وجود المستأجر إذا تم تحديثه
      if (updates.current_tenant_id !== undefined && updates.current_tenant_id !== null) {
        const tenantExists = await this.validateTenantExists(updates.current_tenant_id);
        if (!tenantExists) {
          throw new Error(`المستأجر غير موجود: ${updates.current_tenant_id}`);
        }
      }

      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('property_units')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', unitId)
          .select()
          .maybeSingle();
      }, SUPABASE_RETRY_OPTIONS);

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
