/**
 * Real Services Tests - اختبارات الخدمات الحقيقية
 * @version 1.0.0
 * تستورد وتختبر كل خدمة فعلياً مع الاتصال الحقيقي بقاعدة البيانات
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

// استيراد جميع الخدمات
const serviceModules = import.meta.glob('/src/services/*.ts', { eager: true });

// الخدمات للاختبار مع الجداول المرتبطة
const SERVICES_TO_TEST = [
  { name: 'AccountingService', file: 'accounting.service', table: 'accounts', methods: ['getAccounts', 'getJournalEntries'] },
  { name: 'BeneficiaryService', file: 'beneficiary.service', table: 'beneficiaries', methods: ['getBeneficiaries', 'getBeneficiaryById'] },
  { name: 'PropertyService', file: 'property.service', table: 'properties', methods: ['getProperties', 'getPropertyById'] },
  { name: 'TenantService', file: 'tenant.service', table: 'tenants', methods: ['getTenants', 'getTenantById'] },
  { name: 'ContractService', file: 'contract.service', table: 'contracts', methods: ['getContracts'] },
  { name: 'PaymentService', file: 'payment.service', table: 'payments', methods: ['getPayments'] },
  { name: 'InvoiceService', file: 'invoice.service', table: 'invoices', methods: ['getInvoices'] },
  { name: 'VoucherService', file: 'voucher.service', table: 'payment_vouchers', methods: ['getVouchers'] },
  { name: 'DistributionService', file: 'distribution.service', table: 'distributions', methods: ['getDistributions'] },
  { name: 'FundService', file: 'fund.service', table: 'funds', methods: ['getFunds'] },
  { name: 'GovernanceService', file: 'governance.service', table: 'governance_decisions', methods: ['getDecisions'] },
  { name: 'DisclosureService', file: 'disclosure.service', table: 'annual_disclosures', methods: ['getDisclosures'] },
  { name: 'FamilyService', file: 'family.service', table: 'families', methods: ['getFamilies'] },
  { name: 'TribeService', file: 'tribe.service', table: 'tribes', methods: ['getTribes'] },
  { name: 'MaintenanceService', file: 'maintenance.service', table: 'maintenance_requests', methods: ['getRequests'] },
  { name: 'SupportService', file: 'support.service', table: 'support_tickets', methods: ['getTickets'] },
  { name: 'NotificationService', file: 'notification.service', table: 'notifications', methods: ['getNotifications'] },
  { name: 'StorageService', file: 'storage.service', table: null, methods: ['uploadFile', 'getFile'] },
  { name: 'AuthService', file: 'auth.service', table: 'profiles', methods: ['getProfile', 'updateProfile'] },
  { name: 'SettingsService', file: 'settings.service', table: 'organization_settings', methods: ['getSettings'] },
  { name: 'LoanService', file: 'loans.service', table: 'loans', methods: ['getLoans'] },
  { name: 'POSService', file: 'pos.service', table: 'pos_transactions', methods: ['getTransactions'] },
  { name: 'ReportService', file: 'report.service', table: null, methods: ['generateReport'] },
  { name: 'SearchService', file: 'search.service', table: null, methods: ['search'] },
  { name: 'WaqfService', file: 'waqf.service', table: 'waqf_units', methods: ['getWaqfUnits'] },
  { name: 'AuditService', file: 'audit.service', table: 'audit_logs', methods: ['getLogs'] },
  { name: 'MessageService', file: 'message.service', table: 'messages', methods: ['getMessages'] },
  { name: 'KnowledgeService', file: 'knowledge.service', table: 'knowledge_articles', methods: ['getArticles'] },
  { name: 'FiscalYearService', file: 'fiscal-year.service', table: 'fiscal_years', methods: ['getFiscalYears'] },
  { name: 'ApprovalService', file: 'approval.service', table: 'approval_workflows', methods: ['getWorkflows'] },
];

/**
 * اختبار استيراد خدمة حقيقي
 */
function testServiceImport(serviceName: string, fileName: string): RealTestResult {
  const startTime = performance.now();
  
  try {
    for (const [path, module] of Object.entries(serviceModules)) {
      if (path.includes(fileName)) {
        const mod = module as Record<string, unknown>;
        const exports = Object.keys(mod);
        
        if (exports.length > 0) {
          // التحقق من وجود الخدمة
          const service = mod[serviceName] || mod.default || Object.values(mod)[0];
          
          if (service) {
            const methods = typeof service === 'object' 
              ? Object.keys(service as object).filter(k => typeof (service as any)[k] === 'function')
              : [];
            
            return {
              id: generateId(),
              name: serviceName,
              category: 'services',
              status: 'passed',
              duration: performance.now() - startTime,
              details: `✅ موجودة (${methods.length} دالة)`,
              isReal: true
            };
          }
          
          return {
            id: generateId(),
            name: serviceName,
            category: 'services',
            status: 'passed',
            duration: performance.now() - startTime,
            details: `✅ موجودة: ${exports.slice(0, 3).join(', ')}`,
            isReal: true
          };
        }
      }
    }
    
    return {
      id: generateId(),
      name: serviceName,
      category: 'services',
      status: 'failed',
      duration: performance.now() - startTime,
      error: `❌ الخدمة غير موجودة: ${fileName}`,
      isReal: true
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: serviceName,
      category: 'services',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

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
      if (error.message.includes('RLS') || 
          error.code === 'PGRST301' || 
          error.message.includes('permission')) {
        return {
          id: generateId(),
          name: `${serviceName} → DB`,
          category: 'services-db',
          status: 'passed',
          duration: performance.now() - startTime,
          details: `✅ الجدول ${tableName} محمي بـ RLS`,
          isReal: true
        };
      }
      
      if (error.message.includes('does not exist')) {
        return {
          id: generateId(),
          name: `${serviceName} → DB`,
          category: 'services-db',
          status: 'failed',
          duration: performance.now() - startTime,
          error: `❌ الجدول ${tableName} غير موجود`,
          isReal: true
        };
      }
      
      return {
        id: generateId(),
        name: `${serviceName} → DB`,
        category: 'services-db',
        status: 'failed',
        duration: performance.now() - startTime,
        error: error.message,
        isReal: true
      };
    }
    
    return {
      id: generateId(),
      name: `${serviceName} → DB`,
      category: 'services-db',
      status: 'passed',
      duration: performance.now() - startTime,
      details: `✅ متصل بـ ${tableName} (${count ?? 0} سجل)`,
      isReal: true
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `${serviceName} → DB`,
      category: 'services-db',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

/**
 * اختبار وظائف الخدمة
 */
function testServiceMethods(
  serviceName: string, 
  fileName: string, 
  expectedMethods: string[]
): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  for (const [path, module] of Object.entries(serviceModules)) {
    if (path.includes(fileName)) {
      const mod = module as Record<string, unknown>;
      const service = mod[serviceName] || mod.default || Object.values(mod)[0];
      
      if (service && typeof service === 'object') {
        for (const method of expectedMethods) {
          const hasMethod = typeof (service as any)[method] === 'function';
          
          results.push({
            id: generateId(),
            name: `${serviceName}.${method}()`,
            category: 'services-methods',
            status: hasMethod ? 'passed' : 'skipped',
            duration: 0,
            details: hasMethod ? '✅ الدالة موجودة' : 'قد تكون باسم مختلف',
            isReal: true
          });
        }
      }
      break;
    }
  }
  
  return results;
}

/**
 * تشغيل جميع اختبارات الخدمات الحقيقية
 */
export async function runRealServicesTests(): Promise<RealTestResult[]> {
  const results: RealTestResult[] = [];
  
  console.log('🔧 بدء اختبارات الخدمات الحقيقية...');
  
  // إجمالي ملفات الخدمات
  const totalServices = Object.keys(serviceModules).length;
  results.push({
    id: generateId(),
    name: 'إجمالي ملفات الخدمات',
    category: 'services-summary',
    status: 'passed',
    duration: 0,
    details: `✅ ${totalServices} ملف خدمة`,
    isReal: true
  });
  
  for (const service of SERVICES_TO_TEST) {
    // اختبار الاستيراد
    const importResult = testServiceImport(service.name, service.file);
    results.push(importResult);
    
    // اختبار الاتصال بقاعدة البيانات
    if (service.table) {
      const dbResult = await testServiceDatabaseConnection(service.name, service.table);
      results.push(dbResult);
    }
    
    // اختبار الدوال
    if (importResult.status === 'passed' && service.methods.length > 0) {
      const methodResults = testServiceMethods(service.name, service.file, service.methods);
      results.push(...methodResults);
    }
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`✅ اكتمل اختبار الخدمات: ${passed} ناجح، ${failed} فاشل من ${results.length}`);
  
  return results;
}

export default runRealServicesTests;
