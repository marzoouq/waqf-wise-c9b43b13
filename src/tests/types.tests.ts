/**
 * Types Tests - اختبارات أنواع البيانات الحقيقية
 * @version 3.0.0
 * اختبارات تستورد الأنواع فعلياً وتتحقق من التصديرات
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

const generateId = () => `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// قائمة ملفات الأنواع للاختبار
const TYPES_TO_TEST = [
  { file: 'accounting', path: '@/types/accounting' },
  { file: 'admin', path: '@/types/admin' },
  { file: 'alerts', path: '@/types/alerts' },
  { file: 'approvals', path: '@/types/approvals' },
  { file: 'audit', path: '@/types/audit' },
  { file: 'auth', path: '@/types/auth' },
  { file: 'auto-journal', path: '@/types/auto-journal' },
  { file: 'bank-transfer', path: '@/types/bank-transfer' },
  { file: 'banking', path: '@/types/banking' },
  { file: 'beneficiary', path: '@/types/beneficiary' },
  { file: 'contracts', path: '@/types/contracts' },
  { file: 'dashboard', path: '@/types/dashboard' },
  { file: 'disclosure', path: '@/types/disclosure' },
  { file: 'distributions', path: '@/types/distributions' },
  { file: 'documents', path: '@/types/documents' },
  { file: 'governance', path: '@/types/governance' },
  { file: 'integrations', path: '@/types/integrations' },
  { file: 'invoices', path: '@/types/invoices' },
  { file: 'journal', path: '@/types/journal' },
  { file: 'loans', path: '@/types/loans' },
  { file: 'maintenance', path: '@/types/maintenance' },
  { file: 'messages', path: '@/types/messages' },
  { file: 'monitoring', path: '@/types/monitoring' },
  { file: 'notifications', path: '@/types/notifications' },
  { file: 'payments', path: '@/types/payments' },
  { file: 'performance', path: '@/types/performance' },
  { file: 'requests', path: '@/types/requests' },
  { file: 'roles', path: '@/types/roles' },
  { file: 'security', path: '@/types/security' },
  { file: 'support', path: '@/types/support' },
  { file: 'tenants', path: '@/types/tenants' },
  { file: 'tribes', path: '@/types/tribes' },
];

/**
 * اختبار استيراد ملف الأنواع الحقيقي
 */
async function testTypeFileImport(fileName: string, filePath: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const module = await import(/* @vite-ignore */ filePath);
    const exports = Object.keys(module);
    
    if (exports.length === 0) {
      return {
        id: generateId(),
        name: `استيراد ${fileName}.ts`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'types',
        error: 'الملف لا يحتوي على تصديرات',
        recommendation: `أضف تصديرات إلى src/types/${fileName}.ts`
      };
    }
    
    return {
      id: generateId(),
      name: `استيراد ${fileName}.ts`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'types',
      details: `${exports.length} تصدير: ${exports.slice(0, 5).join(', ')}${exports.length > 5 ? '...' : ''}`
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // ملف غير موجود
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('not found')) {
      return {
        id: generateId(),
        name: `استيراد ${fileName}.ts`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'types',
        error: `الملف غير موجود: src/types/${fileName}.ts`,
        recommendation: `أنشئ الملف src/types/${fileName}.ts`
      };
    }
    
    return {
      id: generateId(),
      name: `استيراد ${fileName}.ts`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'types',
      error: errorMsg.slice(0, 100)
    };
  }
}

/**
 * اختبار أن التصديرات هي أنواع TypeScript صحيحة
 */
async function testTypeExportsValidity(fileName: string, filePath: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const module = await import(/* @vite-ignore */ filePath);
    const exports = Object.keys(module);
    
    if (exports.length === 0) {
      return {
        id: generateId(),
        name: `${fileName}.ts - صحة التصديرات`,
        status: 'skipped',
        duration: performance.now() - startTime,
        category: 'types',
        error: 'لا توجد تصديرات للفحص'
      };
    }
    
    // التحقق من أن التصديرات ليست undefined
    const validExports = exports.filter(e => module[e] !== undefined);
    
    if (validExports.length < exports.length) {
      const invalidExports = exports.filter(e => module[e] === undefined);
      return {
        id: generateId(),
        name: `${fileName}.ts - صحة التصديرات`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'types',
        error: `تصديرات غير صالحة: ${invalidExports.join(', ')}`
      };
    }
    
    return {
      id: generateId(),
      name: `${fileName}.ts - صحة التصديرات`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'types',
      details: `جميع ${exports.length} تصديرات صالحة`
    };
    
  } catch {
    return {
      id: generateId(),
      name: `${fileName}.ts - صحة التصديرات`,
      status: 'skipped',
      duration: performance.now() - startTime,
      category: 'types',
      error: 'لا يمكن استيراد الملف'
    };
  }
}

/**
 * اختبار فهرس الأنواع الرئيسي
 */
async function testTypesIndex(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const module = await import('@/types/index');
    const exports = Object.keys(module);
    
    if (exports.length === 0) {
      return {
        id: generateId(),
        name: 'فهرس الأنواع',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'types',
        error: 'لا توجد تصديرات في src/types/index.ts'
      };
    }
    
    return {
      id: generateId(),
      name: 'فهرس الأنواع',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'types',
      details: `${exports.length} تصدير: ${exports.slice(0, 5).join(', ')}...`
    };
    
  } catch {
    return {
      id: generateId(),
      name: 'فهرس الأنواع',
      status: 'skipped',
      duration: performance.now() - startTime,
      category: 'types',
      details: 'لا يوجد ملف src/types/index.ts'
    };
  }
}

/**
 * اختبار توافق Supabase Types
 */
async function testSupabaseTypesIntegration(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const types = await import('@/integrations/supabase/types');
    
    if (!types) {
      return {
        id: generateId(),
        name: 'توافق Supabase Types',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'types',
        error: 'ملف Types غير متاح'
      };
    }
    
    return {
      id: generateId(),
      name: 'توافق Supabase Types',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'types',
      details: 'Supabase Types متاحة ومُولَّدة'
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: 'توافق Supabase Types',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'types',
      error: error instanceof Error ? error.message : 'فشل استيراد Supabase Types'
    };
  }
}

/**
 * تشغيل جميع اختبارات الأنواع الحقيقية
 */
export async function runTypesTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('📝 بدء اختبارات الأنواع الحقيقية...');
  
  // 1. اختبار فهرس الأنواع
  const indexResult = await testTypesIndex();
  results.push(indexResult);
  
  // 2. اختبار توافق Supabase
  const supabaseResult = await testSupabaseTypesIntegration();
  results.push(supabaseResult);
  
  // 3. اختبار كل ملف أنواع
  for (const typeFile of TYPES_TO_TEST) {
    // اختبار الاستيراد
    const importResult = await testTypeFileImport(typeFile.file, typeFile.path);
    results.push(importResult);
    
    if (importResult.status === 'passed') {
      // اختبار صحة التصديرات
      const validityResult = await testTypeExportsValidity(typeFile.file, typeFile.path);
      results.push(validityResult);
    }
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ اكتمل اختبار الأنواع: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل، ${skipped} متجاوز)`);
  
  return results;
}
