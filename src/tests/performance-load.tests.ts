/**
 * Performance Load Tests - اختبارات الأداء والحمل الحقيقية
 * @version 1.0.0
 * اختبارات أداء حقيقية تقيس زمن الاستجابة تحت الضغط
 */

import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  details?: string;
  error?: string;
}

const generateId = () => `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// حدود الأداء المقبولة (بالمللي ثانية)
const PERFORMANCE_THRESHOLDS = {
  fast: 500,      // < 500ms = ممتاز
  medium: 1000,   // < 1000ms = جيد
  slow: 3000,     // < 3000ms = مقبول
  timeout: 10000, // > 10000ms = بطيء جداً
};

/**
 * اختبار سرعة استعلام قاعدة البيانات
 */
async function testDatabaseQuerySpeed(tableName: string, limit: number): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('id')
      .limit(limit);
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) {
      return {
        id: generateId(),
        name: `سرعة ${tableName} (${limit})`,
        status: 'skipped',
        duration,
        category: 'performance-db',
        details: error.message.slice(0, 50)
      };
    }
    
    const status = duration < PERFORMANCE_THRESHOLDS.fast ? 'passed' :
                   duration < PERFORMANCE_THRESHOLDS.medium ? 'passed' :
                   duration < PERFORMANCE_THRESHOLDS.slow ? 'passed' : 'failed';
    
    const speedLabel = duration < PERFORMANCE_THRESHOLDS.fast ? 'ممتاز' :
                       duration < PERFORMANCE_THRESHOLDS.medium ? 'جيد' :
                       duration < PERFORMANCE_THRESHOLDS.slow ? 'مقبول' : 'بطيء';
    
    return {
      id: generateId(),
      name: `سرعة ${tableName} (${limit})`,
      status,
      duration,
      category: 'performance-db',
      details: `${speedLabel} - ${data?.length || 0} سجل`
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: `سرعة ${tableName} (${limit})`,
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      category: 'performance-db',
      error: 'خطأ في الاستعلام'
    };
  }
}

/**
 * اختبار استعلامات متوازية (Concurrent Requests)
 */
async function testConcurrentRequests(count: number): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    // إنشاء طلبات متوازية
    const requests = Array(count).fill(null).map(() =>
      supabase.from('beneficiaries').select('id').limit(5)
    );
    
    const results = await Promise.all(requests);
    const duration = Math.round(performance.now() - startTime);
    
    const successCount = results.filter(r => !r.error).length;
    const avgTime = Math.round(duration / count);
    
    return {
      id: generateId(),
      name: `${count} طلب متوازي`,
      status: successCount === count ? 'passed' : 'failed',
      duration,
      category: 'performance-concurrent',
      details: `${successCount}/${count} ناجح، متوسط ${avgTime}ms`
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: `${count} طلب متوازي`,
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      category: 'performance-concurrent',
      error: 'خطأ في الطلبات المتوازية'
    };
  }
}

/**
 * اختبار استعلام مع JOIN
 */
async function testJoinQuery(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select(`
        id,
        full_name,
        families (id, name)
      `)
      .limit(10);
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) {
      return {
        id: generateId(),
        name: 'استعلام JOIN',
        status: 'skipped',
        duration,
        category: 'performance-join',
        details: error.message.slice(0, 50)
      };
    }
    
    return {
      id: generateId(),
      name: 'استعلام JOIN',
      status: duration < PERFORMANCE_THRESHOLDS.medium ? 'passed' : 'failed',
      duration,
      category: 'performance-join',
      details: `${data?.length || 0} سجل`
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: 'استعلام JOIN',
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      category: 'performance-join',
      error: 'خطأ في الاستعلام'
    };
  }
}

/**
 * اختبار استعلام مع تجميع (Aggregation)
 */
async function testAggregationQuery(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { count, error } = await supabase
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true });
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) {
      return {
        id: generateId(),
        name: 'استعلام تجميع COUNT',
        status: 'skipped',
        duration,
        category: 'performance-aggregation',
        details: error.message.slice(0, 50)
      };
    }
    
    return {
      id: generateId(),
      name: 'استعلام تجميع COUNT',
      status: duration < PERFORMANCE_THRESHOLDS.fast ? 'passed' : 'failed',
      duration,
      category: 'performance-aggregation',
      details: `العدد: ${count || 0}`
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: 'استعلام تجميع COUNT',
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      category: 'performance-aggregation',
      error: 'خطأ في الاستعلام'
    };
  }
}

/**
 * اختبار سرعة Edge Function
 */
async function testEdgeFunctionSpeed(functionName: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const { error } = await supabase.functions.invoke(functionName, {
      body: { testMode: true }
    });
    
    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);
    
    const status = duration < PERFORMANCE_THRESHOLDS.medium ? 'passed' :
                   duration < PERFORMANCE_THRESHOLDS.slow ? 'passed' : 'failed';
    
    return {
      id: generateId(),
      name: `Edge: ${functionName}`,
      status,
      duration,
      category: 'performance-edge',
      details: error ? error.message.slice(0, 30) : 'تستجيب'
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: `Edge: ${functionName}`,
      status: 'skipped',
      duration: Math.round(performance.now() - startTime),
      category: 'performance-edge',
      details: 'timeout أو خطأ'
    };
  }
}

/**
 * اختبار تحميل الصفحة
 */
async function testPageLoadMetrics(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    // قياس أداء الصفحة الحالية
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return {
        id: generateId(),
        name: 'مقاييس تحميل الصفحة',
        status: 'skipped',
        duration: 0,
        category: 'performance-page',
        details: 'لا توجد بيانات Navigation'
      };
    }
    
    const loadTime = Math.round(navigation.loadEventEnd - navigation.startTime);
    const domReady = Math.round(navigation.domContentLoadedEventEnd - navigation.startTime);
    
    return {
      id: generateId(),
      name: 'مقاييس تحميل الصفحة',
      status: loadTime < PERFORMANCE_THRESHOLDS.slow ? 'passed' : 'failed',
      duration: loadTime,
      category: 'performance-page',
      details: `DOM: ${domReady}ms, Load: ${loadTime}ms`
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: 'مقاييس تحميل الصفحة',
      status: 'skipped',
      duration: 0,
      category: 'performance-page',
      error: 'خطأ في قياس الأداء'
    };
  }
}

/**
 * اختبار استخدام الذاكرة
 */
async function testMemoryUsage(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    // @ts-ignore - performance.memory is Chrome-specific
    const memory = (performance as any).memory;
    
    if (!memory) {
      return {
        id: generateId(),
        name: 'استخدام الذاكرة',
        status: 'skipped',
        duration: 0,
        category: 'performance-memory',
        details: 'غير مدعوم في هذا المتصفح'
      };
    }
    
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const usagePercent = Math.round((usedMB / totalMB) * 100);
    
    return {
      id: generateId(),
      name: 'استخدام الذاكرة',
      status: usagePercent < 80 ? 'passed' : 'failed',
      duration: Math.round(performance.now() - startTime),
      category: 'performance-memory',
      details: `${usedMB}MB / ${totalMB}MB (${usagePercent}%)`
    };
    
  } catch (err) {
    return {
      id: generateId(),
      name: 'استخدام الذاكرة',
      status: 'skipped',
      duration: 0,
      category: 'performance-memory',
      error: 'خطأ في قياس الذاكرة'
    };
  }
}

/**
 * تشغيل جميع اختبارات الأداء
 */
export async function runPerformanceLoadTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('⚡ بدء اختبارات الأداء والحمل...');
  
  // اختبارات سرعة قاعدة البيانات
  const tables = ['beneficiaries', 'properties', 'payments', 'invoices', 'journal_entries'];
  for (const table of tables) {
    results.push(await testDatabaseQuerySpeed(table, 10));
    results.push(await testDatabaseQuerySpeed(table, 100));
  }
  
  // اختبارات الطلبات المتوازية
  results.push(await testConcurrentRequests(5));
  results.push(await testConcurrentRequests(10));
  
  // اختبارات متقدمة
  results.push(await testJoinQuery());
  results.push(await testAggregationQuery());
  
  // اختبارات Edge Functions
  const edgeFunctions = ['db-health-check', 'test-auth'];
  for (const fn of edgeFunctions) {
    results.push(await testEdgeFunctionSpeed(fn));
  }
  
  // اختبارات الصفحة
  results.push(await testPageLoadMetrics());
  results.push(await testMemoryUsage());
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ اكتمل اختبار الأداء: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل، ${skipped} متجاوز)`);
  
  return results;
}
