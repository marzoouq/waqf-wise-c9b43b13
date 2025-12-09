/**
 * Fiscal Year Service - خدمة السنوات المالية
 * @version 2.7.0
 * 
 * إدارة السنوات المالية وإغلاقها ونشرها
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type FiscalYear = Database['public']['Tables']['fiscal_years']['Row'];
type FiscalYearInsert = Database['public']['Tables']['fiscal_years']['Insert'];

export interface FiscalYearSummary {
  totalRevenues: number;
  totalExpenses: number;
  netIncome: number;
  nazerShare: number;
  waqifShare: number;
  beneficiaryShare: number;
  waqfCorpus: number;
}

export interface FiscalYearClosureResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class FiscalYearService {
  /**
   * جلب جميع السنوات المالية
   */
  static async getAll(): Promise<FiscalYear[]> {
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('*')
      .order('year_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب سنة مالية بالمعرف
   */
  static async getById(id: string): Promise<FiscalYear | null> {
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * جلب السنة المالية النشطة
   */
  static async getActive(): Promise<FiscalYear | null> {
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * إنشاء سنة مالية جديدة
   */
  static async create(fiscalYear: FiscalYearInsert): Promise<FiscalYear> {
    const { data, error } = await supabase
      .from('fiscal_years')
      .insert(fiscalYear)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء السنة المالية');
    return data;
  }

  /**
   * إنشاء سنة مالية مع بيانات الإقفال (للسنوات التاريخية)
   */
  static async createWithClosing(
    fiscalYear: FiscalYearInsert,
    closingData: {
      closing_date: string;
      total_revenues: number;
      total_expenses: number;
      nazer_share: number;
      waqif_share: number;
      beneficiary_distributions: number;
      waqf_corpus: number;
      notes?: string;
    }
  ): Promise<FiscalYear> {
    // 1. إنشاء السنة المالية
    const { data: fy, error: fyError } = await supabase
      .from('fiscal_years')
      .insert(fiscalYear)
      .select()
      .maybeSingle();

    if (fyError) throw fyError;
    if (!fy) throw new Error('فشل إنشاء السنة المالية');

    // 2. إنشاء سجل الإقفال
    const { error: closingError } = await supabase
      .from('fiscal_year_closings')
      .insert({
        fiscal_year_id: fy.id,
        closing_date: closingData.closing_date,
        closing_type: 'manual',
        total_revenues: closingData.total_revenues,
        rental_revenues: closingData.total_revenues,
        other_revenues: 0,
        total_expenses: closingData.total_expenses,
        administrative_expenses: 0,
        maintenance_expenses: 0,
        development_expenses: 0,
        other_expenses: closingData.total_expenses,
        nazer_percentage: 10,
        nazer_share: closingData.nazer_share,
        waqif_percentage: 5,
        waqif_share: closingData.waqif_share,
        total_beneficiary_distributions: closingData.beneficiary_distributions,
        heirs_count: 14,
        total_vat_collected: 0,
        total_vat_paid: 0,
        net_vat: 0,
        zakat_amount: 0,
        net_income: closingData.total_revenues - closingData.total_expenses,
        waqf_corpus: closingData.waqf_corpus,
        opening_balance: 0,
        closing_balance: closingData.waqf_corpus,
        notes: closingData.notes || 'سنة تاريخية مؤرشفة',
      });

    if (closingError) throw closingError;

    return fy;
  }

  /**
   * تحديث سنة مالية
   */
  static async update(id: string, updates: Partial<FiscalYear>): Promise<FiscalYear> {
    const { data, error } = await supabase
      .from('fiscal_years')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * إغلاق سنة مالية
   */
  static async close(id: string): Promise<FiscalYearClosureResult> {
    const { data, error } = await supabase
      .from('fiscal_years')
      .update({
        is_closed: true,
        is_active: false,
        status: 'closed',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data };
  }

  /**
   * حساب ملخص السنة المالية
   */
  static async calculateSummary(id: string): Promise<FiscalYearSummary> {
    // جلب السنة المالية
    const fiscalYear = await this.getById(id);
    if (!fiscalYear) {
      throw new Error('السنة المالية غير موجودة');
    }

    // جلب الإيرادات من القيود
    const { data: revenueData } = await supabase
      .from('journal_entry_lines')
      .select(`
        credit_amount,
        journal_entries!inner(entry_date, status, fiscal_year_id)
      `)
      .eq('journal_entries.fiscal_year_id', id)
      .eq('journal_entries.status', 'posted');

    // جلب المصروفات
    const { data: expenseData } = await supabase
      .from('journal_entry_lines')
      .select(`
        debit_amount,
        journal_entries!inner(entry_date, status, fiscal_year_id)
      `)
      .eq('journal_entries.fiscal_year_id', id)
      .eq('journal_entries.status', 'posted');

    const totalRevenues = revenueData?.reduce((sum, r) => sum + (r.credit_amount || 0), 0) || 0;
    const totalExpenses = expenseData?.reduce((sum, e) => sum + (e.debit_amount || 0), 0) || 0;
    const netIncome = totalRevenues - totalExpenses;

    // حساب الحصص
    const nazerShare = netIncome * 0.10;
    const waqifShare = netIncome * 0.05;
    const beneficiaryShare = netIncome * 0.85;
    const waqfCorpus = netIncome * 0.00; // يحسب بعد التوزيع

    return {
      totalRevenues,
      totalExpenses,
      netIncome,
      nazerShare,
      waqifShare,
      beneficiaryShare,
      waqfCorpus,
    };
  }

  /**
   * استدعاء Edge Function لإغلاق السنة المالية
   */
  static async invokeFiscalYearClosure(
    fiscalYearId: string,
    preview: boolean = false
  ): Promise<FiscalYearClosureResult> {
    const { data, error } = await supabase.functions.invoke('auto-close-fiscal-year', {
      body: { fiscalYearId, preview },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data };
  }

  /**
   * نشر السنة المالية للمستفيدين
   */
  static async publish(
    id: string,
    notifyHeirs: boolean = true
  ): Promise<FiscalYearClosureResult> {
    const { data, error } = await supabase.functions.invoke('publish-fiscal-year', {
      body: { fiscalYearId: id, notifyHeirs },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // تحديث حالة النشر
    await supabase
      .from('fiscal_years')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', id);

    return { success: true, data };
  }

  /**
   * جلب بيانات إغلاق السنة المالية
   */
  static async getClosingData(fiscalYearId: string) {
    const { data, error } = await supabase
      .from('fiscal_year_closings')
      .select('*')
      .eq('fiscal_year_id', fiscalYearId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * جلب حالة النشر
   */
  static async getPublishStatus(fiscalYearId: string): Promise<{
    isPublished: boolean;
    publishedAt?: string;
  }> {
    const fiscalYear = await this.getById(fiscalYearId);
    
    return {
      isPublished: fiscalYear?.is_published || false,
      publishedAt: fiscalYear?.published_at || undefined,
    };
  }

  /**
   * جلب السنوات المالية النشطة
   */
  static async getActiveFiscalYears() {
    const { data, error } = await supabase
      .from("fiscal_years")
      .select("*")
      .eq("is_active", true)
      .order("start_date", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب معاينة إغلاق السنة المالية
   */
  static async getClosingPreview(fiscalYearId: string) {
    const { data, error } = await supabase.functions.invoke("auto-close-fiscal-year", {
      body: { fiscal_year_id: fiscalYearId, preview_only: true }
    });
    
    if (error) throw error;
    return data;
  }
}
