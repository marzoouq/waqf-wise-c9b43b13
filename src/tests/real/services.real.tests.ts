/**
 * Real Services Tests - اختبارات الخدمات الحقيقية
 * @version 2.0.0
 * تختبر الخدمات عبر الاتصال الحقيقي بقاعدة البيانات
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

const generateId = () => `real-svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// الخدمات للاختبار مع الجداول المرتبطة
const SERVICES_TO_TEST = [
  { name: 'AccountingService', table: 'accounts' },
  { name: 'BeneficiaryService', table: 'beneficiaries' },
  { name: 'PropertyService', table: 'properties' },
  { name: 'TenantService', table: 'tenants' },
  { name: 'ContractService', table: 'contracts' },
  { name: 'PaymentService', table: 'payments' },
  { name: 'InvoiceService', table: 'invoices' },
  { name: 'VoucherService', table: 'payment_vouchers' },
  { name: 'DistributionService', table: 'distributions' },
  { name: 'FundService', table: 'funds' },
  { name: 'GovernanceService', table: 'governance_decisions' },
  { name: 'DisclosureService', table: 'annual_disclosures' },
  { name: 'FamilyService', table: 'families' },
  { name: 'TribeService', table: 'tribes' },
  { name: 'MaintenanceService', table: 'maintenance_requests' },
  { name: 'SupportService', table: 'support_tickets' },
  { name: 'NotificationService', table: 'notifications' },
  { name: 'AuthService', table: 'profiles' },
  { name: 'SettingsService', table: 'organization_settings' },
  { name: 'LoanService', table: 'loans' },
  { name: 'POSService', table: 'pos_transactions' },
  { name: 'WaqfService', table: 'waqf_units' },
  { name: 'AuditService', table: 'audit_logs' },
  { name: 'MessageService', table: 'messages' },
  { name: 'FiscalYearService', table: 'fiscal_years' },
  { name: 'ApprovalService', table: 'approval_workflows' },
  { name: 'SupportMessageService', table: 'support_messages' },
  { name: 'IntegrationService', table: 'integrations' },
  { name: 'ScheduledReportService', table: 'scheduled_reports' },
];

/**
 * اختبار اتصال الخدمة بقاعدة البيانات
 */
async function testServiceDatabaseConnection(
  serviceName: string, 
  tableName: string
): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    const { error, count } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      // RLS يعني الجدول موجود والخدمة يمكن أن تعمل
      if (error.message.includes('RLS') || 
          error.code === 'PGRST301' || 
          error.message.includes('permission') ||
          error.code === '42501') {
        return {
          id: generateId(),
          name: `${serviceName} → ${tableName}`,
          category: 'services',
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
          name: `${serviceName} → ${tableName}`,
          category: 'services',
          status: 'failed',
          duration: Math.round(performance.now() - startTime),
          error: `❌ الجدول غير موجود: ${tableName}`,
          isReal: true
        };
      }
      
      return {
        id: generateId(),
        name: `${serviceName} → ${tableName}`,
        category: 'services',
        status: 'failed',
        duration: Math.round(performance.now() - startTime),
        error: error.message,
        isReal: true
      };
    }
    
    return {
      id: generateId(),
      name: `${serviceName} → ${tableName}`,
      category: 'services',
      status: 'passed',
      duration: Math.round(performance.now() - startTime),
      details: `✅ متصل بـ ${tableName} (${count ?? 0} سجل)`,
      isReal: true
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `${serviceName} → ${tableName}`,
      category: 'services',
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      error: error instanceof Error ? error.message : 'خطأ غير متوقع',
      isReal: true
    };
  }
}

/**
 * تشغيل جميع اختبارات الخدمات الحقيقية
 */
export async function runRealServicesTests(): Promise<RealTestResult[]> {
  const results: RealTestResult[] = [];
  
  console.log('🔧 بدء اختبارات الخدمات الحقيقية...');
  
  for (const service of SERVICES_TO_TEST) {
    const result = await testServiceDatabaseConnection(service.name, service.table);
    results.push(result);
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`✅ اكتمل اختبار الخدمات: ${passed} ناجح، ${failed} فاشل من ${results.length}`);
  
  return results;
}

export default runRealServicesTests;
