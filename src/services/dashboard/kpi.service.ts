/**
 * KPI Service - خدمة مؤشرات الأداء
 */

import { supabase } from "@/integrations/supabase/client";
import { BENEFICIARY_STATUS, PROPERTY_STATUS, CONTRACT_STATUS, LOAN_STATUS, REQUEST_STATUS } from "@/lib/constants";

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
      paymentsRes,
      requestsRes,
      documentsRes,
    ] = await Promise.all([
      supabase.from("beneficiaries").select("id, status", { count: "exact" }),
      supabase.from("properties").select("id, status", { count: "exact" }),
      supabase.from("contracts").select("id, status", { count: "exact" }),
      supabase.from("loans").select("id, status, loan_amount, paid_amount", { count: "exact" }),
      supabase.from("rental_payments").select("id, amount_paid, status").eq("status", "مدفوع"),
      supabase.from("beneficiary_requests").select("id, status", { count: "exact" }),
      supabase.from("documents").select("id", { count: "exact" }),
    ]);

    const beneficiaries = beneficiariesRes.data || [];
    const properties = propertiesRes.data || [];
    const contracts = contractsRes.data || [];
    const loans = loansRes.data || [];
    const payments = paymentsRes.data || [];
    const requests = requestsRes.data || [];

    const activeBeneficiaries = beneficiaries.filter(b => b.status === BENEFICIARY_STATUS.ACTIVE).length;
    const occupiedProperties = properties.filter(p => p.status === PROPERTY_STATUS.ACTIVE).length;
    const activeContracts = contracts.filter(c => 
      c.status === CONTRACT_STATUS.ACTIVE || c.status === 'active'
    ).length;
    const activeLoans = loans.filter(l => 
      l.status === LOAN_STATUS.ACTIVE || l.status === 'active'
    ).length;
    const totalLoansAmount = loans.reduce((sum, l) => sum + ((l.loan_amount || 0) - (l.paid_amount || 0)), 0);
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
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
      payments: { total: payments.length, amount: totalPayments },
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
      journalEntriesResult
    ] = await Promise.all([
      supabase.from('beneficiaries').select('id, status'),
      supabase.from('families').select('id'),
      supabase.from('properties').select('id, status'),
      supabase.from('contracts').select('id, status, monthly_rent, payment_frequency'),
      supabase.from('funds').select('id, is_active'),
      supabase.from('beneficiary_requests').select('id, status, is_overdue'),
      supabase.from('loans').select('id, status'),
      supabase.from('payments').select('id, amount, payment_type, status'),
      supabase.from('journal_entry_lines').select('id, debit_amount, credit_amount')
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
    const occupiedProperties = contracts.filter(c => 
      c.status === CONTRACT_STATUS.ACTIVE || c.status === 'active'
    ).length;
    
    const monthlyReturn = contracts
      .filter(c => c.status === CONTRACT_STATUS.ACTIVE || c.status === 'active')
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

    const payments = paymentsResult.data || [];
    const completedPayments = payments.filter(p => p.status === 'مدفوع' || p.status === 'completed');
    const totalRevenue = completedPayments
      .filter(p => p.payment_type === 'payment' || p.payment_type === 'إيجار')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const journalLines = journalEntriesResult.data || [];
    const totalExpenses = journalLines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

    const netIncome = totalRevenue - totalExpenses;
    const availableBudget = netIncome > 0 ? netIncome : 0;
    const totalAssets = totalRevenue;

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

      case "occupancy_rate":
        return 85;

      case "collection_rate":
        return 92;

      case "approval_time":
        return 2.5;

      case "beneficiary_satisfaction":
        return 88;

      case "pending_requests": {
        const { count } = await supabase
          .from("beneficiary_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
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
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data } = await supabase
          .from("payments")
          .select("amount")
          .eq("payment_type", "voucher")
          .gte("payment_date", startOfMonth.toISOString());
        return data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      }

      default:
        return 0;
    }
  },
};
