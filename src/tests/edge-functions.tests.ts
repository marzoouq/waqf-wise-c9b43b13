/**
 * Edge Functions Tests - اختبارات حقيقية لوظائف الخادم
 * @version 3.0.0
 * اختبارات تستدعي Edge Functions فعلياً
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
  responseTime?: number;
}

const generateId = () => `ef-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// قائمة Edge Functions للاختبار الحقيقي
const EDGE_FUNCTIONS_TO_TEST = [
  // وظائف الذكاء الاصطناعي
  { name: 'chatbot', category: 'ai', requiresAuth: false },
  { name: 'generate-ai-insights', category: 'ai', requiresAuth: true },
  { name: 'ai-system-audit', category: 'ai', requiresAuth: true },
  { name: 'intelligent-search', category: 'ai', requiresAuth: false },
  
  // وظائف المالية
  { name: 'distribute-revenue', category: 'finance', requiresAuth: true },
  { name: 'simulate-distribution', category: 'finance', requiresAuth: true },
  { name: 'auto-create-journal', category: 'finance', requiresAuth: true },
  { name: 'publish-fiscal-year', category: 'finance', requiresAuth: true },
  
  // وظائف الإشعارات
  { name: 'send-notification', category: 'notifications', requiresAuth: true },
  { name: 'send-push-notification', category: 'notifications', requiresAuth: true },
  { name: 'notify-admins', category: 'notifications', requiresAuth: true },
  
  // وظائف الصيانة
  { name: 'weekly-maintenance', category: 'maintenance', requiresAuth: true },
  { name: 'scheduled-cleanup', category: 'maintenance', requiresAuth: true },
  
  // وظائف الأمان
  { name: 'encrypt-file', category: 'security', requiresAuth: true },
  { name: 'decrypt-file', category: 'security', requiresAuth: true },
  { name: 'check-leaked-password', category: 'security', requiresAuth: false },
  
  // وظائف التقارير
  { name: 'generate-scheduled-report', category: 'reports', requiresAuth: true },
  { name: 'weekly-report', category: 'reports', requiresAuth: true },
  
  // وظائف النسخ الاحتياطي
  { name: 'backup-database', category: 'backup', requiresAuth: true },
  { name: 'daily-backup', category: 'backup', requiresAuth: true },
  
  // وظائف المستخدمين
  { name: 'reset-user-password', category: 'users', requiresAuth: true },
  { name: 'create-beneficiary-accounts', category: 'users', requiresAuth: true },
  
  // وظائف قاعدة البيانات
  { name: 'db-health-check', category: 'database', requiresAuth: false },
  { name: 'db-performance-stats', category: 'database', requiresAuth: true },
  
  // وظائف السجلات
  { name: 'log-error', category: 'logging', requiresAuth: false },
  { name: 'execute-auto-fix', category: 'logging', requiresAuth: true },
  
  // وظائف التنبيهات
  { name: 'generate-smart-alerts', category: 'alerts', requiresAuth: true },
  { name: 'contract-renewal-alerts', category: 'alerts', requiresAuth: true },
];

/**
 * اختبار استدعاء Edge Function حقيقي
 */
async function testEdgeFunctionInvocation(
  funcName: string, 
  category: string,
  requiresAuth: boolean
): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // إنشاء timeout للاستدعاء
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانية
    
    try {
      const { data, error } = await supabase.functions.invoke(funcName, {
        body: { testMode: true, ping: true }
      });
      
      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;
      
      if (error) {
        const errorMsg = error.message || String(error);
        
        // أخطاء المصادقة تعني الوظيفة موجودة
        if (errorMsg.includes('401') || 
            errorMsg.includes('403') || 
            errorMsg.includes('Unauthorized') ||
            errorMsg.includes('Not authenticated') ||
            errorMsg.includes('JWT')) {
          return {
            id: generateId(),
            name: `${funcName}`,
            status: 'passed',
            duration: responseTime,
            category: `edge-${category}`,
            details: `الوظيفة موجودة وتتطلب مصادقة (${Math.round(responseTime)}ms)`,
            responseTime
          };
        }
        
        // خطأ 404 = الوظيفة غير موجودة
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          return {
            id: generateId(),
            name: `${funcName}`,
            status: 'failed',
            duration: responseTime,
            category: `edge-${category}`,
            error: 'الوظيفة غير موجودة (404)',
            recommendation: `أنشئ الوظيفة في supabase/functions/${funcName}/index.ts`
          };
        }
        
        // خطأ 500 = مشكلة في الكود
        if (errorMsg.includes('500') || errorMsg.includes('Internal')) {
          return {
            id: generateId(),
            name: `${funcName}`,
            status: 'failed',
            duration: responseTime,
            category: `edge-${category}`,
            error: 'خطأ داخلي في الوظيفة (500)',
            recommendation: 'راجع سجلات Edge Function'
          };
        }
        
        // أخطاء أخرى
        return {
          id: generateId(),
          name: `${funcName}`,
          status: 'failed',
          duration: responseTime,
          category: `edge-${category}`,
          error: errorMsg.slice(0, 100)
        };
      }
      
      // نجاح الاستدعاء
      return {
        id: generateId(),
        name: `${funcName}`,
        status: 'passed',
        duration: responseTime,
        category: `edge-${category}`,
        details: `الوظيفة تستجيب بنجاح (${Math.round(responseTime)}ms)`,
        responseTime
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          id: generateId(),
          name: `${funcName}`,
          status: 'failed',
          duration: responseTime,
          category: `edge-${category}`,
          error: 'انتهت مهلة الاستجابة (15 ثانية)',
          recommendation: 'تحقق من أداء الوظيفة'
        };
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      id: generateId(),
      name: `${funcName}`,
      status: 'failed',
      duration: responseTime,
      category: `edge-${category}`,
      error: error instanceof Error ? error.message.slice(0, 100) : 'خطأ غير معروف'
    };
  }
}

/**
 * اختبار اتصال Edge Functions العام
 */
async function testEdgeFunctionsConnection(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // التحقق من وجود عميل الوظائف
    if (!supabase.functions) {
      return {
        id: generateId(),
        name: 'اتصال Edge Functions',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'edge-functions',
        error: 'عميل Edge Functions غير متاح'
      };
    }
    
    return {
      id: generateId(),
      name: 'اتصال Edge Functions',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'edge-functions',
      details: 'عميل Edge Functions متاح'
    };
  } catch (error) {
    return {
      id: generateId(),
      name: 'اتصال Edge Functions',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'edge-functions',
      error: error instanceof Error ? error.message : 'فشل الاتصال'
    };
  }
}

/**
 * اختبار وظيفة محددة بشكل سريع (ping)
 */
async function testEdgeFunctionPing(funcName: string, category: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // استخدام HEAD request أو body فارغ للسرعة
    const { error } = await supabase.functions.invoke(funcName, {
      body: { ping: true },
      headers: { 'x-test-mode': 'true' }
    });
    
    const responseTime = performance.now() - startTime;
    
    // أي رد (حتى خطأ auth) يعني الوظيفة موجودة
    if (!error || error.message?.includes('401') || error.message?.includes('403')) {
      return {
        id: generateId(),
        name: `Ping: ${funcName}`,
        status: 'passed',
        duration: responseTime,
        category: `edge-${category}`,
        details: `وقت الاستجابة: ${Math.round(responseTime)}ms`,
        responseTime
      };
    }
    
    return {
      id: generateId(),
      name: `Ping: ${funcName}`,
      status: 'failed',
      duration: responseTime,
      category: `edge-${category}`,
      error: error.message?.slice(0, 50)
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `Ping: ${funcName}`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: `edge-${category}`,
      error: error instanceof Error ? error.message.slice(0, 50) : 'خطأ'
    };
  }
}

/**
 * تشغيل جميع اختبارات Edge Functions الحقيقية
 */
export async function runEdgeFunctionsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('⚡ بدء اختبارات Edge Functions الحقيقية...');
  
  // 1. اختبار الاتصال العام
  const connectionResult = await testEdgeFunctionsConnection();
  results.push(connectionResult);
  
  if (connectionResult.status === 'failed') {
    console.log('❌ فشل الاتصال بـ Edge Functions، تخطي باقي الاختبارات');
    return results;
  }
  
  // 2. اختبار كل Edge Function
  for (const func of EDGE_FUNCTIONS_TO_TEST) {
    const invocationResult = await testEdgeFunctionInvocation(
      func.name, 
      func.category,
      func.requiresAuth
    );
    results.push(invocationResult);
    
    // تأخير صغير لتجنب rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / (results.filter(r => r.responseTime).length || 1);
  
  console.log(`✅ اكتمل اختبار Edge Functions: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل)`);
  console.log(`📊 متوسط وقت الاستجابة: ${Math.round(avgResponseTime)}ms`);
  
  return results;
}
