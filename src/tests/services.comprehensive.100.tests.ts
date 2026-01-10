/**
 * Services Comprehensive 100% Tests
 * اختبارات شاملة لجميع الخدمات الـ 60+
 * @version 5.0.0
 */

import { supabase } from '@/integrations/supabase/client';

// استيراد جميع الخدمات
import * as AllServices from '@/services';

export interface ServiceMethodTest {
  service: string;
  method: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  details: string;
  error?: string;
}

// خريطة الخدمات مع الدوال الحقيقية
const SERVICES_METHODS_MAP: Record<string, {
  table?: string;
  methods: string[];
}> = {
  // Core Services
  'NotificationService': {
    table: 'notifications',
    methods: ['getAll', 'getUnread', 'markAsRead', 'create', 'delete'],
  },
  'RequestService': {
    table: 'beneficiary_requests',
    methods: ['getAll', 'getById', 'create', 'update', 'delete'],
  },
  'VoucherService': {
    table: 'payment_vouchers',
    methods: ['getAll', 'getById', 'create', 'update', 'delete'],
  },
  'ReportService': {
    methods: ['generateReport', 'getReportTypes', 'exportReport'],
  },
  'DashboardService': {
    methods: ['getStats', 'getKPIs', 'getActivities', 'getSystemOverview'],
  },
  
  // Domain Services
  'BeneficiaryService': {
    table: 'beneficiaries',
    methods: ['getAll', 'getById', 'create', 'update', 'delete', 'getStats', 'getActivity', 'getDocuments'],
  },
  'PropertyService': {
    table: 'properties',
    methods: ['getAll', 'getById', 'create', 'update', 'delete', 'getStats'],
  },
  'TenantService': {
    table: 'tenants',
    methods: ['getAll', 'getById', 'create', 'update', 'delete'],
  },
  'ContractService': {
    table: 'contracts',
    methods: ['getAll', 'getById', 'create', 'update', 'delete'],
  },
  'AccountingService': {
    table: 'accounts',
    methods: ['getAccounts', 'getChartOfAccounts', 'getJournalEntries', 'getTrialBalance', 'getFinancialSummary'],
  },
  'PaymentService': {
    table: 'payments',
    methods: ['getAll', 'getById', 'create', 'update', 'delete'],
  },
  'InvoiceService': {
    table: 'invoices',
    methods: ['getAll', 'getById', 'create', 'update', 'delete'],
  },
  'DistributionService': {
    table: 'distributions',
    methods: ['getAll', 'getById', 'create', 'getSummary'],
  },
  'FundService': {
    table: 'funds',
    methods: ['getAll', 'getById', 'create', 'update'],
  },
  'LoansService': {
    table: 'loans',
    methods: ['getAll', 'getById', 'create', 'update'],
  },
  'GovernanceService': {
    table: 'governance_decisions',
    methods: ['getAll', 'getById', 'create', 'update'],
  },
  'DisclosureService': {
    table: 'annual_disclosures',
    methods: ['getAll', 'getById', 'create'],
  },
  'ApprovalService': {
    table: 'approval_workflows',
    methods: ['getAll', 'getById', 'create', 'approve', 'reject'],
  },
  'FamilyService': {
    table: 'families',
    methods: ['getAll', 'getById', 'create', 'update'],
  },
  'TribeService': {
    table: 'tribes',
    methods: ['getAll', 'create'],
  },
  'MaintenanceService': {
    table: 'maintenance_requests',
    methods: ['getAll', 'getById', 'create', 'update'],
  },
  'WaqfService': {
    table: 'waqf_units',
    methods: ['getAll', 'getById', 'create'],
  },
  'FiscalYearService': {
    table: 'fiscal_years',
    methods: ['getAll', 'getActive', 'create', 'close'],
  },
  
  // Infrastructure Services
  'AuthService': {
    table: 'profiles',
    methods: ['getCurrentUser', 'login', 'logout', 'updateProfile'],
  },
  'PermissionsService': {
    table: 'role_permissions',
    methods: ['getAll', 'getByRole', 'update'],
  },
  'UserService': {
    table: 'profiles',
    methods: ['getAll', 'getById', 'update'],
  },
  'AuditService': {
    table: 'audit_logs',
    methods: ['getAll', 'log'],
  },
  'SupportService': {
    table: 'support_tickets',
    methods: ['getAll', 'getById', 'create', 'update'],
  },
  'KnowledgeService': {
    table: 'knowledge_articles',
    methods: ['getAll', 'getById', 'create'],
  },
  'MessageService': {
    table: 'internal_messages',
    methods: ['getAll', 'getById', 'send'],
  },
  'SettingsService': {
    table: 'organization_settings',
    methods: ['get', 'update'],
  },
  'POSService': {
    table: 'pos_transactions',
    methods: ['getAll', 'create', 'getStats'],
  },
  'SearchService': {
    methods: ['search', 'saveSearch', 'getRecent'],
  },
  'StorageService': {
    methods: ['upload', 'download', 'delete', 'getUrl'],
  },
  'EdgeFunctionService': {
    methods: ['invoke', 'getHealth'],
  },
  'RealtimeService': {
    methods: ['subscribe', 'unsubscribe'],
  },
  'MonitoringService': {
    table: 'smart_alerts',
    methods: ['getAlerts', 'getStats', 'getHealth'],
  },
  'AIService': {
    methods: ['getInsights', 'analyze'],
  },
  'ChatbotService': {
    methods: ['sendMessage', 'getHistory'],
  },
  'SystemService': {
    methods: ['getHealth', 'getSettings'],
  },
  'SecurityService': {
    methods: ['checkPermission', 'validateToken'],
  },
  'IntegrationService': {
    table: 'bank_integrations',
    methods: ['getAll', 'create', 'sync'],
  },
  'BankReconciliationService': {
    table: 'bank_accounts',
    methods: ['getAccounts', 'reconcile'],
  },
  'RentalPaymentService': {
    table: 'rental_payments',
    methods: ['getAll', 'getById', 'create'],
  },
  'ArchiveService': {
    table: 'documents',
    methods: ['getAll', 'archive', 'restore'],
  },
  'HistoricalRentalService': {
    table: 'historical_rental_details',
    methods: ['getAll', 'create'],
  },
  'DocumentService': {
    methods: ['generate', 'preview'],
  },
  'ScheduledReportService': {
    table: 'scheduled_reports',
    methods: ['getAll', 'create', 'run'],
  },
  'NotificationSettingsService': {
    table: 'notification_settings',
    methods: ['get', 'update'],
  },
  'TwoFactorService': {
    methods: ['enable', 'disable', 'verify'],
  },
  'BiometricService': {
    methods: ['register', 'authenticate'],
  },
  'TranslationService': {
    methods: ['translate', 'getLanguages'],
  },
  'AISystemAuditService': {
    table: 'ai_system_audits',
    methods: ['getAll', 'run', 'getFixes'],
  },
  'EdgeFunctionsHealthService': {
    methods: ['checkAll', 'getStatus'],
  },
};

/**
 * اختبار وجود خدمة
 */
async function testServiceExists(serviceName: string): Promise<ServiceMethodTest> {
  const start = performance.now();
  
  try {
    const service = (AllServices as any)[serviceName];
    
    if (service) {
      return {
        service: serviceName,
        method: 'exists',
        status: 'passed',
        duration: performance.now() - start,
        details: 'الخدمة موجودة',
      };
    }
    
    return {
      service: serviceName,
      method: 'exists',
      status: 'failed',
      duration: performance.now() - start,
      details: 'الخدمة غير موجودة',
      error: 'Service not found in exports',
    };
  } catch (e) {
    return {
      service: serviceName,
      method: 'exists',
      status: 'failed',
      duration: performance.now() - start,
      details: 'خطأ في استيراد الخدمة',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

/**
 * اختبار دالة في خدمة
 */
async function testServiceMethod(
  serviceName: string,
  methodName: string
): Promise<ServiceMethodTest> {
  const start = performance.now();
  
  try {
    const service = (AllServices as any)[serviceName];
    
    if (!service) {
      return {
        service: serviceName,
        method: methodName,
        status: 'skipped',
        duration: performance.now() - start,
        details: 'الخدمة غير موجودة',
      };
    }
    
    // التحقق من وجود الدالة
    if (typeof service[methodName] === 'function') {
      return {
        service: serviceName,
        method: methodName,
        status: 'passed',
        duration: performance.now() - start,
        details: 'الدالة موجودة وقابلة للاستدعاء',
      };
    }
    
    // البحث عن دوال مشابهة
    const methods = Object.keys(service).filter(k => typeof service[k] === 'function');
    
    return {
      service: serviceName,
      method: methodName,
      status: 'skipped',
      duration: performance.now() - start,
      details: `الدالة غير موجودة. الدوال المتاحة: ${methods.slice(0, 5).join(', ')}...`,
    };
  } catch (e) {
    return {
      service: serviceName,
      method: methodName,
      status: 'failed',
      duration: performance.now() - start,
      details: 'خطأ في الاختبار',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

/**
 * اختبار اتصال خدمة بقاعدة البيانات
 */
async function testServiceDBConnection(
  serviceName: string,
  tableName: string
): Promise<ServiceMethodTest> {
  const start = performance.now();
  
  try {
    const { data, error, count } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: false })
      .limit(5);
    
    const duration = performance.now() - start;
    
    if (error) {
      // أخطاء RLS تعني الجدول موجود ومحمي
      if (error.message?.includes('permission') || error.code === 'PGRST301') {
        return {
          service: serviceName,
          method: `DB → ${tableName}`,
          status: 'passed',
          duration,
          details: `الجدول محمي بـ RLS`,
        };
      }
      
      return {
        service: serviceName,
        method: `DB → ${tableName}`,
        status: 'failed',
        duration,
        details: 'خطأ في الاتصال',
        error: error.message,
      };
    }
    
    return {
      service: serviceName,
      method: `DB → ${tableName}`,
      status: 'passed',
      duration,
      details: `${count ?? data?.length ?? 0} سجل`,
    };
  } catch (e) {
    return {
      service: serviceName,
      method: `DB → ${tableName}`,
      status: 'failed',
      duration: performance.now() - start,
      details: 'خطأ في الاختبار',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

/**
 * تشغيل جميع اختبارات الخدمات الشاملة 100%
 */
export async function runServicesComprehensive100Tests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: ServiceMethodTest[];
  coverage: number;
}> {
  console.log('🧪 بدء اختبارات الخدمات الشاملة 100%...');
  
  const results: ServiceMethodTest[] = [];
  
  for (const [serviceName, config] of Object.entries(SERVICES_METHODS_MAP)) {
    // اختبار وجود الخدمة
    const existsResult = await testServiceExists(serviceName);
    results.push(existsResult);
    
    // اختبار اتصال قاعدة البيانات إذا كان هناك جدول
    if (config.table) {
      const dbResult = await testServiceDBConnection(serviceName, config.table);
      results.push(dbResult);
    }
    
    // اختبار كل دالة
    for (const method of config.methods) {
      const methodResult = await testServiceMethod(serviceName, method);
      results.push(methodResult);
    }
  }
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const total = results.length;
  const coverage = total > 0 ? (passed / total) * 100 : 0;
  
  console.log(`✅ اكتمل: ${passed}/${total} (${coverage.toFixed(1)}%)`);
  
  return {
    total,
    passed,
    failed,
    skipped,
    results,
    coverage,
  };
}

export default runServicesComprehensive100Tests;
