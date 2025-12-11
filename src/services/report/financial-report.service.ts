/**
 * Financial Report Service - خدمة التقارير المالية
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { productionLogger } from "@/lib/logger/production-logger";
import type { PropertyRow, ContractRow } from "@/types/supabase-helpers";

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface PropertyWithContracts extends PropertyRow {
  contracts: ContractRow[];
}

export interface OperationRecord {
  id: string;
  type: string;
  number: string;
  description: string;
  amount: number;
  date: string;
  journal_entry_id: string;
}

export class FinancialReportService {
  /**
   * جلب تقرير ربط المحاسبة
   */
  static async getAccountingLinkReport(): Promise<{
    linked: number;
    unlinked: number;
    entries: { entry_id: string; description: string; is_linked: boolean }[];
  }> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, description, reference_id')
        .order('entry_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      const entries = (data || []).map(e => ({
        entry_id: e.id,
        description: e.description || '',
        is_linked: !!e.reference_id,
      }));

      const linked = entries.filter(e => e.is_linked).length;
      const unlinked = entries.filter(e => !e.is_linked).length;

      return { linked, unlinked, entries };
    } catch (error) {
      logger.error(error, { context: 'get_accounting_link_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب تقرير أعمار الديون
   */
  static async getAgingReport(): Promise<{
    buckets: { label: string; amount: number; count: number }[];
    total: number;
  }> {
    try {
      const { data: ledger, error } = await supabase
        .from('tenant_ledger')
        .select('*')
        .eq('transaction_type', 'charge')
        .order('transaction_date');

      if (error) throw error;

      const now = new Date();
      const buckets = [
        { label: '0-30 يوم', amount: 0, count: 0 },
        { label: '31-60 يوم', amount: 0, count: 0 },
        { label: '61-90 يوم', amount: 0, count: 0 },
        { label: 'أكثر من 90 يوم', amount: 0, count: 0 },
      ];

      (ledger || []).forEach(entry => {
        const days = Math.floor((now.getTime() - new Date(entry.transaction_date).getTime()) / (1000 * 60 * 60 * 24));
        const amount = entry.debit_amount || 0;

        if (days <= 30) {
          buckets[0].amount += amount;
          buckets[0].count++;
        } else if (days <= 60) {
          buckets[1].amount += amount;
          buckets[1].count++;
        } else if (days <= 90) {
          buckets[2].amount += amount;
          buckets[2].count++;
        } else {
          buckets[3].amount += amount;
          buckets[3].count++;
        }
      });

      const total = buckets.reduce((sum, b) => sum + b.amount, 0);

      return { buckets, total };
    } catch (error) {
      logger.error(error, { context: 'get_aging_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب تقرير انحراف الميزانية
   */
  static async getBudgetVarianceReport(fiscalYearId?: string): Promise<{
    accounts: { account_name: string; budgeted: number; actual: number; variance: number; variance_pct: number }[];
  }> {
    try {
      let query = supabase
        .from('budgets')
        .select('*, accounts(name_ar)');

      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const accounts = (data || []).map(b => {
        const budgeted = b.budgeted_amount || 0;
        const actual = b.actual_amount || 0;
        const variance = actual - budgeted;
        const variance_pct = budgeted > 0 ? (variance / budgeted) * 100 : 0;

        return {
          account_name: (b.accounts as { name_ar: string })?.name_ar || '',
          budgeted,
          actual,
          variance,
          variance_pct,
        };
      });

      return { accounts };
    } catch (error) {
      logger.error(error, { context: 'get_budget_variance_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب تقرير التدفق النقدي
   */
  static async getCashFlowReport(fiscalYearId?: string): Promise<{
    operating: number;
    investing: number;
    financing: number;
    netChange: number;
    openingCash: number;
    closingCash: number;
  }> {
    try {
      let query = supabase.from('cash_flows').select('*');

      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query.order('period_start', { ascending: false }).limit(1);

      if (error) throw error;

      const flow = data?.[0];
      
      return {
        operating: flow?.operating_activities || 0,
        investing: flow?.investing_activities || 0,
        financing: flow?.financing_activities || 0,
        netChange: flow?.net_cash_flow || 0,
        openingCash: flow?.opening_cash || 0,
        closingCash: flow?.closing_cash || 0,
      };
    } catch (error) {
      logger.error(error, { context: 'get_cash_flow_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب بيانات التدفقات النقدية
   */
  static async getCashFlowData(): Promise<CashFlowData[]> {
    try {
      const { data, error } = await supabase
        .from("unified_transactions_view")
        .select("transaction_date, amount, transaction_type")
        .gte("transaction_date", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const monthlyData: Record<string, { income: number; expense: number }> = {};

      (data || []).forEach((transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
        });

        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }

        if (transaction.transaction_type === "قبض") {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expense += transaction.amount;
        }
      });

      const chartData: CashFlowData[] = Object.entries(monthlyData).map(([month, d]) => ({
        month,
        income: d.income,
        expense: d.expense,
        net: d.income - d.expense,
      }));

      return chartData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      productionLogger.error("Error fetching cash flow data", error);
      throw error;
    }
  }

  /**
   * جلب تقرير العقارات
   */
  static async getPropertiesReport(): Promise<PropertyWithContracts[]> {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          contracts (
            id,
            contract_number,
            tenant_name,
            monthly_rent,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyWithContracts[];
    } catch (error) {
      productionLogger.error("Error fetching properties report", error);
      throw error;
    }
  }

  /**
   * جلب العمليات المرتبطة محاسبياً
   */
  static async getLinkedOperations(): Promise<OperationRecord[]> {
    try {
      const operations: OperationRecord[] = [];

      const { data: payments } = await supabase
        .from("payments")
        .select("*, journal_entries:journal_entry_id(*)")
        .not("journal_entry_id", "is", null);
      
      if (payments) {
        operations.push(...payments.map(p => ({
          id: p.id,
          type: "سند",
          number: p.payment_number,
          description: p.description || '',
          amount: p.amount,
          date: p.payment_date,
          journal_entry_id: p.journal_entry_id,
        })));
      }

      return operations;
    } catch (error) {
      productionLogger.error("Error fetching linked operations", error);
      throw error;
    }
  }

  /**
   * جلب العقارات مع العقود
   */
  static async getPropertiesWithContracts() {
    const { data, error } = await supabase
      .from('properties')
      .select(`*, contracts:contracts(*)`)
      .order('name');

    if (error) throw error;
    return data || [];
  }
}
