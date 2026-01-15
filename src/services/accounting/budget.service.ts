/**
 * Budget Service - خدمة الميزانيات
 * إدارة الميزانيات والتنبؤات المالية
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database, Json } from '@/integrations/supabase/types';

export interface FinancialKPIInsert {
  kpi_name: string;
  kpi_category: string;
  kpi_value: number;
  kpi_target?: number | null;
  period_start: string;
  period_end: string;
  fiscal_year_id?: string | null;
  metadata?: Json | null;
}

export interface FinancialForecastInsert {
  forecast_type: string;
  account_id?: string | null;
  period_start: string;
  period_end: string;
  forecasted_amount: number;
  actual_amount?: number | null;
  variance?: number | null;
  confidence_level?: number | null;
  model_used?: string | null;
  metadata?: Json | null;
}

export class BudgetService {
  /**
   * جلب الميزانيات
   */
  static async getBudgets(fiscalYearId?: string): Promise<Database['public']['Tables']['budgets']['Row'][]> {
    try {
      let query = supabase.from('budgets').select('*');
      
      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query.order('period_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching budgets', error);
      throw error;
    }
  }

  /**
   * جلب الميزانيات مع بيانات الحسابات
   */
  static async getBudgetsWithAccounts(fiscalYearId?: string): Promise<(Database['public']['Tables']['budgets']['Row'] & { accounts?: { code: string; name_ar: string; account_type: string } })[]> {
    try {
      let query = supabase.from('budgets').select(`
        *,
        accounts:account_id (
          code,
          name_ar,
          account_type
        )
      `);
      
      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query.order('period_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching budgets with accounts', error);
      throw error;
    }
  }

  /**
   * إنشاء ميزانية
   */
  static async createBudget(budget: Database['public']['Tables']['budgets']['Insert']): Promise<Database['public']['Tables']['budgets']['Row']> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء الميزانية');
      return data;
    } catch (error) {
      productionLogger.error('Error creating budget', error);
      throw error;
    }
  }

  /**
   * تحديث ميزانية
   */
  static async updateBudget(id: string, updates: Partial<Database['public']['Tables']['budgets']['Row']>): Promise<Database['public']['Tables']['budgets']['Row'] | null> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating budget', error);
      throw error;
    }
  }

  /**
   * حذف ميزانية
   */
  static async deleteBudget(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting budget', error);
      throw error;
    }
  }

  /**
   * حساب انحرافات الميزانية
   */
  static async calculateBudgetVariances(fiscalYearId: string): Promise<void> {
    try {
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('id, account_id, budgeted_amount')
        .eq('fiscal_year_id', fiscalYearId);

      if (budgetsError) throw budgetsError;

      for (const budget of budgetsData || []) {
        const { data: actualData, error: actualError } = await supabase
          .from('journal_entry_lines')
          .select('debit_amount, credit_amount')
          .eq('account_id', budget.account_id);

        if (actualError) throw actualError;

        const actualAmount = actualData?.reduce((sum, line) => 
          sum + ((line.debit_amount || 0) - (line.credit_amount || 0)), 0) || 0;

        const varianceAmount = budget.budgeted_amount - actualAmount;

        await supabase
          .from('budgets')
          .update({
            actual_amount: actualAmount,
            variance_amount: varianceAmount,
          })
          .eq('id', budget.id);
      }
    } catch (error) {
      productionLogger.error('Error calculating budget variances', error);
      throw error;
    }
  }

  /**
   * جلب الميزانيات حسب نوع الفترة
   */
  static async getBudgetsByPeriod(periodType: string) {
    const { data, error } = await supabase
      .from("budgets")
      .select(`
        *,
        accounts (
          code,
          name_ar
        )
      `)
      .eq("period_type", periodType)
      .order("accounts(code)", { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الميزانيات حسب السنة المالية
   */
  static async getBudgetsByFiscalYear(fiscalYearId: string) {
    if (!fiscalYearId) return [];
    
    const { data, error } = await supabase
      .from('budgets')
      .select('*, accounts(code, name_ar)')
      .eq('fiscal_year_id', fiscalYearId)
      .order('variance_amount', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب مؤشرات الأداء المالي
   */
  static async getFinancialKPIs(fiscalYearId?: string): Promise<{
    id: string;
    kpi_name: string;
    kpi_category: string;
    kpi_value: number;
    kpi_target?: number;
    period_start: string;
    period_end: string;
    fiscal_year_id?: string;
    metadata?: Record<string, number | undefined>;
    created_at: string;
  }[]> {
    let query = supabase
      .from('financial_kpis')
      .select('id, kpi_name, kpi_category, kpi_value, kpi_target, period_start, period_end, fiscal_year_id, metadata, created_at')
      .order('created_at', { ascending: false });

    if (fiscalYearId) {
      query = query.eq('fiscal_year_id', fiscalYearId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as {
      id: string;
      kpi_name: string;
      kpi_category: string;
      kpi_value: number;
      kpi_target?: number;
      period_start: string;
      period_end: string;
      fiscal_year_id?: string;
      metadata?: Record<string, number | undefined>;
      created_at: string;
    }[];
  }

  /**
   * جلب التنبؤات المالية
   */
  static async getFinancialForecasts() {
    const { data, error } = await supabase
      .from('financial_forecasts')
      .select('*, accounts(*)')
      .order('period_start', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * حفظ مؤشرات الأداء
   */
  static async saveFinancialKPIs(kpis: FinancialKPIInsert[]): Promise<void> {
    const { error } = await supabase
      .from('financial_kpis')
      .insert(kpis);

    if (error) throw error;
  }

  /**
   * حفظ التنبؤات المالية
   */
  static async saveFinancialForecasts(forecasts: FinancialForecastInsert[]): Promise<void> {
    const { error } = await supabase
      .from('financial_forecasts')
      .insert(forecasts);

    if (error) throw error;
  }
}
