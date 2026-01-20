/**
 * Unified Financial Service - خدمة البيانات المالية الموحدة
 * 
 * توفر واجهة موحدة للحصول على البيانات المالية من مصادر مختلفة
 * مع توثيق واضح لمصدر كل نوع من البيانات
 * 
 * @version 1.0.0
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from '@/lib/logger/production-logger';
import { matchesStatus } from '@/lib/constants';

// ==================== Types ====================

export interface UnifiedRevenueData {
  /**
   * إجمالي المحصّل فعلياً
   * المصدر: rental_payments (status = مدفوع) + payment_vouchers (type = receipt, status = paid)
   */
  totalCollected: number;
  
  /**
   * الإيراد السنوي المتوقع من العقود النشطة
   * المصدر: contracts (status = نشط).monthly_rent × 12
   */
  expectedAnnualRevenue: number;
  
  /**
   * الإيراد الشهري من العقود النشطة
   * المصدر: contracts (status = نشط).monthly_rent
   */
  monthlyContractRevenue: number;
  
  /**
   * إيرادات الفترة المحاسبية
   * المصدر: accounts (type = revenue).current_balance
   */
  accountingPeriodRevenue: number;
  
  /**
   * المستحق للفترة (غير المحصّل)
   * المصدر: rental_payments (status = معلق أو متأخر)
   */
  pendingAmount: number;
  
  /**
   * نسبة التحصيل
   * الحساب: (totalCollected / totalExpected) × 100
   */
  collectionRate: number;
}

export interface UnifiedDistributionData {
  /**
   * إجمالي التوزيعات
   * المصدر: distributions.total_amount
   */
  totalDistributions: number;
  
  /**
   * توزيعات المستفيدين
   * المصدر: heir_distributions.amount
   */
  beneficiaryDistributions: number;
  
  /**
   * التوزيعات المعتمدة
   * المصدر: distributions (status = معتمد).total_amount
   */
  approvedDistributions: number;
}

export interface UnifiedIncomeData {
  /**
   * صافي الدخل
   * الحساب: totalRevenue - totalExpenses
   */
  netIncome: number;
  
  /**
   * إجمالي المصروفات
   * المصدر: accounts (type = expense).current_balance + payment_vouchers (type = payment)
   */
  totalExpenses: number;
  
  /**
   * إيرادات السنة المالية
   * المصدر: annual_disclosures.total_revenues أو fiscal_year_closings
   */
  fiscalYearRevenue: number;
}

// ==================== Service ====================

export class UnifiedFinancialService {
  /**
   * جلب بيانات الإيرادات الموحدة من View قاعدة البيانات
   */
  static async getRevenueData(): Promise<UnifiedRevenueData> {
    try {
      // استخدام View الموحد من قاعدة البيانات
      const { data: summaryData, error: summaryError } = await supabase
        .from('financial_summary')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (summaryError) {
        // fallback إلى الطريقة التقليدية
        return this.getRevenueDataFallback();
      }

      if (summaryData) {
        return {
          totalCollected: Number(summaryData.total_collected) || 0,
          expectedAnnualRevenue: Number(summaryData.total_expected_revenue) || 0,
          monthlyContractRevenue: Number(summaryData.total_expected_revenue) / 12 || 0,
          accountingPeriodRevenue: Number(summaryData.total_rental_collected) || 0,
          pendingAmount: Number(summaryData.pending_amount) || 0,
          collectionRate: Number(summaryData.collection_percentage) || 0
        };
      }

      return this.getRevenueDataFallback();
    } catch (error) {
      productionLogger.error('Error fetching unified revenue data from view', error);
      return this.getRevenueDataFallback();
    }
  }

  /**
   * طريقة احتياطية لجلب البيانات
   */
  private static async getRevenueDataFallback(): Promise<UnifiedRevenueData> {
    try {
      const [
        rentalPaymentsRes,
        receiptVouchersRes,
        activeContractsRes,
        revenueAccountsRes,
        pendingPaymentsRes
      ] = await Promise.all([
        supabase
          .from('rental_payments')
          .select('amount_paid')
          .eq('status', 'paid'),
        
        supabase
          .from('payment_vouchers')
          .select('amount')
          .eq('voucher_type', 'receipt')
          .eq('status', 'paid'),
        
        supabase
          .from('contracts')
          .select('monthly_rent')
          .eq('status', 'active'),
        
        supabase
          .from('accounts')
          .select('current_balance')
          .eq('account_type', 'revenue')
          .eq('is_active', true),
        
        supabase
          .from('rental_payments')
          .select('amount_due')
          .in('status', ['pending', 'overdue'])
      ]);

      const rentalCollected = rentalPaymentsRes.data?.reduce(
        (sum, p) => sum + (p.amount_paid || 0), 0
      ) || 0;
      
      const vouchersCollected = receiptVouchersRes.data?.reduce(
        (sum, v) => sum + (v.amount || 0), 0
      ) || 0;
      
      const totalCollected = rentalCollected + vouchersCollected;

      const monthlyContractRevenue = activeContractsRes.data?.reduce(
        (sum, c) => sum + (c.monthly_rent || 0), 0
      ) || 0;
      
      const expectedAnnualRevenue = monthlyContractRevenue * 12;

      const accountingPeriodRevenue = revenueAccountsRes.data?.reduce(
        (sum, a) => sum + (a.current_balance || 0), 0
      ) || 0;

      const pendingAmount = pendingPaymentsRes.data?.reduce(
        (sum, p) => sum + (p.amount_due || 0), 0
      ) || 0;

      const totalExpected = totalCollected + pendingAmount;
      const collectionRate = totalExpected > 0 
        ? Math.round((totalCollected / totalExpected) * 100) 
        : 0;

      return {
        totalCollected,
        expectedAnnualRevenue,
        monthlyContractRevenue,
        accountingPeriodRevenue,
        pendingAmount,
        collectionRate
      };
    } catch (error) {
      productionLogger.error('Error in revenue fallback', error);
      return {
        totalCollected: 0,
        expectedAnnualRevenue: 0,
        monthlyContractRevenue: 0,
        accountingPeriodRevenue: 0,
        pendingAmount: 0,
        collectionRate: 0
      };
    }
  }

  /**
   * جلب بيانات الإيرادات الموحدة من View
   */
  static async getUnifiedRevenueBreakdown() {
    try {
      const { data, error } = await supabase
        .from('unified_revenue')
        .select('*')
        .eq('revenue_type', 'collected')
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching unified revenue breakdown', error);
      return [];
    }
  }

  /**
   * جلب بيانات التوزيعات الموحدة
   */
  static async getDistributionData(): Promise<UnifiedDistributionData> {
    try {
      const [distributionsRes, heirDistributionsRes] = await Promise.all([
        supabase
          .from('distributions')
          .select('total_amount, status'),
        
        supabase
          .from('heir_distributions')
          .select('share_amount')
      ]);

      const allDistributions = distributionsRes.data || [];
      const totalDistributions = allDistributions.reduce(
        (sum, d) => sum + (d.total_amount || 0), 0
      );

      const approvedDistributions = allDistributions
        .filter(d => matchesStatus(d.status, 'approved', 'completed'))
        .reduce((sum, d) => sum + (d.total_amount || 0), 0);

      const beneficiaryDistributions = heirDistributionsRes.data?.reduce(
        (sum, h) => sum + (h.share_amount || 0), 0
      ) || 0;

      return {
        totalDistributions,
        beneficiaryDistributions,
        approvedDistributions
      };
    } catch (error) {
      productionLogger.error('Error fetching distribution data', error);
      return {
        totalDistributions: 0,
        beneficiaryDistributions: 0,
        approvedDistributions: 0
      };
    }
  }

  /**
   * جلب بيانات الدخل الموحدة
   */
  static async getIncomeData(): Promise<UnifiedIncomeData> {
    try {
      const [
        revenueAccountsRes,
        expenseAccountsRes,
        paymentVouchersRes,
        disclosuresRes
      ] = await Promise.all([
        supabase
          .from('accounts')
          .select('current_balance')
          .eq('account_type', 'revenue')
          .eq('is_active', true),
        
        supabase
          .from('accounts')
          .select('current_balance')
          .eq('account_type', 'expense')
          .eq('is_active', true),
        
        supabase
          .from('payment_vouchers')
          .select('amount')
          .eq('voucher_type', 'payment')
          .eq('status', 'paid'),
        
        supabase
          .from('annual_disclosures')
          .select('total_revenues')
          .order('year', { ascending: false })
          .limit(1)
      ]);

      const totalRevenue = revenueAccountsRes.data?.reduce(
        (sum, a) => sum + (a.current_balance || 0), 0
      ) || 0;

      const accountExpenses = expenseAccountsRes.data?.reduce(
        (sum, a) => sum + (a.current_balance || 0), 0
      ) || 0;

      const voucherExpenses = paymentVouchersRes.data?.reduce(
        (sum, v) => sum + (v.amount || 0), 0
      ) || 0;

      const totalExpenses = Math.max(accountExpenses, voucherExpenses);
      const netIncome = totalRevenue - totalExpenses;

      const fiscalYearRevenue = disclosuresRes.data?.[0]?.total_revenues || 0;

      return {
        netIncome,
        totalExpenses,
        fiscalYearRevenue
      };
    } catch (error) {
      productionLogger.error('Error fetching income data', error);
      return {
        netIncome: 0,
        totalExpenses: 0,
        fiscalYearRevenue: 0
      };
    }
  }

  /**
   * جلب ملخص التحصيل حسب العقار
   */
  static async getPropertyCollectionSummary(propertyId?: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_property_collection_summary', { 
          p_property_id: propertyId || null 
        });

      if (error) throw error;

      return data?.[0] || {
        total_collected: 0,
        total_expected: 0,
        collection_percentage: 0,
        transaction_count: 0
      };
    } catch (error) {
      productionLogger.error('Error fetching property collection summary', error);
      return {
        total_collected: 0,
        total_expected: 0,
        collection_percentage: 0,
        transaction_count: 0
      };
    }
  }

  /**
   * جلب إجمالي المحصّل لفترة معينة
   */
  static async getTotalCollected(startDate?: string, endDate?: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_total_collected', {
          p_start_date: startDate || null,
          p_end_date: endDate || null
        });

      if (error) throw error;

      return Number(data) || 0;
    } catch (error) {
      productionLogger.error('Error fetching total collected', error);
      return 0;
    }
  }

  /**
   * جلب نسبة التحصيل الإجمالية
   */
  static async getCollectionPercentage(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_collection_percentage');

      if (error) throw error;

      return Number(data) || 0;
    } catch (error) {
      productionLogger.error('Error fetching collection percentage', error);
      return 0;
    }
  }
}

export default UnifiedFinancialService;
