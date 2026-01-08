/**
 * Contexts Tests - اختبارات السياقات الحقيقية
 * @version 3.0.0
 * اختبارات تستورد السياقات فعلياً وتتحقق من وجود Provider و Hook
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

const generateId = () => `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// قائمة السياقات للاختبار
const CONTEXTS_TO_TEST = [
  { name: 'AuthContext', path: '@/contexts/AuthContext', exports: ['AuthProvider', 'useAuth'] },
  { name: 'RolesContext', path: '@/contexts/RolesContext', exports: ['RolesProvider', 'useRoles'] },
  { name: 'SettingsContext', path: '@/contexts/SettingsContext', exports: ['SettingsProvider', 'useSettings'] },
  { name: 'UsersContext', path: '@/contexts/UsersContext', exports: ['UsersProvider', 'useUsers'] },
  { name: 'UsersDialogsContext', path: '@/contexts/UsersDialogsContext', exports: ['UsersDialogsProvider', 'useUsersDialogs'] },
  { name: 'PaymentsDialogsContext', path: '@/contexts/PaymentsDialogsContext', exports: ['PaymentsDialogsProvider', 'usePaymentsDialogs'] },
  { name: 'TenantsDialogsContext', path: '@/contexts/TenantsDialogsContext', exports: ['TenantsDialogsProvider', 'useTenantsDialogs'] },
];

/**
 * اختبار استيراد السياق الحقيقي
 */
async function testContextImport(contextName: string, contextPath: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const module = await import(/* @vite-ignore */ contextPath);
    const exports = Object.keys(module);
    
    if (exports.length === 0) {
      return {
        id: generateId(),
        name: `استيراد ${contextName}`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'contexts',
        error: 'الملف لا يحتوي على تصديرات',
        recommendation: `تحقق من ${contextPath}`
      };
    }
    
    return {
      id: generateId(),
      name: `استيراد ${contextName}`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'contexts',
      details: `التصديرات: ${exports.join(', ')}`
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `استيراد ${contextName}`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'contexts',
      error: error instanceof Error ? error.message : 'خطأ في الاستيراد'
    };
  }
}

/**
 * اختبار وجود Provider في السياق
 */
async function testContextProvider(contextName: string, contextPath: string, expectedExports: string[]): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const module = await import(/* @vite-ignore */ contextPath);
    const exports = Object.keys(module);
    
    // البحث عن Provider
    const providerExport = expectedExports.find(e => e.includes('Provider'));
    const hasProvider = providerExport ? exports.includes(providerExport) : exports.some(e => e.includes('Provider'));
    
    if (!hasProvider) {
      return {
        id: generateId(),
        name: `${contextName} Provider`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'contexts',
        error: 'لا يوجد Provider مُصدَّر',
        recommendation: `أضف تصدير Provider من ${contextPath}`
      };
    }
    
    // التحقق من أن Provider هو React Component
    const providerName = exports.find(e => e.includes('Provider'));
    const Provider = providerName ? module[providerName] : null;
    
    if (Provider && typeof Provider !== 'function') {
      return {
        id: generateId(),
        name: `${contextName} Provider`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'contexts',
        error: 'Provider ليس React Component'
      };
    }
    
    return {
      id: generateId(),
      name: `${contextName} Provider`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'contexts',
      details: `Provider: ${providerName}`
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `${contextName} Provider`,
      status: 'skipped',
      duration: performance.now() - startTime,
      category: 'contexts',
      error: 'لا يمكن استيراد السياق'
    };
  }
}

/**
 * اختبار وجود Hook في السياق
 */
async function testContextHook(contextName: string, contextPath: string, expectedExports: string[]): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const module = await import(/* @vite-ignore */ contextPath);
    const exports = Object.keys(module);
    
    // البحث عن Hook
    const hookExport = expectedExports.find(e => e.startsWith('use'));
    const hasHook = hookExport ? exports.includes(hookExport) : exports.some(e => e.startsWith('use'));
    
    if (!hasHook) {
      return {
        id: generateId(),
        name: `${contextName} Hook`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'contexts',
        error: 'لا يوجد Hook مُصدَّر',
        recommendation: `أضف تصدير Hook من ${contextPath}`
      };
    }
    
    // التحقق من أن Hook هو دالة
    const hookName = exports.find(e => e.startsWith('use'));
    const hook = hookName ? module[hookName] : null;
    
    if (hook && typeof hook !== 'function') {
      return {
        id: generateId(),
        name: `${contextName} Hook`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'contexts',
        error: 'Hook ليس دالة'
      };
    }
    
    return {
      id: generateId(),
      name: `${contextName} Hook`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'contexts',
      details: `Hook: ${hookName}`
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `${contextName} Hook`,
      status: 'skipped',
      duration: performance.now() - startTime,
      category: 'contexts',
      error: 'لا يمكن استيراد السياق'
    };
  }
}

/**
 * اختبار تصديرات السياق المتوقعة
 */
async function testContextExports(contextName: string, contextPath: string, expectedExports: string[]): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  try {
    const module = await import(/* @vite-ignore */ contextPath);
    const actualExports = Object.keys(module);
    
    for (const expected of expectedExports) {
      const startTime = performance.now();
      const exists = actualExports.includes(expected);
      
      results.push({
        id: generateId(),
        name: `${contextName} - تصدير ${expected}`,
        status: exists ? 'passed' : 'failed',
        duration: performance.now() - startTime,
        category: 'contexts',
        details: exists ? 'موجود' : undefined,
        error: exists ? undefined : `${expected} غير مُصدَّر`
      });
    }
    
  } catch {
    results.push({
      id: generateId(),
      name: `${contextName} - فحص التصديرات`,
      status: 'skipped',
      duration: 0,
      category: 'contexts',
      error: 'لا يمكن استيراد السياق'
    });
  }
  
  return results;
}

/**
 * اختبار فهرس السياقات الرئيسي
 */
async function testContextsIndex(): Promise<TestResult> {
  const startTime = performance.now();
  
  // لا يوجد ملف index للسياقات
  return {
    id: generateId(),
    name: 'فهرس السياقات',
    status: 'skipped',
    duration: performance.now() - startTime,
    category: 'contexts',
    details: 'لا يوجد ملف src/contexts/index.ts (طبيعي)'
  };
}

/**
 * تشغيل جميع اختبارات السياقات الحقيقية
 */
export async function runContextsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🎯 بدء اختبارات السياقات الحقيقية...');
  
  // 1. اختبار فهرس السياقات
  const indexResult = await testContextsIndex();
  results.push(indexResult);
  
  // 2. اختبار كل سياق
  for (const context of CONTEXTS_TO_TEST) {
    // اختبار الاستيراد
    const importResult = await testContextImport(context.name, context.path);
    results.push(importResult);
    
    if (importResult.status === 'passed') {
      // اختبار Provider
      const providerResult = await testContextProvider(context.name, context.path, context.exports);
      results.push(providerResult);
      
      // اختبار Hook
      const hookResult = await testContextHook(context.name, context.path, context.exports);
      results.push(hookResult);
      
      // اختبار التصديرات المتوقعة
      const exportsResults = await testContextExports(context.name, context.path, context.exports);
      results.push(...exportsResults);
    }
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ اكتمل اختبار السياقات: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل، ${skipped} متجاوز)`);
  
  return results;
}
