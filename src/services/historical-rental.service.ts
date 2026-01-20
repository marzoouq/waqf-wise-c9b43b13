/**
 * Historical Rental Details Service
 * خدمة تفاصيل الإيجارات التاريخية
 * @version 2.8.76
 */

import { supabase } from '@/integrations/supabase/client';

export interface HistoricalRentalDetail {
  id: string;
  fiscal_year_closing_id: string;
  month_date: string;
  contract_number: string | null;
  unit_number: string | null;
  floor_number: number | null;
  tenant_name: string;
  contract_start_date: string | null;
  contract_end_date: string | null;
  annual_contract_value: number | null;
  monthly_payment: number;
  payment_status: 'paid' | 'unpaid' | 'vacant';
  property_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HistoricalRentalMonthlySummary {
  fiscal_year_closing_id: string;
  month_date: string;
  month_year: string;
  month_label: string;
  total_units: number;
  paid_count: number;
  unpaid_count: number;
  vacant_count: number;
  total_collected: number;
  paid_amount: number;
}

export interface CreateHistoricalRentalInput {
  fiscal_year_closing_id: string;
  month_date: string;
  contract_number?: string;
  unit_number?: string;
  floor_number?: number;
  tenant_name: string;
  contract_start_date?: string;
  contract_end_date?: string;
  annual_contract_value?: number;
  monthly_payment?: number;
  payment_status?: 'paid' | 'unpaid' | 'vacant';
  property_name?: string;
  notes?: string;
}

export const HistoricalRentalService = {
  /**
   * جلب جميع التفاصيل لسنة مالية محددة
   */
  async getByFiscalYearClosing(closingId: string): Promise<HistoricalRentalDetail[]> {
    const { data, error } = await supabase
      .from('historical_rental_details')
      .select('*')
      .eq('fiscal_year_closing_id', closingId)
      .order('month_date', { ascending: true })
      .order('unit_number', { ascending: true });

    if (error) throw error;
    return data as HistoricalRentalDetail[];
  },

  /**
   * جلب الملخص الشهري لسنة مالية محددة
   */
  async getMonthlySummary(closingId: string): Promise<HistoricalRentalMonthlySummary[]> {
    const { data, error } = await supabase
      .from('historical_rental_monthly_summary')
      .select('*')
      .eq('fiscal_year_closing_id', closingId)
      .order('month_date', { ascending: true });

    if (error) throw error;
    return data as HistoricalRentalMonthlySummary[];
  },

  /**
   * جلب تفاصيل شهر محدد
   */
  async getByMonth(closingId: string, monthDate: string): Promise<HistoricalRentalDetail[]> {
    const { data, error } = await supabase
      .from('historical_rental_details')
      .select('*')
      .eq('fiscal_year_closing_id', closingId)
      .eq('month_date', monthDate)
      .order('property_name', { ascending: true })
      .order('unit_number', { ascending: true });

    if (error) throw error;
    return data as HistoricalRentalDetail[];
  },

  /**
   * إنشاء سجل جديد
   */
  async create(input: CreateHistoricalRentalInput): Promise<HistoricalRentalDetail> {
    const { data, error } = await supabase
      .from('historical_rental_details')
      .insert(input)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء السجل');
    return data as HistoricalRentalDetail;
  },

  /**
   * إنشاء عدة سجلات دفعة واحدة
   */
  async createBatch(inputs: CreateHistoricalRentalInput[]): Promise<HistoricalRentalDetail[]> {
    const { data, error } = await supabase
      .from('historical_rental_details')
      .insert(inputs)
      .select();

    if (error) throw error;
    return data as HistoricalRentalDetail[];
  },

  /**
   * تحديث سجل
   */
  async update(id: string, updates: Partial<CreateHistoricalRentalInput>): Promise<HistoricalRentalDetail> {
    const { data, error } = await supabase
      .from('historical_rental_details')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('السجل غير موجود');
    return data as HistoricalRentalDetail;
  },

  /**
   * حذف سجل (Soft Delete)
   * ⚠️ الحذف الفيزيائي ممنوع شرعاً
   */
  async delete(id: string, reason: string = 'تم الإلغاء'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('historical_rental_details')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
        deletion_reason: reason,
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * حذف جميع سجلات شهر محدد (Soft Delete)
   */
  async deleteByMonth(closingId: string, monthDate: string, reason: string = 'أرشفة الشهر'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('historical_rental_details')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
        deletion_reason: reason,
      })
      .eq('fiscal_year_closing_id', closingId)
      .eq('month_date', monthDate);

    if (error) throw error;
  },

  /**
   * حساب إجمالي الإيرادات لسنة مالية
   */
  async getTotalRevenue(closingId: string): Promise<number> {
    const { data, error } = await supabase
      .from('historical_rental_details')
      .select('monthly_payment')
      .eq('fiscal_year_closing_id', closingId)
      .eq('payment_status', 'paid');

    if (error) throw error;
    return data.reduce((sum, item) => sum + (item.monthly_payment || 0), 0);
  },

  /**
   * جلب closing_id من fiscal_year_id
   */
  async getClosingIdByFiscalYear(fiscalYearId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('fiscal_year_closings')
      .select('id')
      .eq('fiscal_year_id', fiscalYearId)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  }
};
