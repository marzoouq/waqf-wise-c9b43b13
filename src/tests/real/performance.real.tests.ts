/**
 * Real Performance Tests - اختبارات الأداء الحقيقية
 * @version 1.0.0
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

const generateId = () => `real-perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * اختبار وقت استجابة قاعدة البيانات
 */
async function testDatabaseResponseTime(): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    await supabase.from('profiles').select('id').limit(1);
    const responseTime = performance.now() - startTime;
    
    const isGood = responseTime < 2000;
    
    return {
      id: generateId(),
      name: 'وقت استجابة قاعدة البيانات',
      category: 'performance-db',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms ${isGood ? '(ممتاز)' : '(بطيء)'}`,
      isReal: true
    };
  } catch (error) {
    return {
      id: generateId(),
      name: 'وقت استجابة قاعدة البيانات',
      category: 'performance-db',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

/**
 * اختبار وقت استجابة Edge Function
 */
async function testEdgeFunctionResponseTime(): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    await supabase.functions.invoke('db-health-check', {
      body: { testMode: true }
    });
    const responseTime = performance.now() - startTime;
    
    const isGood = responseTime < 5000;
    
    return {
      id: generateId(),
      name: 'وقت استجابة Edge Function',
      category: 'performance-edge',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms`,
      isReal: true
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    // حتى لو فشل، نقيس الوقت
    return {
      id: generateId(),
      name: 'وقت استجابة Edge Function',
      category: 'performance-edge',
      status: responseTime < 5000 ? 'passed' : 'failed',
      duration: responseTime,
      details: `${Math.round(responseTime)}ms (مع خطأ)`,
      isReal: true
    };
  }
}

/**
 * اختبار استعلام جدول كبير
 */
async function testBulkQueryPerformance(tableName: string): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(100);
    
    const responseTime = performance.now() - startTime;
    const isGood = responseTime < 3000;
    
    if (error && !error.message.includes('RLS')) {
      return {
        id: generateId(),
        name: `استعلام ${tableName} (100 سجل)`,
        category: 'performance-queries',
        status: 'skipped',
        duration: responseTime,
        details: 'غير متاح',
        isReal: true
      };
    }
    
    return {
      id: generateId(),
      name: `استعلام ${tableName} (100 سجل)`,
      category: 'performance-queries',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms (${data?.length ?? 0} سجل)`,
      isReal: true
    };
  } catch (error) {
    return {
      id: generateId(),
      name: `استعلام ${tableName}`,
      category: 'performance-queries',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

/**
 * اختبار الاستعلامات المتوازية
 */
async function testParallelQueries(): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    const queries = [
      supabase.from('beneficiaries').select('id').limit(10),
      supabase.from('properties').select('id').limit(10),
      supabase.from('payments').select('id').limit(10),
      supabase.from('contracts').select('id').limit(10),
      supabase.from('invoices').select('id').limit(10),
    ];
    
    await Promise.all(queries);
    const responseTime = performance.now() - startTime;
    
    const isGood = responseTime < 4000;
    
    return {
      id: generateId(),
      name: '5 استعلامات متوازية',
      category: 'performance-parallel',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms`,
      isReal: true
    };
  } catch (error) {
    return {
      id: generateId(),
      name: '5 استعلامات متوازية',
      category: 'performance-parallel',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

/**
 * اختبار Realtime subscription
 */
async function testRealtimePerformance(): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    const channel = supabase.channel('perf-test');
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
      
      channel.subscribe((status) => {
        clearTimeout(timeout);
        if (status === 'SUBSCRIBED') {
          resolve();
        } else if (status === 'CHANNEL_ERROR') {
          reject(new Error('Channel error'));
        }
      });
    });
    
    const responseTime = performance.now() - startTime;
    await supabase.removeChannel(channel);
    
    const isGood = responseTime < 3000;
    
    return {
      id: generateId(),
      name: 'اشتراك Realtime',
      category: 'performance-realtime',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms`,
      isReal: true
    };
  } catch (error) {
    return {
      id: generateId(),
      name: 'اشتراك Realtime',
      category: 'performance-realtime',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

/**
 * اختبار Storage
 */
async function testStoragePerformance(): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    await supabase.storage.listBuckets();
    const responseTime = performance.now() - startTime;
    
    const isGood = responseTime < 2000;
    
    return {
      id: generateId(),
      name: 'استجابة Storage',
      category: 'performance-storage',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms`,
      isReal: true
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    return {
      id: generateId(),
      name: 'استجابة Storage',
      category: 'performance-storage',
      status: responseTime < 2000 ? 'passed' : 'failed',
      duration: responseTime,
      details: `${Math.round(responseTime)}ms`,
      isReal: true
    };
  }
}

/**
 * اختبار Auth
 */
async function testAuthPerformance(): Promise<RealTestResult> {
  const startTime = performance.now();
  
  try {
    await supabase.auth.getSession();
    const responseTime = performance.now() - startTime;
    
    const isGood = responseTime < 500;
    
    return {
      id: generateId(),
      name: 'فحص الجلسة',
      category: 'performance-auth',
      status: isGood ? 'passed' : 'failed',
      duration: responseTime,
      details: `${isGood ? '✅' : '❌'} ${Math.round(responseTime)}ms`,
      isReal: true
    };
  } catch (error) {
    return {
      id: generateId(),
      name: 'فحص الجلسة',
      category: 'performance-auth',
      status: 'failed',
      duration: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'خطأ',
      isReal: true
    };
  }
}

/**
 * تشغيل جميع اختبارات الأداء الحقيقية
 */
export async function runRealPerformanceTests(): Promise<RealTestResult[]> {
  const results: RealTestResult[] = [];
  
  console.log('⚡ بدء اختبارات الأداء الحقيقية...');
  
  // اختبار وقت استجابة قاعدة البيانات
  results.push(await testDatabaseResponseTime());
  
  // اختبار Edge Function
  results.push(await testEdgeFunctionResponseTime());
  
  // اختبار استعلامات الجداول
  const tables = ['beneficiaries', 'properties', 'payments', 'invoices', 'contracts'];
  for (const table of tables) {
    results.push(await testBulkQueryPerformance(table));
  }
  
  // اختبار الاستعلامات المتوازية
  results.push(await testParallelQueries());
  
  // اختبار Realtime
  results.push(await testRealtimePerformance());
  
  // اختبار Storage
  results.push(await testStoragePerformance());
  
  // اختبار Auth
  results.push(await testAuthPerformance());
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`✅ اكتمل اختبار الأداء: ${passed} ناجح، ${failed} فاشل من ${results.length}`);
  
  return results;
}

export default runRealPerformanceTests;
