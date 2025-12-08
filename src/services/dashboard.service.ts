/**
 * Dashboard Service - خدمة لوحة التحكم
 * 
 * تحتوي على منطق الأعمال لجلب بيانات الداشبورد
 * 
 * @version 2.6.36
 */

import { supabase } from "@/integrations/supabase/client";
import { BENEFICIARY_STATUS, PROPERTY_STATUS, CONTRACT_STATUS, LOAN_STATUS, REQUEST_STATUS } from "@/lib/constants";

// ==================== Types ====================

export interface SystemOverviewStats {
  beneficiaries: {
    total: number;
    active: number;
    percentage: number;
  };
  properties: {
    total: number;
    occupied: number;
    percentage: number;
  };
  contracts: {
    total: number;
    active: number;
  };
  loans: {
    total: number;
    active: number;
    amount: number;
  };
  payments: {
    total: number;
    amount: number;
  };
  requests: {
    total: number;
    pending: number;
  };
  documents: number;
}

export interface UnifiedKPIsData {
  // المستفيدون
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  
  // العائلات
  totalFamilies: number;
  
  // العقارات
  totalProperties: number;
  activeProperties: number;
  occupiedProperties: number;
  
  // المالية
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  availableBudget: number;
  monthlyReturn: number;
  totalAssets: number;
  
  // الأقلام
  totalFunds: number;
  activeFunds: number;
  
  // الطلبات
  pendingRequests: number;
  overdueRequests: number;
  
  // القروض
  pendingLoans: number;
  
  // التحديث
  lastUpdated: Date;
}

// ==================== Service ====================

export const DashboardService = {
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
      contracts: {
        total: contracts.length,
        active: activeContracts,
      },
      loans: {
        total: loans.length,
        active: activeLoans,
        amount: totalLoansAmount,
      },
      payments: {
        total: payments.length,
        amount: totalPayments,
      },
      requests: {
        total: requests.length,
        pending: pendingRequests,
      },
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

    // حساب المؤشرات باستخدام الثوابت
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
    // حساب العائد الشهري الفعلي - مع مراعاة تكرار الدفع
    // العقود السنوية: الإيجار ÷ 12، العقود الشهرية: الإيجار كما هو
    const monthlyReturn = contracts
      .filter(c => c.status === CONTRACT_STATUS.ACTIVE || c.status === 'active')
      .reduce((sum, c) => {
        const rent = c.monthly_rent || 0;
        const frequency = c.payment_frequency;
        // إذا كان الدفع سنوي، نقسم على 12 للحصول على المعدل الشهري
        if (frequency === 'سنوي' || frequency === 'annual') {
          return sum + (rent / 12);
        }
        // إذا كان الدفع ربع سنوي، نقسم على 3
        if (frequency === 'ربع سنوي' || frequency === 'quarterly') {
          return sum + (rent / 3);
        }
        // الدفع الشهري كما هو
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

      case "active_beneficiaries": {
        const { count } = await supabase
          .from("beneficiaries")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        return count || 0;
      }

      case "expiring_contracts": {
        const today = new Date();
        const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const { count } = await supabase
          .from("contracts")
          .select("*", { count: "exact", head: true })
          .gte("end_date", today.toISOString())
          .lte("end_date", thirtyDays.toISOString());
        return count || 0;
      }

      case "total_distributions": {
        const { count } = await supabase
          .from("distributions")
          .select("*", { count: "exact", head: true })
          .eq("status", "معتمد");
        return count || 0;
      }

      case "total_beneficiaries": {
        const { count } = await supabase
          .from("beneficiaries")
          .select("*", { count: "exact", head: true })
          .eq("status", "نشط");
        return count || 0;
      }

      case "approval_rate": {
        const { data: distributions } = await supabase
          .from("distributions")
          .select("status")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const total = distributions?.length || 0;
        const approved = distributions?.filter((d) => d.status === "معتمد").length || 0;

        return total > 0 ? Math.round((approved / total) * 100) : 0;
      }

      default:
        return 0;
    }
  },

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
        accounts!inner(name_ar)
      `)
      .eq('accounts.account_type', 'revenue')
      .limit(50);

    const revenueByType: { [key: string]: number } = {};

    if (revenueData) {
      revenueData.forEach(line => {
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
   * جلب ملخص الوقف
   */
  async getWaqfSummary() {
    const { data: publicStats, error: publicError } = await supabase
      .rpc('get_waqf_public_stats');

    if (publicError) {
      console.error('Error fetching public stats:', publicError);
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
  }
};
