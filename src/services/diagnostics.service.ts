/**
 * Diagnostics Service - خدمة تشخيص الاتصال
 * @version 1.0.0
 * @description
 * خدمة موحدة لاختبارات تشخيص الاتصال
 * تتبع نمط Component → Hook → Service → Supabase
 */

import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  status: 'success' | 'error' | 'warning';
  details: string;
  latency?: number;
}

export const DiagnosticsService = {
  /**
   * اختبار الاتصال بـ API
   */
  async testSupabaseAPI(): Promise<DiagnosticResult> {
    try {
      const start = Date.now();
      const { error } = await supabase.from('system_settings').select('id').limit(1);
      const latency = Date.now() - start;

      if (error) {
        return { status: 'error', details: error.message, latency };
      }

      if (latency > 3000) {
        return { status: 'warning', details: `استجابة بطيئة: ${latency}ms`, latency };
      }

      return { status: 'success', details: `الاتصال سريع: ${latency}ms`, latency };
    } catch (error) {
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'فشل الاتصال بالخادم'
      };
    }
  },

  /**
   * اختبار قاعدة البيانات
   */
  async testDatabase(): Promise<DiagnosticResult> {
    try {
      const start = Date.now();
      const { error } = await supabase
        .from('system_settings')
        .select('*', { count: 'exact', head: true });
      const latency = Date.now() - start;

      if (error) {
        return { status: 'error', details: error.message, latency };
      }

      return { status: 'success', details: `الاستعلام ناجح: ${latency}ms`, latency };
    } catch (error) {
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'فشل الاستعلام'
      };
    }
  },

  /**
   * اختبار خدمة المصادقة
   */
  async testAuth(): Promise<DiagnosticResult> {
    try {
      const start = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const latency = Date.now() - start;

      if (error) {
        return { status: 'error', details: error.message, latency };
      }

      return {
        status: 'success',
        details: data.session ? `جلسة نشطة: ${latency}ms` : `لا يوجد جلسة: ${latency}ms`,
        latency
      };
    } catch (error) {
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'فشل فحص المصادقة'
      };
    }
  },

  /**
   * اختبار الاتصال المباشر (Realtime)
   */
  async testRealtime(): Promise<DiagnosticResult> {
    return new Promise((resolve) => {
      const channel = supabase.channel('test-connection');
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve({ status: 'warning', details: 'انتهت مهلة الاتصال المباشر' });
      }, 5000);

      channel
        .on('system', { event: '*' }, () => {})
        .subscribe((status) => {
          clearTimeout(timeout);
          channel.unsubscribe();

          if (status === 'SUBSCRIBED') {
            resolve({ status: 'success', details: 'الاتصال المباشر يعمل' });
          } else if (status === 'CHANNEL_ERROR') {
            resolve({ status: 'error', details: 'فشل الاتصال المباشر' });
          } else {
            resolve({ status: 'warning', details: `حالة: ${status}` });
          }
        });
    });
  },

  /**
   * اختبار Edge Functions
   */
  async testEdgeFunctions(): Promise<DiagnosticResult> {
    try {
      const start = Date.now();
      const { error } = await supabase.functions.invoke('test-auth', {
        body: { test: true }
      });
      const latency = Date.now() - start;

      if (error) {
        return { status: 'warning', details: `تحذير: ${error.message}`, latency };
      }

      return { status: 'success', details: `الوظائف تعمل: ${latency}ms`, latency };
    } catch (error) {
      return {
        status: 'warning',
        details: error instanceof Error ? error.message : 'تعذر اختبار الوظائف'
      };
    }
  },

  /**
   * قياس زمن الاستجابة
   */
  async testLatency(): Promise<DiagnosticResult> {
    const times: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      try {
        await supabase.from('system_settings').select('id').limit(1);
        times.push(Date.now() - start);
      } catch {
        // تجاهل الأخطاء
      }
    }

    if (times.length === 0) {
      return { status: 'error', details: 'فشل قياس زمن الاستجابة' };
    }

    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

    if (avg > 3000) {
      return { status: 'error', details: `بطيء جداً: ${avg}ms`, latency: avg };
    } else if (avg > 1000) {
      return { status: 'warning', details: `بطيء: ${avg}ms`, latency: avg };
    }

    return { status: 'success', details: `ممتاز: ${avg}ms`, latency: avg };
  },

  /**
   * اختبار اتصال الشبكة
   */
  testNetworkConnection(): DiagnosticResult {
    if (!navigator.onLine) {
      return { status: 'error', details: 'الجهاز غير متصل بالإنترنت' };
    }

    const connection = (navigator as { connection?: { effectiveType?: string; downlink?: number } }).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return {
          status: 'warning',
          details: `اتصال بطيء: ${effectiveType} - ${connection.downlink} Mbps`
        };
      }
      return {
        status: 'success',
        details: `نوع الاتصال: ${effectiveType} - ${connection.downlink} Mbps`
      };
    }

    return { status: 'success', details: 'الاتصال متاح' };
  },

  /**
   * اختبار DNS
   */
  async testDNS(): Promise<DiagnosticResult> {
    try {
      const response = await fetch('https://dns.google/resolve?name=supabase.co', {
        method: 'GET',
      });
      if (response.ok) {
        return { status: 'success', details: 'تحليل DNS يعمل بشكل طبيعي' };
      }
      return { status: 'warning', details: 'استجابة غير متوقعة من خادم DNS' };
    } catch {
      return { status: 'warning', details: 'تعذر التحقق من DNS - قد يكون محظوراً' };
    }
  },
};
