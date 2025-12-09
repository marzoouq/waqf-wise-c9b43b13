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
   * جلب آخر إفصاح سنوي
   */
  static async getLatestAnnualDisclosure() {
    const { data, error } = await supabase
      .from('annual_disclosures')
      .select('*')
      .order('year', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
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

  /**
   * جلب المستفيدين المرتبطين بالإفصاح
   */
  static async getDisclosureBeneficiariesForPDF(disclosureId: string) {
    const { data, error } = await supabase
      .from('disclosure_beneficiaries')
      .select('*')
      .eq('disclosure_id', disclosureId);

    if (error) throw error;
    return data || [];
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

  /**
   * جلب الإفصاحات السنوية
   */
  static async getAnnualDisclosures() {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("id, year, waqf_name, fiscal_year_id, disclosure_date, opening_balance, closing_balance, total_revenues, total_expenses, administrative_expenses, maintenance_expenses, development_expenses, other_expenses, net_income, nazer_percentage, nazer_share, charity_percentage, charity_share, corpus_percentage, corpus_share, sons_count, daughters_count, wives_count, total_beneficiaries, status, published_at, published_by, bank_statement_url, beneficiaries_details, expenses_breakdown, created_at, updated_at")
      .order("year", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الإفصاح السنوي الحالي
   */
  static async getCurrentYearDisclosure() {
    const currentYear = new Date().getFullYear();
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("id, year, waqf_name, fiscal_year_id, disclosure_date, opening_balance, closing_balance, total_revenues, total_expenses, administrative_expenses, maintenance_expenses, development_expenses, other_expenses, net_income, nazer_percentage, nazer_share, charity_percentage, charity_share, corpus_percentage, corpus_share, sons_count, daughters_count, wives_count, total_beneficiaries, status, published_at, published_by, bank_statement_url, beneficiaries_details, expenses_breakdown, created_at, updated_at")
      .eq("year", currentYear)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * توليد إفصاح سنوي
   */
  static async generateAnnualDisclosure(year: number, waqfName: string) {
    const { data, error } = await supabase.rpc("generate_annual_disclosure", {
      p_year: year,
      p_waqf_name: waqfName,
    });

    if (error) throw error;
    return data;
  }

  /**
   * نشر إفصاح سنوي
   */
  static async publishDisclosure(disclosureId: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("annual_disclosures")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        published_by: userData.user?.id,
      })
      .eq("id", disclosureId)
      .select()
      .single();

    if (error) throw error;
    
    // إرسال إشعارات للمستفيدين
    try {
      await supabase.functions.invoke('notify-disclosure-published', {
        body: { disclosure_id: disclosureId }
      });
    } catch (err) {
      logger.error(err, { context: 'notify_disclosure_published' });
    }
    
    return data;
  }

  /**
   * جلب مستفيدي الإفصاح
   */
  static async getDisclosureBeneficiaries(disclosureId: string) {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("id, disclosure_id, beneficiary_id, beneficiary_name, beneficiary_type, relationship, allocated_amount, payments_count, created_at")
      .eq("disclosure_id", disclosureId)
      .order("allocated_amount", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب إيرادات الوقف حسب السنة المالية
   */
  static async getWaqfRevenue(
    fiscalYearId: string,
    selectedYear: { id: string; name: string; start_date: string; end_date: string; is_active: boolean; is_closed: boolean },
    waqfUnitId?: string
  ) {
    // للسنوات المغلقة
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

    // للسنة النشطة
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
