import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { ReportTemplate, ReportData, ReportFilters } from "@/types/reports/index";
import type { Json } from "@/integrations/supabase/types";

export type { ReportTemplate };

/**
 * خدمة إدارة التقارير المخصصة
 */
export class ReportService {
  /**
   * إنشاء قالب تقرير جديد
   */
  static async createTemplate(template: ReportTemplate) {
    try {
      const { data, error } = await supabase
        .from("report_templates")
        .insert([template])
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(`تم إنشاء قالب تقرير: ${template.template_name}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error(error, {
        context: "create_report_template",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * الحصول على جميع قوالب التقارير
   */
  static async getTemplates(type?: string) {
    try {
      let query = supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("report_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        templates: data || [],
      };
    } catch (error) {
      logger.error(error, {
        context: "get_report_templates",
        severity: "low",
      });
      throw error;
    }
  }

  /**
   * توليد تقرير من قالب
   */
  static async generateReport(templateId: string, customFilters?: ReportFilters) {
    try {
      // الحصول على القالب
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // توليد البيانات حسب نوع التقرير
      let reportData: ReportData[] = [];
      
      switch (template.report_type) {
        case "distributions":
          const { data: distributions } = await supabase
            .from("distributions")
            .select("*")
            .order("distribution_date", { ascending: false })
            .limit(100);
          reportData = distributions || [];
          break;

        case "beneficiaries":
          const { data: beneficiaries } = await supabase
            .from("beneficiaries")
            .select("*")
            .eq("status", "نشط")
            .order("full_name");
          reportData = beneficiaries || [];
          break;

        case "financial":
          const { data: entries } = await supabase
            .from("journal_entries")
            .select("*")
            .order("entry_date", { ascending: false })
            .limit(100);
          reportData = entries || [];
          break;

        default:
          throw new Error(`نوع تقرير غير مدعوم: ${template.report_type}`);
      }

      await this.logActivity(`تم توليد تقرير: ${template.template_name}`);

      return {
        success: true,
        template,
        data: reportData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(error, {
        context: "generate_report",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * حذف قالب تقرير
   */
  static async deleteTemplate(templateId: string) {
    try {
      const { error } = await supabase
        .from("report_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      await this.logActivity(`تم حذف قالب تقرير`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(error, {
        context: "delete_report_template",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * تسجيل نشاط
   */
  private static async logActivity(action: string) {
    try {
      await supabase.from("activities").insert([
        {
          user_name: "النظام",
          action,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      logger.error(error, {
        context: "log_report_activity",
        severity: "low",
      });
    }
  }

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
        .eq('status', 'paid');

      if (error) throw error;

      const totalDistributed = (distributions || []).reduce((sum, d) => sum + (d.total_amount || 0), 0);

      // تجميع حسب السنة
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
        supabase.from('beneficiaries').select('status').eq('status', 'active'),
        supabase.from('properties').select('status'),
        supabase.from('distributions').select('total_amount, status'),
        supabase.from('payments').select('amount, payment_type'),
      ]);

      const totalBeneficiaries = beneficiaries.data?.length || 0;
      const totalProperties = properties.data?.length || 0;
      const totalDistributed = (distributions.data || [])
        .filter(d => d.status === 'paid')
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
        .eq('status', 'active');

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

      // تجميع حسب العقار
      const byPropertyMap: Record<string, number> = {};
      (data || []).forEach(r => {
        const name = (r.properties as { name: string })?.name || 'غير محدد';
        byPropertyMap[name] = (byPropertyMap[name] || 0) + (r.actual_cost || 0);
      });

      const byProperty = Object.entries(byPropertyMap).map(([propertyName, amount]) => ({
        propertyName,
        amount,
      }));

      return {
        totalCost,
        byCategory: [],
        byProperty,
      };
    } catch (error) {
      logger.error(error, { context: 'get_maintenance_cost_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * حفظ تقرير مخصص
   */
  static async saveCustomReport(data: {
    name: string;
    type: string;
    filters: Record<string, unknown>;
    columns: string[];
  }): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase.from('report_templates').insert([{
        template_name: data.name,
        report_type: data.type,
        columns: data.columns,
        filters: data.filters as unknown as Json,
        is_public: false,
      }]);

      if (error) throw error;

      await this.logActivity(`تم حفظ تقرير مخصص: ${data.name}`);

      return { success: true };
    } catch (error) {
      logger.error(error, { context: 'save_custom_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب التقارير المجدولة
   */
  static async getScheduledReports(): Promise<{ id: string; name: string; schedule: string; next_run: string }[]> {
    try {
      // استخدام report_templates كبديل
      const { data, error } = await supabase
        .from('report_templates')
        .select('id, template_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        name: r.template_name,
        schedule: 'يومي',
        next_run: new Date().toISOString(),
      }));
    } catch (error) {
      logger.error(error, { context: 'get_scheduled_reports', severity: 'low' });
      throw error;
    }
  }
}
