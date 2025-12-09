/**
 * DiagnosticsService - خدمة التشخيص
 * تتعامل مع فحوصات قاعدة البيانات والنظام
 */

import { supabase } from '@/integrations/supabase/client';

export const DiagnosticsService = {
  /**
   * فحص اتصال قاعدة البيانات
   */
  async checkConnection() {
    const start = Date.now();
    const { error } = await supabase.from('activities').select('id').limit(1);
    return { 
      success: !error, 
      responseTime: Date.now() - start,
      error 
    };
  },

  /**
   * قياس زمن استجابة قاعدة البيانات
   */
  async measureLatency(iterations = 3) {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await supabase.from('activities').select('id').limit(1);
      times.push(Date.now() - start);
    }
    
    return {
      avgLatency: times.reduce((a, b) => a + b, 0) / times.length,
      maxLatency: Math.max(...times),
      times
    };
  },

  /**
   * الحصول على القنوات النشطة
   */
  getActiveChannels() {
    return supabase.getChannels().length;
  },

  /**
   * جلب الاستعلامات البطيئة
   */
  async getSlowQueries(thresholdMs = 2000, limit = 10) {
    const { data, error } = await supabase
      .from('system_health_checks')
      .select('id, check_type, response_time_ms')
      .gt('response_time_ms', thresholdMs)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * فحص جلسة المصادقة
   */
  async checkAuthSession() {
    const { data, error } = await supabase.auth.getSession();
    return { 
      hasSession: !!data.session, 
      error 
    };
  },

  /**
   * جلب سجلات الأخطاء الحديثة
   */
  async getRecentErrorLogs(limit = 20) {
    const { data, error } = await supabase
      .from('system_error_logs')
      .select('id, error_type, severity')
      .eq('severity', 'critical')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },
};
