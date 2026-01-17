/**
 * Property Stats Service - خدمة إحصائيات العقارات
 * @description حسابات وإحصائيات العقارات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';
import { MAINTENANCE_OPEN_STATUSES, COLLECTION_SOURCE } from '@/lib/constants';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

export interface PropertyStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
}

export interface PropertiesFullStats {
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
  // إضافات جديدة للمقارنة
  expectedAnnualRevenue: number;
  collectionRate: number;
}

export class PropertyStatsService {
  /**
   * جلب إحصائيات العقارات الأساسية
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
   * جلب إحصائيات العقارات الشاملة (للوحة التحكم)
   */
  static async getPropertiesStats(): Promise<PropertiesFullStats> {
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
        supabase.from("maintenance_requests").select("*").in("status", [...MAINTENANCE_OPEN_STATUSES]),
        supabase.from("fiscal_years").select("*").eq("is_active", true).maybeSingle(),
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

      // جلب المدفوعات الفعلية من سندات القبض (مصدر الحقيقة الموحد)
      let paymentsQuery = supabase
        .from(COLLECTION_SOURCE.TABLE)
        .select("amount")
        .eq("voucher_type", COLLECTION_SOURCE.TYPE)
        .eq("status", COLLECTION_SOURCE.STATUS);

      if (fiscalYear) {
        paymentsQuery = paymentsQuery
          .gte("created_at", fiscalYear.start_date)
          .lte("created_at", fiscalYear.end_date);
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
      const activeProperties = properties?.filter(p => p.status === "نشط" || p.status === "active").length || 0;
      
      const totalUnits = units?.length || 0;
      
      // حساب الوحدات المشغولة بناءً على الوحدات المرتبطة بعقود نشطة
      const contractUnitIds = contracts?.map(c => c.unit_id).filter(Boolean) || [];
      const occupiedFromContracts = contractUnitIds.length;
      
      // الوحدات المشغولة من جدول الوحدات (كـ fallback)
      const occupiedFromUnits = units?.filter(u => 
        u.occupancy_status === 'مشغول' || 
        u.status === 'مشغول' ||
        u.occupancy_status === 'occupied'
      ).length || 0;
      
      // استخدام الأكبر بين العقود أو حالة الوحدات
      const occupiedUnits = Math.max(occupiedFromContracts, occupiedFromUnits, contracts?.length || 0);
      const vacantUnits = Math.max(0, totalUnits - occupiedUnits);
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      // حساب إجمالي المحصّل من سندات القبض
      const totalCollected = payments?.reduce((sum, p) => sum + (Number((p as { amount: number }).amount) || 0), 0) || 0;
      const totalTax = 0; // يمكن حسابها لاحقاً من بيانات الضريبة
      const totalNetRevenue = totalCollected; // الصافي = المحصل (بدون ضريبة حالياً)

      // حساب الإيراد السنوي المتوقع من العقود النشطة (مصدر الحقيقة الموحد)
      const expectedAnnualRevenue = contracts?.reduce((sum, c) => {
        const monthlyRent = Number(c.monthly_rent) || 0;
        const frequency = c.payment_frequency;
        // إذا كان سنوي، الإيراد هو نفسه، وإلا نضرب × 12
        return sum + (frequency === 'سنوي' ? monthlyRent : monthlyRent * 12);
      }, 0) || 0;

      // نسبة التحصيل
      const collectionRate = expectedAnnualRevenue > 0 
        ? Math.round((totalCollected / expectedAnnualRevenue) * 100) 
        : 0;

      // جلب رقبة الوقف
      let carryForwardWaqfCorpus = 0;
      if (fiscalYear) {
        const { data: waqfReserve } = await supabase
          .from("waqf_reserves")
          .select("current_balance")
          .eq("fiscal_year_id", fiscalYear.id)
          .eq("reserve_type", "احتياطي")
          .maybeSingle();

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
        totalMonthlyRevenue: expectedAnnualRevenue / 12,
        totalAnnualRevenue: expectedAnnualRevenue,
        expectedAnnualRevenue,
        collectionRate,
      };
    } catch (error) {
      productionLogger.error('Error fetching properties stats', error);
      throw error;
    }
  }
}
