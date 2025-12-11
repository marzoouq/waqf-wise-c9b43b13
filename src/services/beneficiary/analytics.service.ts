/**
 * Beneficiary Analytics Service - خدمة تحليلات المستفيدين
 * @version 2.8.82
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

export class BeneficiaryAnalyticsService {
  /**
   * جلب كشف حساب المستفيد
   */
  static async getStatements(beneficiaryId: string): Promise<{
    transactions: { date: string; description: string; debit: number; credit: number; balance: number }[];
    balance: number;
  }> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: true });

      if (error) throw error;

      let balance = 0;
      const transactions = (payments || []).map(p => {
        const amount = p.amount || 0;
        if (p.payment_type === 'receipt') {
          balance += amount;
        } else {
          balance -= amount;
        }
        return {
          date: p.payment_date,
          description: p.description || '',
          debit: p.payment_type === 'payment' ? amount : 0,
          credit: p.payment_type === 'receipt' ? amount : 0,
          balance,
        };
      });

      return { transactions, balance };
    } catch (error) {
      productionLogger.error('Error fetching statements', error);
      throw error;
    }
  }

  /**
   * جلب سجل المدفوعات
   */
  static async getPaymentsHistory(beneficiaryId: string): Promise<Database['public']['Tables']['payments']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching payments history', error);
      throw error;
    }
  }

  /**
   * جلب العقارات المرتبطة بالمستفيد
   */
  static async getProperties(beneficiaryId: string): Promise<Database['public']['Tables']['properties']['Row'][]> {
    try {
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('property_id')
        .eq('tenant_id', beneficiaryId);

      if (contractsError) throw contractsError;

      if (!contracts || contracts.length === 0) return [];

      const propertyIds = [...new Set(contracts.map(c => c.property_id).filter(Boolean))];
      
      if (propertyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching properties', error);
      throw error;
    }
  }

  /**
   * جلب طلبات الفزعات الطارئة للمستفيد
   */
  static async getEmergencyAid(beneficiaryId: string): Promise<Database['public']['Tables']['emergency_aid']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('emergency_aid')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('requested_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching emergency aid', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات المستفيد عبر RPC
   */
  static async getStatisticsRPC(beneficiaryId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_beneficiary_statistics', { p_beneficiary_id: beneficiaryId });

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary statistics via RPC', error);
      throw error;
    }
  }

  /**
   * جلب التوزيعات السنوية للمستفيد
   */
  static async getYearlyDistributions(beneficiaryId: string, year: string) {
    try {
      const { data, error } = await supabase
        .from('heir_distributions')
        .select('share_amount, distribution_date, heir_type, notes')
        .eq('beneficiary_id', beneficiaryId)
        .gte('distribution_date', `${year}-01-01`)
        .lte('distribution_date', `${year}-12-31`)
        .order('distribution_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching yearly distributions', error);
      throw error;
    }
  }

  /**
   * جلب إيرادات الإيجار الشهرية
   */
  static async getMonthlyRevenue() {
    const { data: payments, error } = await supabase
      .from("rental_payments")
      .select("payment_date, amount_due")
      .eq("status", "مدفوع")
      .order("payment_date", { ascending: false })
      .limit(200);

    if (error) throw error;
    if (!payments?.length) return [];

    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach((payment) => {
      const date = new Date(payment.payment_date);
      const monthKey = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += Number(payment.amount_due);
    });

    const chartData = Object.entries(monthlyData)
      .map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
      }));
    
    return chartData.length > 0 ? [...chartData].reverse().slice(-12) : [];
  }

  /**
   * جلب إحصائيات العقارات
   */
  static async getPropertyStats() {
    interface RentalPaymentWithContract {
      amount_paid: number | null;
      tax_amount: number | null;
      contracts: {
        payment_frequency: string | null;
      } | null;
    }

    const [propertiesRes, paymentsRes] = await Promise.all([
      supabase
        .from("properties")
        .select(`id, name, location, total_units, occupied_units, status`)
        .order("name"),
      supabase
        .from("rental_payments")
        .select(`amount_paid, tax_amount, contracts!inner (payment_frequency)`)
        .eq("status", "مدفوع"),
    ]);

    if (propertiesRes.error) throw propertiesRes.error;
    if (paymentsRes.error) throw paymentsRes.error;

    return {
      properties: propertiesRes.data || [],
      payments: (paymentsRes.data || []) as RentalPaymentWithContract[],
    };
  }

  /**
   * جلب الخط الزمني للمستفيد
   */
  static async getTimeline(beneficiaryId: string): Promise<{
    id: string;
    type: 'payment' | 'request' | 'update' | 'status_change';
    title: string;
    description: string;
    date: string;
    status?: string;
    amount?: number;
  }[]> {
    const timelineEvents: {
      id: string;
      type: 'payment' | 'request' | 'update' | 'status_change';
      title: string;
      description: string;
      date: string;
      status?: string;
      amount?: number;
    }[] = [];

    const [paymentsRes, requestsRes, activitiesRes] = await Promise.all([
      supabase.from('payments').select('id, amount, description, payment_date')
        .eq('beneficiary_id', beneficiaryId).order('payment_date', { ascending: false }).limit(10),
      supabase.from('beneficiary_requests').select('*, request_types(name_ar)')
        .eq('beneficiary_id', beneficiaryId).order('created_at', { ascending: false }).limit(10),
      supabase.from('beneficiary_activity_log').select('id, action_type, action_description, created_at')
        .eq('beneficiary_id', beneficiaryId).order('created_at', { ascending: false }).limit(10),
    ]);

    interface RequestWithType {
      id: string;
      description: string;
      created_at: string | null;
      status: string | null;
      request_types: { name_ar: string } | null;
    }
    
    paymentsRes.data?.forEach(p => timelineEvents.push({ 
      id: p.id, 
      type: 'payment', 
      title: 'دفعة مالية', 
      description: p.description || 'دفعة من الوقف', 
      date: p.payment_date, 
      amount: p.amount 
    }));
    
    requestsRes.data?.forEach((r: RequestWithType) => timelineEvents.push({ 
      id: r.id, 
      type: 'request', 
      title: r.request_types?.name_ar || 'طلب جديد', 
      description: r.description, 
      date: r.created_at || '', 
      status: r.status || undefined 
    }));
    
    activitiesRes.data?.forEach(a => timelineEvents.push({ 
      id: a.id, 
      type: a.action_type === 'update' ? 'update' : 'status_change', 
      title: a.action_description, 
      description: a.action_description, 
      date: a.created_at || '' 
    }));

    return timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
