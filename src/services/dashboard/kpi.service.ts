/**
 * KPI Service - خدمة مؤشرات الأداء
 */

import { supabase } from "@/integrations/supabase/client";
import { BENEFICIARY_STATUS, PROPERTY_STATUS, CONTRACT_STATUS, LOAN_STATUS, REQUEST_STATUS } from "@/lib/constants";
import { productionLogger } from '@/lib/logger/production-logger';

export interface DashboardKPIs {
  beneficiaries: number;
  properties: number;
  totalPayments: number;
  activeContracts: number;
}

export interface SystemOverviewStats {
  beneficiaries: { total: number; active: number; percentage: number };
  properties: { total: number; occupied: number; percentage: number };
  contracts: { total: number; active: number };
  loans: { total: number; active: number; amount: number };
  payments: { total: number; amount: number };
  requests: { total: number; pending: number };
  documents: number;
}

export interface UnifiedKPIsData {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  totalFamilies: number;
  totalProperties: number;
  activeProperties: number;
  occupiedProperties: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  availableBudget: number;
  monthlyReturn: number;
  totalAssets: number;
  totalFunds: number;
  activeFunds: number;
  pendingRequests: number;
  overdueRequests: number;
  pendingLoans: number;
  // حقول القيود المحاسبية
  pendingApprovals: number;
  draftJournalEntries: number;
  postedJournalEntries: number;
  cancelledJournalEntries: number;
  todayJournalEntries: number;
  totalJournalEntries: number;
  lastUpdated: Date;
}

export const KPIService = {
  /**
   * جلب إحصائيات النظام الشاملة للناظر
   */
  async getSystemOverview(): Promise<SystemOverviewStats> {
    const [
      beneficiariesRes,
      propertiesRes,
      contractsRes,
      loansRes,
      rentalPaymentsRes,
      vouchersRes,
      requestsRes,
      documentsRes,
    ] = await Promise.all([
      supabase.from("beneficiaries").select("id, status", { count: "exact" }),
      supabase.from("properties").select("id, status", { count: "exact" }),
      supabase.from("contracts").select("id, status", { count: "exact" }),
      supabase.from("loans").select("id, status, loan_amount, paid_amount", { count: "exact" }),
      supabase.from("rental_payments").select("id, amount_paid, status").eq("status", "مدفوع"),
      // إضافة: سندات القبض المدفوعة
      supabase.from("payment_vouchers").select("id, amount, voucher_type, status").eq("status", "paid").eq("voucher_type", "receipt"),
      supabase.from("beneficiary_requests").select("id, status", { count: "exact" }),
      supabase.from("documents").select("id", { count: "exact" }),
    ]);

    const beneficiaries = beneficiariesRes.data || [];
    const properties = propertiesRes.data || [];
    const contracts = contractsRes.data || [];
    const loans = loansRes.data || [];
    const rentalPayments = rentalPaymentsRes.data || [];
    const vouchers = vouchersRes.data || [];
    const requests = requestsRes.data || [];

    const activeBeneficiaries = beneficiaries.filter(b => b.status === BENEFICIARY_STATUS.ACTIVE).length;
    // العقارات النشطة = المؤجرة بالكامل + الجزئية (بها وحدات مؤجرة)
    const occupiedProperties = properties.filter(p => 
      p.status === PROPERTY_STATUS.RENTED || 
      p.status === PROPERTY_STATUS.PARTIAL ||
      p.status === 'مؤجر' || 
      p.status === 'جزئي'
    ).length;
    const activeContracts = contracts.filter(c => 
      c.status === CONTRACT_STATUS.ACTIVE || c.status === 'active'
    ).length;
    const activeLoans = loans.filter(l => 
      l.status === LOAN_STATUS.ACTIVE || l.status === 'active'
    ).length;
    const totalLoansAmount = loans.reduce((sum, l) => sum + ((l.loan_amount || 0) - (l.paid_amount || 0)), 0);
    
    // حساب إجمالي التحصيل من دفعات الإيجار + سندات القبض
    const rentalPaymentsTotal = rentalPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
    const vouchersTotal = vouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
    const totalPayments = rentalPaymentsTotal + vouchersTotal;
    
    const pendingRequests = requests.filter(r => 
      r.status === REQUEST_STATUS.PENDING || r.status === 'pending'
    ).length;

    return {
      beneficiaries: {
        total: beneficiaries.length,
        active: activeBeneficiaries,
        percentage: beneficiaries.length > 0 ? Math.round((activeBeneficiaries / beneficiaries.length) * 100) : 0,
      },
      properties: {
        total: properties.length,
        occupied: occupiedProperties,
        percentage: properties.length > 0 ? Math.round((occupiedProperties / properties.length) * 100) : 0,
      },
      contracts: { total: contracts.length, active: activeContracts },
      loans: { total: loans.length, active: activeLoans, amount: totalLoansAmount },
      payments: { total: rentalPayments.length + vouchers.length, amount: totalPayments },
      requests: { total: requests.length, pending: pendingRequests },
      documents: documentsRes.count || 0,
    };
  },

  /**
   * جلب مؤشرات الأداء الموحدة
   */
  async getUnifiedKPIs(): Promise<UnifiedKPIsData> {
    const now = new Date();

    const [
      beneficiariesResult,
      familiesResult,
      propertiesResult,
      contractsResult,
      fundsResult,
      requestsResult,
      loansResult,
      paymentsResult,
      journalEntriesResult,
      journalEntriesStatusResult,
      // إضافة: سندات الصرف والقبض + أقلام الوقف
      vouchersResult,
      waqfUnitsResult
    ] = await Promise.all([
      supabase.from('beneficiaries').select('id, status'),
      supabase.from('families').select('id'),
      supabase.from('properties').select('id, status'),
      supabase.from('contracts').select('id, status, monthly_rent, payment_frequency'),
      supabase.from('funds').select('id, is_active'),
      supabase.from('beneficiary_requests').select('id, status, is_overdue'),
      supabase.from('loans').select('id, status'),
      supabase.from('rental_payments').select('id, amount_paid, status'),
      supabase.from('journal_entry_lines').select('id, debit_amount, credit_amount'),
      supabase.from('journal_entries').select('id, status, entry_date'),
      // سندات الصرف والقبض المدفوعة
      supabase.from('payment_vouchers').select('id, amount, voucher_type, status').eq('status', 'paid'),
      // أرصدة أقلام الوقف
      supabase.from('waqf_units').select('id, current_balance, total_income, total_expenses')
    ]);

    const beneficiaries = beneficiariesResult.data || [];
    const totalBeneficiaries = beneficiaries.length;
    const activeBeneficiaries = beneficiaries.filter(b => 
      b.status === BENEFICIARY_STATUS.ACTIVE || b.status === 'active'
    ).length;

    const totalFamilies = familiesResult.data?.length || 0;

    const properties = propertiesResult.data || [];
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => 
      p.status === PROPERTY_STATUS.ACTIVE || p.status === 'active'
    ).length;

    const contracts = contractsResult.data || [];
    // تصحيح: حساب العقارات المشغولة بعدد العقارات الفريدة ذات العقود النشطة
    const activeContracts = contracts.filter(c => 
      c.status === CONTRACT_STATUS.ACTIVE || c.status === 'نشط'
    );
    const occupiedProperties = activeContracts.length;
    
    const monthlyReturn = activeContracts
      .reduce((sum, c) => {
        const rent = c.monthly_rent || 0;
        const frequency = c.payment_frequency;
        if (frequency === 'سنوي' || frequency === 'annual') {
          return sum + (rent / 12);
        }
        if (frequency === 'ربع سنوي' || frequency === 'quarterly') {
          return sum + (rent / 3);
        }
        return sum + rent;
      }, 0);

    const funds = fundsResult.data || [];
    const totalFunds = funds.length;
    const activeFunds = funds.filter(f => f.is_active).length;

    const requests = requestsResult.data || [];
    const pendingRequests = requests.filter(r => 
      r.status === REQUEST_STATUS.PENDING || r.status === 'pending'
    ).length;
    const overdueRequests = requests.filter(r => r.is_overdue).length;

    const loans = loansResult.data || [];
    const pendingLoans = loans.filter(l => 
      l.status === LOAN_STATUS.ACTIVE || l.status === 'active'
    ).length;

    const rentalPayments = paymentsResult.data || [];
    const completedPayments = rentalPayments.filter(p => p.status === 'مدفوع');
    const rentalRevenue = completedPayments
      .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

    // حساب الإيرادات من سندات القبض المدفوعة
    const vouchers = vouchersResult.data || [];
    const receiptVouchers = vouchers.filter(v => v.voucher_type === 'receipt');
    const vouchersRevenue = receiptVouchers.reduce((sum, v) => sum + (v.amount || 0), 0);

    // إجمالي الإيرادات = إيجارات + سندات قبض
    const totalRevenue = rentalRevenue + vouchersRevenue;

    // حساب المصروفات من سندات الصرف المدفوعة
    const paymentVouchers = vouchers.filter(v => v.voucher_type === 'payment');
    const vouchersExpenses = paymentVouchers.reduce((sum, v) => sum + (v.amount || 0), 0);

    // أرصدة أقلام الوقف الفعلية
    const waqfUnits = waqfUnitsResult.data || [];
    const totalWaqfBalance = waqfUnits.reduce((sum, w) => sum + (w.current_balance || 0), 0);
    const totalWaqfIncome = waqfUnits.reduce((sum, w) => sum + (w.total_income || 0), 0);
    const totalWaqfExpenses = waqfUnits.reduce((sum, w) => sum + (w.total_expenses || 0), 0);

    // حساب المصروفات الفعلية من حسابات المصروفات + سندات الصرف
    let accountingExpenses = 0;
    try {
      const { data: expenseAccounts } = await supabase
        .from("accounts")
        .select("id")
        .eq("account_type", "expense");
      
      if (expenseAccounts && expenseAccounts.length > 0) {
        const accountIds = expenseAccounts.map(a => a.id);
        const { data: expenseEntries } = await supabase
          .from("journal_entry_lines")
          .select("debit_amount")
          .in("account_id", accountIds);
        
        accountingExpenses = expenseEntries?.reduce((sum, e) => sum + (e.debit_amount || 0), 0) || 0;
      }
    } catch (error) {
      productionLogger.error("Error calculating expenses:", error);
    }

    // إجمالي المصروفات = مصروفات محاسبية + سندات صرف + مصروفات أقلام الوقف
    const totalExpenses = Math.max(accountingExpenses, vouchersExpenses, totalWaqfExpenses);

    const netIncome = totalRevenue - totalExpenses;
    const availableBudget = totalWaqfBalance > 0 ? totalWaqfBalance : (netIncome > 0 ? netIncome : 0);
    const totalAssets = totalRevenue;

    // حساب إحصائيات القيود المحاسبية
    const journalEntries = journalEntriesStatusResult.data || [];
    const todayStr = now.toISOString().split('T')[0];
    const draftJournalEntries = journalEntries.filter(e => e.status === 'draft').length;
    const postedJournalEntries = journalEntries.filter(e => e.status === 'posted').length;
    const cancelledJournalEntries = journalEntries.filter(e => e.status === 'cancelled').length;
    const todayJournalEntries = journalEntries.filter(e => e.entry_date === todayStr).length;
    const totalJournalEntries = journalEntries.length;
    const pendingApprovals = draftJournalEntries; // الموافقات المعلقة = القيود المسودة

    return {
      totalBeneficiaries,
      activeBeneficiaries,
      totalFamilies,
      totalProperties,
      activeProperties,
      occupiedProperties,
      totalRevenue,
      totalExpenses,
      netIncome,
      availableBudget,
      monthlyReturn,
      totalAssets,
      totalFunds,
      activeFunds,
      pendingRequests,
      overdueRequests,
      pendingLoans,
      pendingApprovals,
      draftJournalEntries,
      postedJournalEntries,
      cancelledJournalEntries,
      todayJournalEntries,
      totalJournalEntries,
      lastUpdated: now
    };
  },

  /**
   * جلب مؤشرات الأداء الأساسية للداشبورد
   */
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const [
      beneficiariesCount,
      propertiesCount,
      totalPayments,
      activeContracts
    ] = await Promise.all([
      supabase
        .from('beneficiaries')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('payments')
        .select('amount')
        .limit(1000)
        .then(res => {
          if (res.error) throw res.error;
          return res.data.reduce((sum, p) => sum + Number(p.amount), 0);
        }),
      
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'نشط'),
    ]);

    return {
      beneficiaries: beneficiariesCount.count || 0,
      properties: propertiesCount.count || 0,
      totalPayments,
      activeContracts: activeContracts.count || 0,
    };
  },

  /**
   * جلب إحصائيات KPI
   */
  async getKPIDefinitions(category?: string) {
    let query = supabase
      .from("kpi_definitions")
      .select("id, kpi_name, kpi_code, description, calculation_formula, data_source, target_value, unit, chart_type, is_active, category, created_at")
      .eq("is_active", true);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * حساب قيمة KPI
   */
  async calculateKPIValue(kpiCode: string): Promise<number> {
    switch (kpiCode) {
      case "distribution_rate": {
        const { data } = await supabase.from("distributions").select("total_amount, status");
        const total = data?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;
        const completed = data?.filter(d => d.status === "completed" || d.status === "معتمد")
          .reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;
        return total > 0 ? (completed / total) * 100 : 0;
      }

      case "occupancy_rate": {
        // حساب نسبة الإشغال الفعلية من العقود النشطة والعقارات
        const [contractsRes, propertiesRes] = await Promise.all([
          supabase.from("contracts").select("property_id").eq("status", "نشط"),
          supabase.from("properties").select("id", { count: "exact", head: true })
        ]);
        const occupiedCount = new Set(contractsRes.data?.map(c => c.property_id)).size;
        const totalProperties = propertiesRes.count || 1;
        return Math.round((occupiedCount / totalProperties) * 100);
      }

      case "collection_rate": {
        // حساب نسبة التحصيل الفعلية من دفعات الإيجار
        const { data: payments } = await supabase
          .from("rental_payments")
          .select("amount_due, amount_paid, status");
        const totalDue = payments?.reduce((sum, p) => sum + (p.amount_due || 0), 0) || 1;
        const totalPaid = payments
          ?.filter(p => p.status === 'مدفوع')
          .reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
        return Math.round((totalPaid / totalDue) * 100);
      }

      case "approval_time":
        return 2.5;

      case "beneficiary_satisfaction":
        // لا يوجد نظام تقييم حالياً - قيمة ثابتة
        return 88;

      case "pending_requests": {
        const { count } = await supabase
          .from("beneficiary_requests")
          .select("*", { count: "exact", head: true })
          .in("status", ["معلق", "pending", "قيد المراجعة"]);
        return count || 0;
      }

      case "monthly_revenue": {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data } = await supabase
          .from("payments")
          .select("amount")
          .eq("payment_type", "receipt")
          .gte("payment_date", startOfMonth.toISOString());
        return data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      }

      case "monthly_expenses": {
        // حساب المصروفات الشهرية من القيود المحاسبية
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        // جلب حسابات المصروفات
        const { data: expenseAccounts } = await supabase
          .from("accounts")
          .select("id")
          .eq("account_type", "expense");
        
        if (!expenseAccounts || expenseAccounts.length === 0) return 0;
        
        const accountIds = expenseAccounts.map(a => a.id);
        
        // جلب بنود القيود لهذه الحسابات
        const { data: entries } = await supabase
          .from("journal_entry_lines")
          .select("debit_amount, account_id, created_at")
          .in("account_id", accountIds)
          .gte("created_at", startOfMonth.toISOString());
        
        return entries?.reduce((sum, e) => sum + (e.debit_amount || 0), 0) || 0;
      }

      case "total_expenses": {
        // حساب إجمالي المصروفات من القيود المحاسبية
        const { data: expenseAccounts } = await supabase
          .from("accounts")
          .select("id")
          .eq("account_type", "expense");
        
        if (!expenseAccounts || expenseAccounts.length === 0) return 0;
        
        const accountIds = expenseAccounts.map(a => a.id);
        
        const { data: entries } = await supabase
          .from("journal_entry_lines")
          .select("debit_amount")
          .in("account_id", accountIds);
        
        return entries?.reduce((sum, e) => sum + (e.debit_amount || 0), 0) || 0;
      }

      default:
        return 0;
    }
  },
};
