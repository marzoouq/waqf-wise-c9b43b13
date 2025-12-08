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

  /**
   * جلب وحدات العقار
   */
  static async getUnits(propertyId?: string): Promise<Database['public']['Tables']['property_units']['Row'][]> {
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
  static async getAllUnits(): Promise<Database['public']['Tables']['property_units']['Row'][]> {
    return this.getUnits();
  }

  /**
   * إنشاء وحدة جديدة
   */
  static async createUnit(unit: Database['public']['Tables']['property_units']['Insert']): Promise<Database['public']['Tables']['property_units']['Row']> {
    try {
      const { data, error } = await supabase
        .from('property_units')
        .insert([unit])
        .select()
        .single();

      if (error) throw error;

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
  static async updateUnit(unitId: string, updates: Partial<Database['public']['Tables']['property_units']['Update']>): Promise<Database['public']['Tables']['property_units']['Row']> {
    try {
      const { data, error } = await supabase
        .from('property_units')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', unitId)
        .select()
        .single();

      if (error) throw error;
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
        .single();

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
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error adding maintenance provider', error);
      throw error;
    }
  }

  /**
   * جلب تنبيهات العقار
   */
  static async getAlerts(_propertyId?: string): Promise<{ id: string; property_id: string; alert_type: string; message: string; is_resolved: boolean; created_at: string }[]> {
    // Return empty array - no property_alerts table exists
    return [];
  }

  /**
   * حل تنبيه
   */
  static async resolveAlert(_alertId: string): Promise<void> {
    // No-op - no property_alerts table exists
  }

  /**
   * جلب مدفوعات العقد
   */
  static async getPayments(contractId: string): Promise<Database['public']['Tables']['rental_payments']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .eq('contract_id', contractId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching contract payments', error);
      throw error;
    }
  }

  /**
   * جلب العقود للعقار
   */
  static async getContracts(propertyId: string): Promise<Database['public']['Tables']['contracts']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('property_id', propertyId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching property contracts', error);
      throw error;
    }
  }

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
   * جلب المدفوعات مع نوع الدفع من العقود
   */
  static async getRentalPaymentsWithFrequency(): Promise<{
    amount_paid: number | null;
    tax_amount: number | null;
    contracts: {
      payment_frequency: string | null;
    } | null;
  }[]> {
    try {
      const { data, error } = await supabase
        .from("rental_payments")
        .select(`
          amount_paid,
          tax_amount,
          contracts!inner (
            payment_frequency
          )
        `)
        .eq("status", "مدفوع");

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching rental payments with frequency', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات العقارات الشاملة (للوحة التحكم)
   */
  static async getPropertiesStats(): Promise<{
    totalProperties: number;
    activeProperties: number;
    occupiedUnits: number;
    vacantUnits: number;
    totalUnits: number;
    occupancyRate: number;
    totalCollected: number;
    annualCollected: number;
    monthlyCollected: number;
    totalTax: number;
    totalNetRevenue: number;
    fiscalYearName: string;
    carryForwardWaqfCorpus: number;
    carryForwardSourceYear: string;
    maintenanceRequests: number;
    expiringContracts: number;
    occupiedProperties: number;
    vacantProperties: number;
    totalMonthlyRevenue: number;
    totalAnnualRevenue: number;
  }> {
    try {
      const [
        propertiesResult,
        unitsResult,
        contractsResult,
        maintenanceResult,
        fiscalYearResult,
      ] = await Promise.all([
        supabase.from("properties").select("*"),
        supabase.from("property_units").select("*"),
        supabase.from("contracts").select("*").eq("status", "نشط"),
        supabase.from("maintenance_requests").select("*").in("status", ["معلق", "قيد التنفيذ"]),
        supabase.from("fiscal_years").select("*").eq("is_active", true).single(),
      ]);

      if (propertiesResult.error) throw propertiesResult.error;
      if (unitsResult.error) throw unitsResult.error;
      if (contractsResult.error) throw contractsResult.error;
      if (maintenanceResult.error) throw maintenanceResult.error;

      const properties = propertiesResult.data;
      const units = unitsResult.data;
      const contracts = contractsResult.data;
      const maintenance = maintenanceResult.data;
      const fiscalYear = fiscalYearResult.data;

      // جلب المدفوعات الفعلية
      let paymentsQuery = supabase
        .from("rental_payments")
        .select("amount_paid, tax_amount, net_amount")
        .eq("status", "مدفوع");

      if (fiscalYear) {
        paymentsQuery = paymentsQuery
          .gte("payment_date", fiscalYear.start_date)
          .lte("payment_date", fiscalYear.end_date);
      }

      const { data: payments, error: paymentsError } = await paymentsQuery;
      if (paymentsError) throw paymentsError;

      // العقود المنتهية قريباً
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringContracts, error: expiringError } = await supabase
        .from("contracts")
        .select("*")
        .eq("status", "نشط")
        .lte("end_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      if (expiringError) throw expiringError;

      const totalProperties = properties?.length || 0;
      const activeProperties = properties?.filter(p => p.status === "مؤجر" || p.status === "active").length || 0;
      
      const totalUnits = units?.length || 0;
      const occupiedUnits = units?.filter(u => u.occupancy_status === 'مشغول').length || 0;
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      const totalCollected = payments?.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0) || 0;
      const totalTax = payments?.reduce((sum, p) => sum + (Number(p.tax_amount) || 0), 0) || 0;
      const totalNetRevenue = payments?.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0) || 0;

      // جلب رقبة الوقف
      let carryForwardWaqfCorpus = 0;
      if (fiscalYear) {
        const { data: waqfReserve } = await supabase
          .from("waqf_reserves")
          .select("current_balance")
          .eq("fiscal_year_id", fiscalYear.id)
          .eq("reserve_type", "احتياطي")
          .single();

        carryForwardWaqfCorpus = waqfReserve?.current_balance || 0;
      }

      return {
        totalProperties,
        activeProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        totalCollected,
        annualCollected: totalCollected,
        monthlyCollected: 0,
        totalTax,
        totalNetRevenue,
        fiscalYearName: fiscalYear?.name || "غير محدد",
        carryForwardWaqfCorpus,
        carryForwardSourceYear: "2024-2025",
        maintenanceRequests: maintenance?.length || 0,
        expiringContracts: expiringContracts?.length || 0,
        occupiedProperties: contracts?.length || occupiedUnits,
        vacantProperties: totalProperties - (contracts?.length || 0),
        totalMonthlyRevenue: totalCollected,
        totalAnnualRevenue: totalCollected,
      };
    } catch (error) {
      productionLogger.error('Error fetching properties stats', error);
      throw error;
    }
  }
}
