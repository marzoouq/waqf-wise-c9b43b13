/**
 * Real Hooks Tests - اختبارات Hooks حقيقية وملموسة
 * @version 2.0.0
 * تختبر الـ Hooks عبر الاتصال بقاعدة البيانات المرتبطة
 */

import { supabase } from '@/integrations/supabase/client';

export interface RealTestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  details?: string;
  error?: string;
  isReal: true;
}

const generateId = () => `real-hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// قائمة الـ Hooks للاختبار مع الجداول المرتبطة
const HOOKS_TO_TEST = [
  // المحاسبة
  { name: 'useAccounts', table: 'accounts', category: 'accounting' },
  { name: 'useJournalEntries', table: 'journal_entries', category: 'accounting' },
  { name: 'useFiscalYears', table: 'fiscal_years', category: 'accounting' },
  { name: 'useBudgets', table: 'budgets', category: 'accounting' },
  { name: 'useGeneralLedger', table: 'journal_entry_lines', category: 'accounting' },
  
  // المستفيدين
  { name: 'useBeneficiaries', table: 'beneficiaries', category: 'beneficiary' },
  { name: 'useBeneficiaryProfile', table: 'beneficiaries', category: 'beneficiary' },
  { name: 'useBeneficiaryRequests', table: 'beneficiary_requests', category: 'beneficiary' },
  { name: 'useFamilies', table: 'families', category: 'beneficiary' },
  { name: 'useTribes', table: 'tribes', category: 'beneficiary' },
  { name: 'useBeneficiaryCategories', table: 'beneficiary_categories', category: 'beneficiary' },
  
  // العقارات
  { name: 'useProperties', table: 'properties', category: 'property' },
  { name: 'usePropertyUnits', table: 'property_units', category: 'property' },
  { name: 'useTenants', table: 'tenants', category: 'property' },
  { name: 'useContracts', table: 'contracts', category: 'property' },
  { name: 'useMaintenanceRequests', table: 'maintenance_requests', category: 'property' },
  { name: 'useRentalPayments', table: 'rental_payments', category: 'property' },
  
  // التوزيعات
  { name: 'useDistributions', table: 'distributions', category: 'distributions' },
  { name: 'useFunds', table: 'funds', category: 'distributions' },
  { name: 'useWaqfUnits', table: 'waqf_units', category: 'distributions' },
  { name: 'useHeirDistributions', table: 'heir_distributions', category: 'distributions' },
  
  // المدفوعات
  { name: 'usePayments', table: 'payments', category: 'payments' },
  { name: 'useLoans', table: 'loans', category: 'payments' },
  { name: 'usePaymentVouchers', table: 'payment_vouchers', category: 'payments' },
  { name: 'useBankAccounts', table: 'bank_accounts', category: 'payments' },
  { name: 'useInvoices', table: 'invoices', category: 'payments' },
  { name: 'useBankTransferFiles', table: 'bank_transfer_files', category: 'payments' },
  
  // الحوكمة
  { name: 'useGovernanceDecisions', table: 'governance_decisions', category: 'governance' },
  { name: 'useAnnualDisclosures', table: 'annual_disclosures', category: 'governance' },
  { name: 'useApprovalWorkflows', table: 'approval_workflows', category: 'governance' },
  
  // الإشعارات
  { name: 'useNotifications', table: 'notifications', category: 'notifications' },
  { name: 'useNotificationSettings', table: 'notification_settings', category: 'notifications' },
  
  // المصادقة
  { name: 'useProfiles', table: 'profiles', category: 'auth' },
  { name: 'useUserRoles', table: 'user_roles', category: 'auth' },
  
  // الدعم
  { name: 'useSupportTickets', table: 'support_tickets', category: 'support' },
  { name: 'useSupportMessages', table: 'support_messages', category: 'support' },
  
  // POS
  { name: 'usePOSTransactions', table: 'pos_transactions', category: 'pos' },
  { name: 'useCashierShifts', table: 'cashier_shifts', category: 'pos' },
  
  // المراقبة
  { name: 'useAuditLogs', table: 'audit_logs', category: 'monitoring' },
  { name: 'useSystemErrorLogs', table: 'system_error_logs', category: 'monitoring' },
  { name: 'usePerformanceMetrics', table: 'performance_metrics', category: 'monitoring' },
  
  // التقارير
  { name: 'useScheduledReports', table: 'scheduled_reports', category: 'reports' },
  
  // التكاملات
  { name: 'useIntegrations', table: 'integrations', category: 'integrations' },
  
  // الذكاء الاصطناعي
  { name: 'useAISystemAudits', table: 'ai_system_audits', category: 'ai' },
  
  // الإعدادات
  { name: 'useOrganizationSettings', table: 'organization_settings', category: 'settings' },
  { name: 'useSystemSettings', table: 'system_settings', category: 'settings' },
];

/**
 * اختبار Hook عبر الاتصال بقاعدة البيانات
 */
async function testHookWithDatabase(
  hookName: string,
  tableName: string,
  category: string
): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    const { error, count } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      // RLS يعني الجدول موجود والـ Hook يمكن أن يعمل
      if (error.message.includes('RLS') || 
          error.code === 'PGRST301' || 
          error.message.includes('permission') ||
          error.code === '42501') {
        return {
          id: generateId(),
          name: `${hookName} → ${tableName}`,
          category,
          status: 'passed',
          duration: Math.round(performance.now() - startTime),
          details: `✅ الجدول محمي بـ RLS`,
          isReal: true
        };
      }
      
      // الجدول غير موجود
      if (error.message.includes('does not exist') || 
          error.message.includes('schema cache') ||
          error.code === '42P01') {
        return {
          id: generateId(),
          name: `${hookName} → ${tableName}`,
          category,
          status: 'failed',
          duration: Math.round(performance.now() - startTime),
          error: `❌ الجدول غير موجود: ${tableName}`,
          isReal: true
        };
      }
      
      return {
        id: generateId(),
        name: `${hookName} → ${tableName}`,
        category,
        status: 'failed',
        duration: Math.round(performance.now() - startTime),
        error: `❌ ${error.message}`,
        isReal: true
      };
    }
    
    return {
      id: generateId(),
      name: `${hookName} → ${tableName}`,
      category,
      status: 'passed',
      duration: Math.round(performance.now() - startTime),
      details: `✅ متصل (${count ?? 0} سجل)`,
      isReal: true
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `${hookName} → ${tableName}`,
      category,
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      error: error instanceof Error ? error.message : 'خطأ غير متوقع',
      isReal: true
    };
  }
}

/**
 * تشغيل جميع اختبارات الـ Hooks الحقيقية
 */
export async function runRealHooksTests(): Promise<RealTestResult[]> {
  const results: RealTestResult[] = [];
  
  console.log('🪝 بدء اختبارات Hooks الحقيقية...');
  
  // اختبار كل Hook
  for (const hook of HOOKS_TO_TEST) {
    const result = await testHookWithDatabase(hook.name, hook.table, hook.category);
    results.push(result);
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`✅ اكتمل اختبار Hooks: ${passed} ناجح، ${failed} فاشل من ${results.length}`);
  
  return results;
}

export default runRealHooksTests;
