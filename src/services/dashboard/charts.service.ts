/**
 * Charts Service - خدمة الرسوم البيانية
 */

import { supabase } from "@/integrations/supabase/client";

export interface BudgetComparisonItem {
  account: string;
  budgeted: number;
  actual: number;
  variance: number;
}

export interface MonthlyChartData {
  month: string;
  revenue: number;
  expense: number;
}

interface JournalLineWithRelations {
  debit_amount: number;
  credit_amount: number;
  journal_entries: { entry_date: string };
  accounts: { account_type: string; account_nature: string };
}

export const ChartsService = {
  /**
   * جلب بيانات أداء العقارات
   */
  async getPropertiesPerformance() {
    const { data: contractsData } = await supabase
      .from('contracts')
      .select(`
        id,
        properties(name),
        rental_payments(amount_paid, status)
      `)
      .eq('status', 'نشط')
      .limit(6);

    const propertyStats: { [key: string]: { revenue: number, paid: number, pending: number } } = {};

    if (contractsData) {
      contractsData.forEach(contract => {
        const propertyName = contract.properties?.name || 'غير محدد';
        
        if (!propertyStats[propertyName]) {
          propertyStats[propertyName] = { revenue: 0, paid: 0, pending: 0 };
        }

        if (contract.rental_payments) {
          contract.rental_payments.forEach((payment: { amount_paid: number; status: string }) => {
            propertyStats[propertyName].revenue += payment.amount_paid || 0;
            
            if (payment.status === 'مدفوع') {
              propertyStats[propertyName].paid += payment.amount_paid || 0;
            } else if (payment.status === 'معلق' || payment.status === 'متأخر') {
              propertyStats[propertyName].pending += payment.amount_paid || 0;
            }
          });
        }
      });
    }

    return Object.entries(propertyStats)
      .map(([name, stats]) => ({
        name,
        'الإيرادات الكلية': stats.revenue,
        'المدفوع': stats.paid,
        'المعلق': stats.pending
      }))
      .slice(0, 6);
  },

  /**
   * جلب بيانات توزيع الإيرادات
   */
  async getRevenueDistribution() {
    const { data: revenueData } = await supabase
      .from('journal_entry_lines')
      .select(`
        credit_amount,
        debit_amount,
        accounts:accounts!fk_jel_account(name_ar, account_type)
      `)
      .limit(50);

    const revenueByType: { [key: string]: number } = {};

    if (revenueData) {
      revenueData.forEach((line: { accounts: { name_ar: string; account_type: string } | null; credit_amount: number; debit_amount: number }) => {
        // Filter only revenue accounts
        if (line.accounts?.account_type !== 'revenue') return;
        
        const accountName = line.accounts?.name_ar || 'غير محدد';
        const amount = (line.credit_amount || 0) - (line.debit_amount || 0);
        
        if (!revenueByType[accountName]) {
          revenueByType[accountName] = 0;
        }
        revenueByType[accountName] += amount;
      });
    }

    const chartData = Object.entries(revenueByType)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: 0
      }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });

    return chartData;
  },

  /**
   * جلب بيانات مقارنة الميزانية
   */
  async getBudgetComparison(): Promise<BudgetComparisonItem[]> {
    const { data: budgets, error } = await supabase
      .from("budgets")
      .select(`
        budgeted_amount,
        actual_amount,
        variance_amount,
        accounts!inner (
          name_ar
        )
      `)
      .limit(10);

    if (error) throw error;

    return budgets?.map((budget: { accounts: { name_ar: string }; budgeted_amount: number; actual_amount: number; variance_amount: number }) => ({
      account: budget.accounts.name_ar.substring(0, 15) + '...',
      budgeted: Number(budget.budgeted_amount || 0),
      actual: Number(budget.actual_amount || 0),
      variance: Number(budget.variance_amount || 0),
    })) || [];
  },

  /**
   * جلب بيانات رسم الإيرادات والمصروفات
   */
  async getRevenueExpenseChartData(): Promise<MonthlyChartData[]> {
    const { data: entries, error } = await supabase
      .from("journal_entry_lines")
      .select(`
        debit_amount,
        credit_amount,
        journal_entries:journal_entries!fk_jel_journal_entry (
          entry_date
        ),
        accounts:accounts!fk_jel_account (
          account_type,
          account_nature
        )
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const monthlyMap = new Map<string, { revenue: number; expense: number }>();

    entries?.forEach((line: JournalLineWithRelations) => {
      const date = new Date(line.journal_entries.entry_date);
      const monthKey = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { revenue: 0, expense: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      const accountType = line.accounts.account_type;
      const accountNature = line.accounts.account_nature;
      const debit = Number(line.debit_amount || 0);
      const credit = Number(line.credit_amount || 0);

      if (accountType === 'revenue') {
        monthData.revenue += accountNature === 'credit' ? credit - debit : debit - credit;
      } else if (accountType === 'expense') {
        monthData.expense += accountNature === 'debit' ? debit - credit : credit - debit;
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, values]) => ({
      month,
      revenue: values.revenue,
      expense: values.expense,
    }));
  },
};
