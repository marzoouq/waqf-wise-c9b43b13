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
   * جلب بيانات الإيرادات الموحدة
   */
  static async getRevenueData(): Promise<UnifiedRevenueData> {
    try {
      const [
        rentalPaymentsRes,
        receiptVouchersRes,
        activeContractsRes,
        revenueAccountsRes,
        pendingPaymentsRes
      ] = await Promise.all([
        // دفعات الإيجار المدفوعة
        supabase
          .from('rental_payments')
          .select('amount_paid')
          .eq('status', 'مدفوع'),
        
        // سندات القبض المدفوعة
        supabase
          .from('payment_vouchers')
          .select('amount')
          .eq('voucher_type', 'receipt')
          .eq('status', 'paid'),
        
        // العقود النشطة
        supabase
          .from('contracts')
          .select('monthly_rent')
          .eq('status', 'نشط'),
        
        // حسابات الإيرادات
        supabase
          .from('accounts')
          .select('current_balance')
          .eq('account_type', 'revenue')
          .eq('is_active', true),
        
        // الدفعات المعلقة والمتأخرة
        supabase
          .from('rental_payments')
          .select('amount_due')
          .in('status', ['معلق', 'متأخر'])
      ]);

      // حساب إجمالي المحصّل
      const rentalCollected = rentalPaymentsRes.data?.reduce(
        (sum, p) => sum + (p.amount_paid || 0), 0
      ) || 0;
      
      const vouchersCollected = receiptVouchersRes.data?.reduce(
        (sum, v) => sum + (v.amount || 0), 0
      ) || 0;
      
      const totalCollected = rentalCollected + vouchersCollected;

      // حساب الإيراد المتوقع من العقود
      const monthlyContractRevenue = activeContractsRes.data?.reduce(
        (sum, c) => sum + (c.monthly_rent || 0), 0
      ) || 0;
      
      const expectedAnnualRevenue = monthlyContractRevenue * 12;

      // إيرادات الفترة المحاسبية
      const accountingPeriodRevenue = revenueAccountsRes.data?.reduce(
        (sum, a) => sum + (a.current_balance || 0), 0
      ) || 0;

      // المستحق غير المحصّل
      const pendingAmount = pendingPaymentsRes.data?.reduce(
        (sum, p) => sum + (p.amount_due || 0), 0
      ) || 0;

      // نسبة التحصيل
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
      productionLogger.error('Error fetching unified revenue data', error);
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
        .filter(d => d.status === 'معتمد' || d.status === 'completed')
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
        // حسابات الإيرادات
        supabase
          .from('accounts')
          .select('current_balance')
          .eq('account_type', 'revenue')
          .eq('is_active', true),
        
        // حسابات المصروفات
        supabase
          .from('accounts')
          .select('current_balance')
          .eq('account_type', 'expense')
          .eq('is_active', true),
        
        // سندات الصرف
        supabase
          .from('payment_vouchers')
          .select('amount')
          .eq('voucher_type', 'payment')
          .eq('status', 'paid'),
        
        // آخر إفصاح سنوي
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
}

export default UnifiedFinancialService;
