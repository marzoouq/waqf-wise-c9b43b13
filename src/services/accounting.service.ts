/**
 * Accounting Service - خدمة المحاسبة (Facade)
 * 
 * هذا الملف يعيد تصدير جميع خدمات المحاسبة للحفاظ على التوافق مع الكود الحالي.
 * الخدمات الفعلية موجودة في مجلد src/services/accounting/
 */

// إعادة تصدير من الخدمات المنفصلة
export {
  AccountService,
  JournalEntryService,
  TrialBalanceService,
  BudgetService,
  BankReconciliationService,
  AutoJournalService,
  type FinancialSummary,
  type TrialBalanceAccount,
  type BalanceSheetData,
  type IncomeStatementData,
  type FinancialKPIInsert,
  type FinancialForecastInsert,
  type AccountMapping,
  type AutoJournalTemplate,
  type AutoJournalTemplateInsert,
} from './accounting/index';

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

// استيراد الخدمات للاستخدام في AccountingService
import { AccountService } from './accounting/account.service';
import { JournalEntryService } from './accounting/journal-entry.service';
import { TrialBalanceService, type FinancialSummary } from './accounting/trial-balance.service';
import { BudgetService, type FinancialKPIInsert, type FinancialForecastInsert } from './accounting/budget.service';
import { BankReconciliationService } from './accounting/bank-reconciliation.service';
import { AutoJournalService as AutoJournalServiceImport } from './accounting/auto-journal.service';

type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type JournalEntryLineRow = Database['public']['Tables']['journal_entry_lines']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];

/**
 * AccountingService - Facade للتوافق العكسي
 * يستخدم الخدمات المنفصلة داخلياً
 */
export class AccountingService {
  // ==================== Account Operations ====================
  static getAccounts = AccountService.getAccounts;
  static getAccountByCode = AccountService.getAccountByCode;
  static createAccount = AccountService.createAccount;
  static updateAccount = AccountService.updateAccount;
  static deleteAccount = AccountService.deleteAccount;
  static getActiveLeafAccounts = AccountService.getActiveLeafAccounts;
  static getChartOfAccounts = AccountService.getChartOfAccounts;
  static getAccountById = AccountService.getAccountById;
  static getAccountWithBalance = AccountService.getAccountWithBalance;
  static getAccountDistribution = AccountService.getAccountDistribution;
  static getAccountsForLedger = AccountService.getAccountsForLedger;

  // ==================== Journal Entry Operations ====================
  static generateNextEntryNumber = JournalEntryService.generateNextEntryNumber;
  static getJournalEntriesWithLines = JournalEntryService.getJournalEntriesWithLines;
  static getJournalEntries = JournalEntryService.getJournalEntries;
  static getJournalEntryById = JournalEntryService.getJournalEntryById;
  static createJournalEntry = JournalEntryService.createJournalEntry;
  static postJournalEntry = JournalEntryService.postJournalEntry;
  static cancelJournalEntry = JournalEntryService.cancelJournalEntry;
  static approveJournalEntry = JournalEntryService.approveJournalEntry;
  static getJournalEntryLines = JournalEntryService.getJournalEntryLines;
  static getRecentJournalEntries = JournalEntryService.getRecentJournalEntries;
  static getJournalEntryLinesWithAccount = JournalEntryService.getJournalEntryLinesWithAccount;
  static postJournalEntryById = JournalEntryService.postJournalEntryById;
  static updateJournalEntryStatus = JournalEntryService.updateJournalEntryStatus;
  static getJournalEntryLinesByAccount = JournalEntryService.getJournalEntryLinesByAccount;

  // ==================== Trial Balance & Financial Statements ====================
  static getFinancialSummary = TrialBalanceService.getFinancialSummary;
  static getTrialBalance = TrialBalanceService.getTrialBalance;
  static getGeneralLedger = TrialBalanceService.getGeneralLedger;
  static getGeneralLedgerForHook = TrialBalanceService.getGeneralLedgerForHook;
  static getFinancialData = TrialBalanceService.getFinancialData;

  // ==================== Budget Operations ====================
  static getBudgets = BudgetService.getBudgets;
  static getBudgetsWithAccounts = BudgetService.getBudgetsWithAccounts;
  static createBudget = BudgetService.createBudget;
  static updateBudget = BudgetService.updateBudget;
  static deleteBudget = BudgetService.deleteBudget;
  static calculateBudgetVariances = BudgetService.calculateBudgetVariances;
  static getBudgetsByPeriod = BudgetService.getBudgetsByPeriod;
  static getBudgetsByFiscalYear = BudgetService.getBudgetsByFiscalYear;
  static getFinancialKPIs = BudgetService.getFinancialKPIs;
  static getFinancialForecasts = BudgetService.getFinancialForecasts;
  static saveFinancialKPIs = BudgetService.saveFinancialKPIs;
  static saveFinancialForecasts = BudgetService.saveFinancialForecasts;

  // ==================== Bank Reconciliation Operations ====================
  static getBankAccounts = BankReconciliationService.getBankAccounts;
  static getBankStatement = BankReconciliationService.getBankStatement;
  static getBankMatchingRules = BankReconciliationService.getBankMatchingRules;
  static getBankReconciliationMatches = BankReconciliationService.getBankReconciliationMatches;
  static getUnmatchedBankTransactions = BankReconciliationService.getUnmatchedBankTransactions;
  static getPostedEntriesForMatching = BankReconciliationService.getPostedEntriesForMatching;
  static createBankMatch = BankReconciliationService.createBankMatch;
  static deleteBankMatch = BankReconciliationService.deleteBankMatch;

  // ==================== Auto Journal Operations ====================
  static getAutoJournalTemplates = AutoJournalServiceImport.getActiveTemplates;
  static createAutoJournalEntry = AutoJournalServiceImport.createAutoJournalEntry;

  // ==================== Fiscal Year Operations ====================
  
  /**
   * جلب السنوات المالية النشطة
   */
  static async getActiveFiscalYears() {
    try {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching active fiscal years', error);
      throw error;
    }
  }

  /**
   * جلب إقفالات السنوات المالية
   */
  static async getFiscalYearClosings() {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .select(`
        *,
        fiscal_years (
          id,
          name,
          start_date,
          end_date,
          is_active,
          is_closed
        )
      `)
      .order("closing_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب إقفال سنة مالية محددة
   */
  static async getClosingByFiscalYear(fiscalYearId: string) {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .select("*")
      .eq("fiscal_year_id", fiscalYearId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * إنشاء إقفال سنة مالية
   */
  static async createFiscalYearClosing(closing: Database['public']['Tables']['fiscal_year_closings']['Insert']) {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .insert(closing)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء إقفال السنة المالية');
    return data;
  }

  /**
   * تحديث إقفال سنة مالية
   */
  static async updateFiscalYearClosing(id: string, updates: Database['public']['Tables']['fiscal_year_closings']['Update']) {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * حساب ملخص السنة المالية
   */
  static async calculateFiscalYearSummary(fiscalYearId: string) {
    const { data, error } = await supabase
      .rpc("calculate_fiscal_year_summary", {
        p_fiscal_year_id: fiscalYearId,
      });

    if (error) throw error;
    return data;
  }

  // ==================== Cash Flow Operations ====================

  /**
   * جلب بيانات التدفق النقدي
   */
  static async getCashFlowData(fiscalYearId: string): Promise<Database['public']['Tables']['cash_flows']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('cash_flows')
        .select('*')
        .eq('fiscal_year_id', fiscalYearId)
        .order('period_start');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching cash flow data', error);
      throw error;
    }
  }

  /**
   * جلب التدفقات النقدية
   */
  static async getCashFlows(fiscalYearId?: string) {
    try {
      const { data, error } = await supabase
        .from('cash_flows')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching cash flows', error);
      throw error;
    }
  }

  /**
   * حساب وحفظ التدفقات النقدية
   */
  static async calculateCashFlow(params: {
    fiscalYearId: string;
    periodStart: string;
    periodEnd: string;
  }) {
    try {
      const { data: bankAccount } = await supabase
        .from('accounts')
        .select('current_balance')
        .eq('code', '1.1.1')
        .maybeSingle();

      const openingCash = bankAccount?.current_balance || 0;

      const { data, error } = await supabase
        .from("cash_flows")
        .insert([{
          fiscal_year_id: params.fiscalYearId,
          period_start: params.periodStart,
          period_end: params.periodEnd,
          operating_activities: 0,
          investing_activities: 0,
          financing_activities: 0,
          net_cash_flow: 0,
          opening_cash: openingCash,
          closing_cash: openingCash,
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error calculating cash flow', error);
      throw error;
    }
  }

  // ==================== Approval Operations ====================

  /**
   * جلب سير عمل الموافقات
   */
  static async getApprovalWorkflows(): Promise<Database['public']['Tables']['approval_workflows']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .order('workflow_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching approval workflows', error);
      throw error;
    }
  }

  /**
   * جلب الموافقات المعلقة للمحاسب
   */
  static async getPendingApprovals() {
    const { data, error } = await supabase
      .from("approvals")
      .select(`
        *,
        journal_entry:journal_entries(*)
      `)
      .in("status", ["pending", "معلق"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب حالة الموافقات للـ Workflow
   */
  static async getApprovalWorkflowStatus() {
    const { data, error } = await supabase
      .from("approval_status")
      .select(`
        *,
        approval_steps (*)
      `)
      .in("status", ["pending", "معلق"])
      .order("started_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * الموافقة على قيد
   */
  static async approveJournalApproval(approvalId: string, notes?: string) {
    const { error: approvalError } = await supabase
      .from('approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', approvalId);

    if (approvalError) throw approvalError;
  }

  /**
   * رفض قيد
   */
  static async rejectJournalApproval(approvalId: string, notes: string) {
    const { error } = await supabase
      .from('approvals')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        notes: notes,
      })
      .eq('id', approvalId);

    if (error) throw error;
  }

  // ==================== Invoice Operations ====================

  // ==================== Missing Methods ====================

  /**
   * جلب إحصائيات المحاسب
   */
  static async getAccountantKPIs() {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('status, entry_date, created_at');

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    return {
      pendingApprovals: entries?.filter(e => e.status === 'draft').length || 0, // pending_approval mapped to draft
      draftEntries: entries?.filter(e => e.status === 'draft').length || 0,
      postedEntries: entries?.filter(e => e.status === 'posted').length || 0,
      cancelledEntries: entries?.filter(e => e.status === 'cancelled').length || 0,
      todayEntries: entries?.filter(e => e.entry_date === today).length || 0,
      monthlyTotal: entries?.filter(e => e.entry_date >= monthStart).length || 0,
      totalEntries: entries?.length || 0,
    };
  }

  /**
   * جلب ميزان المراجعة البسيط
   */
  static async getTrialBalanceSimple() {
    const result = await TrialBalanceService.getTrialBalance();
    return result.accounts.map(acc => ({
      account_id: acc.id,
      code: acc.code,
      name: acc.name_ar,
      debit: acc.debit_total,
      credit: acc.credit_total,
      balance: acc.debit_total - acc.credit_total,
    }));
  }

  /**
   * جلب الميزانية العمومية - حساب فعلي من الحسابات
   */
  static async getBalanceSheet() {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('code, account_type, current_balance, is_header')
      .eq('is_active', true)
      .eq('is_header', false);

    if (error) throw error;

    let currentAssets = 0, fixedAssets = 0;
    let currentLiabilities = 0, longTermLiabilities = 0;
    let capital = 0, reserves = 0;

    (accounts || []).forEach(acc => {
      const balance = acc.current_balance || 0;
      // الأصول المتداولة (1.1.x)
      if (acc.code.startsWith('1.1')) currentAssets += balance;
      // الأصول الثابتة/الذمم (1.2.x, 1.3.x)
      else if (acc.code.startsWith('1.')) fixedAssets += balance;
      // الخصوم المتداولة (2.1.x)
      else if (acc.code.startsWith('2.1')) currentLiabilities += balance;
      // الخصوم طويلة الأجل (2.2.x)
      else if (acc.code.startsWith('2.')) longTermLiabilities += balance;
      // رأس المال (3.1.x)
      else if (acc.code.startsWith('3.1')) capital += balance;
      // الاحتياطيات والأرباح المحتجزة (3.2.x, 3.3.x)
      else if (acc.code.startsWith('3.')) reserves += balance;
    });

    const totalAssets = currentAssets + fixedAssets;
    const totalLiabilities = currentLiabilities + longTermLiabilities;
    const totalEquity = capital + reserves;

    return {
      assets: { current: currentAssets, fixed: fixedAssets, total: totalAssets },
      liabilities: { current: currentLiabilities, longTerm: longTermLiabilities, total: totalLiabilities },
      equity: { capital, reserves, total: totalEquity },
      retainedEarnings: totalAssets - totalLiabilities - totalEquity,
    };
  }

  /**
   * جلب قائمة الدخل - حساب فعلي من الحسابات
   */
  static async getIncomeStatement() {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('code, account_type, current_balance, is_header')
      .eq('is_active', true)
      .eq('is_header', false);

    if (error) throw error;

    let propertyRevenue = 0, investmentRevenue = 0, otherRevenue = 0;
    let administrativeExp = 0, operationalExp = 0, beneficiariesExp = 0;

    (accounts || []).forEach(acc => {
      const balance = acc.current_balance || 0;
      // إيرادات عقارية (4.1.x)
      if (acc.code.startsWith('4.1')) propertyRevenue += balance;
      // إيرادات استثمارات (4.2.x)
      else if (acc.code.startsWith('4.2')) investmentRevenue += balance;
      // إيرادات أخرى (4.x)
      else if (acc.code.startsWith('4.')) otherRevenue += balance;
      // مصروفات إدارية (5.1.x)
      else if (acc.code.startsWith('5.1')) administrativeExp += balance;
      // مصروفات تشغيلية (5.2.x, 5.3.x)
      else if (acc.code.startsWith('5.2') || acc.code.startsWith('5.3')) operationalExp += balance;
      // مصروفات مستفيدين (5.4.x, 5.5.x, etc.)
      else if (acc.code.startsWith('5.')) beneficiariesExp += balance;
    });

    const totalRevenue = propertyRevenue + investmentRevenue + otherRevenue;
    const totalExpenses = administrativeExp + operationalExp + beneficiariesExp;

    return {
      revenue: { property: propertyRevenue, investment: investmentRevenue, other: otherRevenue, total: totalRevenue },
      expenses: { administrative: administrativeExp, operational: operationalExp, beneficiaries: beneficiariesExp, total: totalExpenses },
      netIncome: totalRevenue - totalExpenses,
    };
  }

  /**
   * جلب الحسابات النشطة للقيد
   */
  static async getActiveAccountsForJournalEntry() {
    return AccountService.getAccountsForEntry();
  }

  /**
   * جلب إحصائيات أمين الصندوق
   */
  static async getCashierStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const [bankAccountRes, receiptsRes, paymentsRes, pendingRes] = await Promise.all([
      supabase.from('accounts').select('current_balance').eq('code', '1.1.1').maybeSingle(),
      supabase.from('journal_entry_lines')
        .select('debit_amount, journal_entries!inner(entry_date, status)')
        .gte('journal_entries.entry_date', today)
        .eq('journal_entries.status', 'posted'),
      supabase.from('journal_entry_lines')
        .select('credit_amount, journal_entries!inner(entry_date, status)')
        .gte('journal_entries.entry_date', today)
        .eq('journal_entries.status', 'posted'),
      supabase.from('journal_entries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),
    ]);

    const todayReceipts = (receiptsRes.data || []).reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const todayPayments = (paymentsRes.data || []).reduce((sum, line) => sum + (line.credit_amount || 0), 0);
    
    return {
      cashBalance: bankAccountRes.data?.current_balance || 0,
      todayReceipts,
      todayPayments,
      pendingTransactions: pendingRes.count || 0,
    };
  }

  /**
   * جلب حسابات الإيرادات
   */
  static async getRevenueAccounts() {
    const { data, error } = await supabase.from('accounts').select('*').eq('account_type', 'revenue').eq('is_active', true).order('code');
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب المعاملات الموحدة
   */
  static async getUnifiedTransactions() {
    const { data, error } = await supabase.from('journal_entries').select('*').order('entry_date', { ascending: false }).limit(100);
    if (error) throw error;
    // تحويل إلى UnifiedTransaction
    return (data || []).map(entry => ({
      source: 'journal_entries',
      source_name_ar: 'قيد محاسبي',
      source_name_en: 'Journal Entry',
      id: entry.id,
      transaction_date: entry.entry_date,
      amount: 0,
      party_name: entry.created_by || '',
      transaction_type: 'قيد',
      payment_method: 'نظام',
      description: entry.description || '',
      status: entry.status,
      journal_entry_id: entry.id,
      reference_number: entry.entry_number,
      created_at: entry.created_at,
      beneficiary_id: null,
      contract_number: null,
    }));
  }

  /**
   * جلب الفواتير
   */
  static async getInvoices(statusFilter?: string) {
    let query = supabase
      .from("invoices")
      .select("*")
      .order("invoice_date", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث حالة الفاتورة
   */
  static async updateInvoiceStatus(invoiceId: string, status: string) {
    const { error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", invoiceId);

    if (error) throw error;
  }
}

/**
 * JournalEntryFormService - للتوافق العكسي
 */
export class JournalEntryFormService {
  static getAccountsForEntry = AccountService.getAccountsForEntry;

  static async getActiveFiscalYear() {
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('id, name, start_date, end_date, is_active')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createJournalEntry(params: {
    entryDate: string;
    description: string;
    fiscalYearId: string;
    lines: Array<{
      account_id: string;
      description: string;
      debit_amount: number;
      credit_amount: number;
    }>;
  }) {
    const entryNumber = `JE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert([
        {
          entry_number: entryNumber,
          entry_date: params.entryDate,
          description: params.description,
          fiscal_year_id: params.fiscalYearId,
          status: 'draft',
        },
      ])
      .select()
      .maybeSingle();

    if (entryError) throw entryError;
    if (!entry) throw new Error('فشل إنشاء القيد');

    const linesData = params.lines.map((line, index) => ({
      journal_entry_id: entry.id,
      account_id: line.account_id,
      line_number: index + 1,
      description: line.description,
      debit_amount: line.debit_amount || 0,
      credit_amount: line.credit_amount || 0,
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(linesData);

    if (linesError) throw linesError;

    return entry;
  }
}
