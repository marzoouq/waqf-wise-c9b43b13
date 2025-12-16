/**
 * Financial Cards Service - خدمة البطاقات المالية
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

export interface BankBalanceData {
  id: string;
  name_ar: string;
  code: string;
  current_balance: number;
}

export interface FiscalYearCorpus {
  id: string;
  fiscal_year_id: string;
  waqf_corpus: number;
  opening_balance: number;
  closing_balance: number;
  created_at: string;
  fiscal_years: {
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
  };
}

export const FinancialCardsService = {
  /**
   * جلب رصيد البنك
   */
  async getBankBalance(): Promise<BankBalanceData | null> {
    const { data, error } = await supabase
      .from("accounts")
      .select("id, name_ar, code, current_balance")
      .eq("code", "1.1.1")
      .eq("is_active", true)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  /**
   * جلب رقبة الوقف
   */
  async getWaqfCorpus(): Promise<FiscalYearCorpus[]> {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .select(`
        id,
        fiscal_year_id,
        waqf_corpus,
        opening_balance,
        closing_balance,
        created_at,
        fiscal_years!inner (
          name,
          start_date,
          end_date,
          is_closed
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as FiscalYearCorpus[];
  },

  /**
   * جلب تقدم الإيرادات للسنة المالية
   */
  async getRevenueProgress(fiscalYear: { id: string; start_date: string; end_date: string }): Promise<{
    totalCollected: number;
    netRevenue: number;
    totalTax: number;
    expectedRevenue: number;
    progress: number;
  }> {
    const [paymentsResult, contractsResult] = await Promise.all([
      supabase
        .from("rental_payments")
        .select("amount_due, tax_amount")
        .eq("status", "مدفوع")
        .gte("payment_date", fiscalYear.start_date)
        .lte("payment_date", fiscalYear.end_date),
      supabase
        .from("contracts")
        .select("monthly_rent, payment_frequency")
        .eq("status", "نشط"), // تصحيح: استخدام الحالة العربية
    ]);

    const payments = paymentsResult.data || [];
    const contracts = contractsResult.data || [];

    const totalCollected = payments.reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const totalTax = payments.reduce((sum, p) => sum + (p.tax_amount || 0), 0);
    const netRevenue = totalCollected - totalTax;

    const expectedRevenue = contracts.reduce((sum, c) => {
      const rent = c.monthly_rent || 0;
      const frequency = c.payment_frequency || 'شهري';
      
      if (frequency === 'سنوي' || frequency === 'annual') {
        return sum + rent;
      } else if (frequency === 'ربع سنوي' || frequency === 'quarterly') {
        return sum + (rent * 4);
      } else {
        return sum + (rent * 12);
      }
    }, 0);

    // السماح بنسبة أعلى من 100% لإظهار التحصيل الزائد
    const progress = expectedRevenue > 0 
      ? (totalCollected / expectedRevenue) * 100
      : 0;

    return { totalCollected, netRevenue, totalTax, expectedRevenue, progress };
  },

  /**
   * جلب ملخص الوقف
   */
  async getWaqfSummary() {
    const { data: publicStats, error: publicError } = await supabase
      .rpc('get_waqf_public_stats');

    if (publicError) {
      productionLogger.error('Error fetching public stats:', publicError);
      throw publicError;
    }

    const stats = publicStats as {
      beneficiaries_count: number;
      properties_count: number;
      total_property_value: number;
      total_funds: number;
      total_bank_balance: number;
    };

    return {
      propertiesCount: stats.properties_count || 0,
      totalPropertyValue: stats.total_property_value || 0,
      totalFunds: stats.total_funds || 0,
      beneficiariesCount: stats.beneficiaries_count || 0,
      totalBankBalance: stats.total_bank_balance || 0,
      totalWaqfValue: (stats.total_property_value || 0) + (stats.total_bank_balance || 0),
    };
  },
};
