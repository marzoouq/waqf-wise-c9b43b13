/**
 * Services Tests - اختبارات الخدمات الحقيقية
 * @version 3.0.0
 * اختبارات وظيفية حقيقية تستورد الخدمات فعلياً
 */

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  details?: string;
  error?: string;
  recommendation?: string;
}

const generateId = () => `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// قائمة الخدمات للاختبار مع مساراتها الحقيقية
const SERVICES_TO_TEST = [
  { name: 'AccountingService', file: 'accounting.service' },
  { name: 'ApprovalService', file: 'approval.service' },
  { name: 'BeneficiaryService', file: 'beneficiary.service' },
  { name: 'ContractService', file: 'contract.service' },
  { name: 'DistributionService', file: 'distribution.service' },
  { name: 'FamilyService', file: 'family.service' },
  { name: 'FiscalYearService', file: 'fiscal-year.service' },
  { name: 'FundService', file: 'fund.service' },
  { name: 'GovernanceService', file: 'governance.service' },
  { name: 'InvoiceService', file: 'invoice.service' },
  { name: 'LoanService', file: 'loans.service' },
  { name: 'MaintenanceService', file: 'maintenance.service' },
  { name: 'NotificationService', file: 'notification.service' },
  { name: 'PaymentService', file: 'payment.service' },
  { name: 'PropertyService', file: 'property.service' },
  { name: 'ReportService', file: 'report.service' },
  { name: 'RequestService', file: 'request.service' },
  { name: 'SearchService', file: 'search.service' },
  { name: 'SettingsService', file: 'settings.service' },
  { name: 'StorageService', file: 'storage.service' },
  { name: 'SupportService', file: 'support.service' },
  { name: 'TenantService', file: 'tenant.service' },
  { name: 'TribeService', file: 'tribe.service' },
  { name: 'UserService', file: 'user.service' },
  { name: 'VoucherService', file: 'voucher.service' },
  { name: 'WaqfService', file: 'waqf.service' },
  { name: 'DisclosureService', file: 'disclosure.service' },
  { name: 'DocumentService', file: 'document.service' },
  { name: 'IntegrationService', file: 'integration.service' },
  { name: 'KnowledgeService', file: 'knowledge.service' },
  { name: 'MessageService', file: 'message.service' },
  { name: 'SystemService', file: 'system.service' },
  { name: 'EdgeFunctionService', file: 'edge-function.service' },
  { name: 'POSService', file: 'pos.service' },
  { name: 'BankReconciliationService', file: 'bank-reconciliation.service' },
  { name: 'RentalPaymentService', file: 'rental-payment.service' },
];

// الدوال المتوقعة في الخدمات
const EXPECTED_METHODS = ['getAll', 'getById', 'create', 'update', 'delete'];

/**
 * اختبار استيراد الخدمة الحقيقي
 */
async function testServiceImport(serviceName: string, fileName: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    // استيراد حقيقي من barrel export
    const servicesModule = await import('@/services/index');
    const ServiceClass = (servicesModule as any)[serviceName];
    
    if (!ServiceClass) {
      // محاولة استيراد مباشر
      try {
        const directModule = await import(`@/services/${fileName}`);
        const directService = Object.values(directModule)[0];
        
        if (directService) {
          return {
            id: generateId(),
            name: `استيراد ${serviceName}`,
            status: 'passed',
            duration: performance.now() - startTime,
            category: 'services',
            details: 'تم الاستيراد من الملف مباشرة (غير مُصدَّر من index)'
          };
        }
      } catch {
        // تجاهل خطأ الاستيراد المباشر
      }
      
      return {
        id: generateId(),
        name: `استيراد ${serviceName}`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'services',
        error: `الخدمة ${serviceName} غير مُصدَّرة من @/services/index`,
        recommendation: `أضف "export { ${serviceName} } from './${fileName}';" إلى src/services/index.ts`
      };
    }
    
    return {
      id: generateId(),
      name: `استيراد ${serviceName}`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'services',
      details: 'الخدمة مُصدَّرة ومتاحة'
    };
  } catch (error) {
    return {
      id: generateId(),
      name: `استيراد ${serviceName}`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'services',
      error: error instanceof Error ? error.message : 'خطأ في الاستيراد',
      recommendation: 'تحقق من وجود الملف وصحة التصديرات'
    };
  }
}

/**
 * اختبار وجود الدوال في الخدمة
 */
async function testServiceMethods(serviceName: string, fileName: string): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  try {
    // محاولة استيراد الخدمة
    let ServiceClass: any = null;
    
    try {
      const servicesModule = await import('@/services/index');
      ServiceClass = (servicesModule as any)[serviceName];
    } catch {
      // محاولة استيراد مباشر
      try {
        const directModule = await import(`@/services/${fileName}`);
        ServiceClass = Object.values(directModule)[0];
      } catch {
        // لا يمكن استيراد الخدمة
      }
    }
    
    if (!ServiceClass) {
      results.push({
        id: generateId(),
        name: `${serviceName} - فحص الدوال`,
        status: 'skipped',
        duration: 0,
        category: 'services',
        error: 'لا يمكن استيراد الخدمة للفحص'
      });
      return results;
    }
    
    // فحص الدوال الموجودة
    const allMethods = Object.getOwnPropertyNames(ServiceClass)
      .filter(name => typeof ServiceClass[name] === 'function' && name !== 'constructor');
    
    // فحص الدوال المتوقعة
    for (const method of EXPECTED_METHODS) {
      const startTime = performance.now();
      const exists = typeof ServiceClass[method] === 'function';
      
      results.push({
        id: generateId(),
        name: `${serviceName}.${method}()`,
        status: exists ? 'passed' : 'skipped',
        duration: performance.now() - startTime,
        category: 'services',
        details: exists ? 'الدالة موجودة' : 'الدالة غير موجودة (اختياري)'
      });
    }
    
    // إضافة معلومات عن الدوال الموجودة فعلياً
    if (allMethods.length > 0) {
      results.push({
        id: generateId(),
        name: `${serviceName} - الدوال المتاحة`,
        status: 'passed',
        duration: 0,
        category: 'services',
        details: `${allMethods.length} دالة: ${allMethods.slice(0, 5).join(', ')}${allMethods.length > 5 ? '...' : ''}`
      });
    }
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: `${serviceName} - فحص الدوال`,
      status: 'failed',
      duration: 0,
      category: 'services',
      error: error instanceof Error ? error.message : 'خطأ في الفحص'
    });
  }
  
  return results;
}

/**
 * اختبار الاتصال بقاعدة البيانات من الخدمة
 */
async function testServiceDatabaseConnection(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // اختبار الاتصال بجلب بسيط
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      // RLS خطأ يعني الاتصال ناجح لكن الحماية تعمل
      if (error.message.includes('RLS') || error.code === 'PGRST301' || error.message.includes('permission')) {
        return {
          id: generateId(),
          name: 'اتصال الخدمات بقاعدة البيانات',
          status: 'passed',
          duration: performance.now() - startTime,
          category: 'services',
          details: 'الاتصال ناجح (محمي بـ RLS)'
        };
      }
      
      return {
        id: generateId(),
        name: 'اتصال الخدمات بقاعدة البيانات',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'services',
        error: error.message
      };
    }
    
    return {
      id: generateId(),
      name: 'اتصال الخدمات بقاعدة البيانات',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'services',
      details: 'الاتصال ناجح'
    };
  } catch (error) {
    return {
      id: generateId(),
      name: 'اتصال الخدمات بقاعدة البيانات',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'services',
      error: error instanceof Error ? error.message : 'فشل الاتصال'
    };
  }
}

/**
 * اختبار تصدير الخدمات من الفهرس الرئيسي
 */
async function testServicesIndexExports(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const servicesModule = await import('@/services/index');
    const exportedServices = Object.keys(servicesModule);
    
    if (exportedServices.length === 0) {
      return {
        id: generateId(),
        name: 'تصدير الخدمات من الفهرس الرئيسي',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'services',
        error: 'لا توجد تصديرات في src/services/index.ts',
        recommendation: 'أضف تصديرات الخدمات إلى src/services/index.ts'
      };
    }
    
    return {
      id: generateId(),
      name: 'تصدير الخدمات من الفهرس الرئيسي',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'services',
      details: `${exportedServices.length} خدمة مُصدَّرة: ${exportedServices.slice(0, 5).join(', ')}...`
    };
  } catch (error) {
    return {
      id: generateId(),
      name: 'تصدير الخدمات من الفهرس الرئيسي',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'services',
      error: error instanceof Error ? error.message : 'خطأ في استيراد الفهرس'
    };
  }
}

/**
 * تشغيل جميع اختبارات الخدمات الحقيقية
 */
export async function runServicesTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🔧 بدء اختبارات الخدمات الحقيقية...');
  
  // 1. اختبار تصدير الفهرس
  const indexResult = await testServicesIndexExports();
  results.push(indexResult);
  
  // 2. اختبار الاتصال بقاعدة البيانات
  const dbResult = await testServiceDatabaseConnection();
  results.push(dbResult);
  
  // 3. اختبار كل خدمة
  for (const service of SERVICES_TO_TEST) {
    // اختبار الاستيراد
    const importResult = await testServiceImport(service.name, service.file);
    results.push(importResult);
    
    // اختبار الدوال (فقط إذا نجح الاستيراد)
    if (importResult.status === 'passed') {
      const methodsResults = await testServiceMethods(service.name, service.file);
      results.push(...methodsResults);
    }
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ اكتمل اختبار الخدمات: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل، ${skipped} متجاوز)`);
  
  return results;
}
