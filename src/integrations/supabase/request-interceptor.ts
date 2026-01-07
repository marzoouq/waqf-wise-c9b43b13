/**
 * Supabase Request Interceptor
 * اعتراض طلبات Supabase لمراقبة الاتصال
 */

import { supabase } from '@/integrations/supabase/client';
import { connectionMonitor } from '@/services/monitoring/connection-monitor.service';

let isInitialized = false;
let testingMode = false;

/**
 * تفعيل/تعطيل وضع الاختبار
 */
export function setInterceptorTestingMode(enabled: boolean): void {
  testingMode = enabled;
  console.log(`[RequestInterceptor] Testing mode: ${enabled ? 'enabled' : 'disabled'}`);
}

export function isInterceptorInTestingMode(): boolean {
  return testingMode;
}

export function initializeSupabaseInterceptor(): void {
  if (isInitialized) return;
  isInitialized = true;

  // مراقبة أخطاء المصادقة
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      connectionMonitor.logEvent({
        type: 'api',
        status: 'error',
        message: 'تم تسجيل الخروج',
        details: 'انتهت صلاحية الجلسة أو تم تسجيل الخروج',
      });
    }
    
    if (event === 'TOKEN_REFRESHED') {
      connectionMonitor.logEvent({
        type: 'api',
        status: 'reconnected',
        message: 'تم تجديد الجلسة بنجاح',
      });
    }
  });

  // اعتراض fetch الأصلي
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const startTime = Date.now();

    try {
      const response = await originalFetch.apply(this, args);
      const duration = Date.now() - startTime;

      // تسجيل الطلبات البطيئة (تعطيل في وضع الاختبار)
      if (!testingMode && duration > 5000 && url.includes('supabase')) {
        connectionMonitor.logEvent({
          type: 'api',
          status: 'slow',
          message: 'استجابة بطيئة من الخادم',
          details: `المسار: ${new URL(url).pathname}`,
          duration,
          url,
        });
      }

      // تسجيل الأخطاء (تقليل في وضع الاختبار)
      if (!response.ok && url.includes('supabase')) {
        // في وضع الاختبار، تجاهل أخطاء 429 و 500+
        if (!testingMode || (response.status !== 429 && response.status < 500)) {
          connectionMonitor.logApiError(url, response.status, response.statusText);
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // في وضع الاختبار، تقليل تسجيل الأخطاء
      if (url.includes('supabase') && !testingMode) {
        // تحديد نوع الخطأ
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          connectionMonitor.logEvent({
            type: 'network',
            status: 'disconnected',
            message: 'فشل الاتصال بالخادم',
            details: 'تعذر الوصول للخادم - تحقق من اتصال الإنترنت',
            url,
          });
        } else if (duration > 30000) {
          connectionMonitor.logTimeout(url, duration);
        } else {
          connectionMonitor.logEvent({
            type: 'api',
            status: 'error',
            message: 'خطأ في الطلب',
            details: error instanceof Error ? error.message : 'خطأ غير معروف',
            url,
          });
        }
      }
      
      throw error;
    }
  };

  console.log('[ConnectionMonitor] Supabase interceptor initialized');
}

// تصدير دالة لتسجيل أخطاء Edge Functions
export function logEdgeFunctionError(functionName: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  connectionMonitor.logEdgeFunctionError(functionName, message);
}

// تصدير دالة لتسجيل أخطاء قاعدة البيانات
export function logDatabaseError(operation: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  connectionMonitor.logDatabaseError(operation, message);
}
