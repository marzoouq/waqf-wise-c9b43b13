/**
 * Analysis Service - خدمة التحليلات
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { matchesStatus } from '@/lib/constants';

export class AnalysisService {
  /**
   * جلب تقرير تحليل التوزيعات
   */
  static async getDistributionAnalysisReport(): Promise<{
    totalDistributed: number;
    byCategory: { category: string; amount: number; count: number }[];
    byYear: { year: number; amount: number }[];
  }> {
    try {
      const { data: distributions, error } = await supabase
        .from('distributions')
        .select('total_amount, distribution_date')
        .in('status', ['مدفوع', 'paid', 'مكتمل', 'completed']);

      if (error) throw error;

      const totalDistributed = (distributions || []).reduce((sum, d) => sum + (d.total_amount || 0), 0);

      const byYearMap: Record<number, number> = {};
      (distributions || []).forEach(d => {
        const year = new Date(d.distribution_date).getFullYear();
        byYearMap[year] = (byYearMap[year] || 0) + (d.total_amount || 0);
      });

      const byYear = Object.entries(byYearMap).map(([year, amount]) => ({
        year: parseInt(year),
        amount,
      }));

      return {
        totalDistributed,
        byCategory: [],
        byYear,
      };
    } catch (error) {
      logger.error(error, { context: 'get_distribution_analysis_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب تقرير أداء الصناديق
   */
  static async getFundsPerformanceReport(): Promise<{
    funds: { name: string; totalRevenue: number; totalDistributed: number; balance: number }[];
  }> {
    try {
      const { data: funds, error } = await supabase
        .from('funds')
        .select('*');

      if (error) throw error;

      const result = (funds || []).map(f => ({
        name: f.name || '',
        totalRevenue: f.allocated_amount || 0,
        totalDistributed: f.spent_amount || 0,
        balance: (f.allocated_amount || 0) - (f.spent_amount || 0),
      }));

      return { funds: result };
    } catch (error) {
      logger.error(error, { context: 'get_funds_performance_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب بيانات لوحة التحكم التفاعلية
   */
  static async getInteractiveDashboardData(): Promise<{
    kpis: { label: string; value: number; change?: number }[];
    charts: { name: string; data: { label: string; value: number }[] }[];
  }> {
    try {
      const [beneficiaries, properties, distributions, payments] = await Promise.all([
        supabase.from('beneficiaries').select('status').in('status', ['نشط', 'active']),
        supabase.from('properties').select('status'),
        supabase.from('distributions').select('total_amount, status'),
        supabase.from('payments').select('amount, payment_type'),
      ]);

      const totalBeneficiaries = beneficiaries.data?.length || 0;
      const totalProperties = properties.data?.length || 0;
      const totalDistributed = (distributions.data || [])
        .filter(d => matchesStatus(d.status, 'paid', 'completed'))
        .reduce((sum, d) => sum + (d.total_amount || 0), 0);
      const totalCollected = (payments.data || [])
        .filter(p => p.payment_type === 'receipt')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        kpis: [
          { label: 'المستفيدين النشطين', value: totalBeneficiaries },
          { label: 'العقارات', value: totalProperties },
          { label: 'إجمالي التوزيعات', value: totalDistributed },
          { label: 'إجمالي المحصل', value: totalCollected },
        ],
        charts: [],
      };
    } catch (error) {
      logger.error(error, { context: 'get_interactive_dashboard', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب تقرير أعمار القروض
   */
  static async getLoansAgingReport(): Promise<{
    buckets: { label: string; amount: number; count: number }[];
    total: number;
    overdueAmount: number;
  }> {
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .in('status', ['نشط', 'active']);

      if (error) throw error;

      const total = (loans || []).reduce((sum, l) => sum + (l.loan_amount || 0), 0);

      return {
        buckets: [
          { label: 'قروض جارية', amount: total, count: loans?.length || 0 },
        ],
        total,
        overdueAmount: 0,
      };
    } catch (error) {
      logger.error(error, { context: 'get_loans_aging_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب تقرير تكاليف الصيانة
   */
  static async getMaintenanceCostReport(propertyId?: string): Promise<{
    totalCost: number;
    byCategory: { category: string; amount: number }[];
    byProperty: { propertyName: string; amount: number }[];
  }> {
    try {
      let query = supabase
        .from('maintenance_requests')
        .select('*, properties(name)')
        .not('actual_cost', 'is', null);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalCost = (data || []).reduce((sum, r) => sum + (r.actual_cost || 0), 0);

      return {
        totalCost,
        byCategory: [],
        byProperty: [],
      };
    } catch (error) {
      logger.error(error, { context: 'get_maintenance_cost_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب إيرادات الوقف حسب السنة المالية
   */
  static async getWaqfRevenue(
    fiscalYearId: string,
    selectedYear: { id: string; name: string; start_date: string; end_date: string; is_active: boolean; is_closed: boolean },
    waqfUnitId?: string
  ) {
    if (selectedYear.is_closed) {
      const { data: closing } = await supabase
        .from('fiscal_year_closings')
        .select('*')
        .eq('fiscal_year_id', fiscalYearId)
        .maybeSingle();

      if (closing) {
        return {
          fiscalYearId,
          fiscalYearName: selectedYear.name,
          isClosed: true,
          isActive: false,
          monthlyCollected: 0,
          annualCollected: closing.total_revenues || 0,
          totalCollected: closing.total_revenues || 0,
          totalTax: closing.net_vat || 0,
          netRevenue: closing.net_income || 0,
          totalExpenses: closing.total_expenses || 0,
          netIncome: closing.net_income || 0,
          nazerShare: closing.nazer_share || 0,
          waqfCorpus: closing.waqf_corpus || 0,
        };
      }
    }

    const { data: payments } = await supabase
      .from('rental_payments')
      .select(`
        amount_due,
        tax_amount,
        status,
        payment_date,
        contracts!inner(
          payment_frequency,
          properties!inner(
            waqf_unit_id
          )
        )
      `)
      .eq('status', 'مدفوع')
      .gte('payment_date', selectedYear.start_date)
      .lte('payment_date', selectedYear.end_date);

    let monthlyCollected = 0;
    let annualCollected = 0;
    let totalTax = 0;

    interface PaymentData {
      amount_due: number | null;
      tax_amount: number | null;
      contracts: {
        payment_frequency: string;
        properties: { waqf_unit_id: string | null };
      };
    }

    const filteredPayments = (payments || []).filter((p: PaymentData) => {
      if (!waqfUnitId) return true;
      return p.contracts?.properties?.waqf_unit_id === waqfUnitId;
    });

    filteredPayments.forEach((payment: PaymentData) => {
      const amount = payment.amount_due || 0;
      const tax = payment.tax_amount || 0;
      
      if (payment.contracts?.payment_frequency === 'شهري') {
        monthlyCollected += amount;
      } else {
        annualCollected += amount;
      }
      totalTax += tax;
    });

    const totalCollected = monthlyCollected + annualCollected;
    const netRevenue = totalCollected - totalTax;

    return {
      fiscalYearId,
      fiscalYearName: selectedYear.name,
      isClosed: false,
      isActive: selectedYear.is_active,
      monthlyCollected,
      annualCollected,
      totalCollected,
      totalTax,
      netRevenue,
    };
  }
}
