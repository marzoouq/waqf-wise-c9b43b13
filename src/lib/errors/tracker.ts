/**
 * نظام تتبع الأخطاء مع Queue و Circuit Breaker
 */

import { supabase } from '@/integrations/supabase/client';
import { ErrorReport } from './types';
import { productionLogger } from '@/lib/logger/production-logger';

// أنماط الأخطاء التي يجب تجاهلها
const IGNORE_ERROR_PATTERNS = [
  /Failed to fetch.*log-error/i,
  /NetworkError.*execute-auto-fix/i,
  /ResizeObserver loop/i,
  /Auth session missing/i,
  /Failed to fetch/i,
  /getUser/i,
  /getSession/i,
  /Failed to send error report/i,
  /Edge Function returned a non-2xx status code/i,
  /429/i,
  /rate limit/i,
  /\[object Object\]/i,
  /The provided callback is no longer runnable/i,
  /Error tracked:/i,
  /HTTP 50[0-9]:/i,
  /violates row-level security/i,
  /violates foreign key constraint/i,
  /Invalid login credentials/i,
  /Database error saving new user/i,
  /manual_log/i,
];

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: ErrorReport[] = [];
  private isProcessing = false;
  private failedAttempts = 0;
  private maxFailedAttempts = 3; // تقليل من 5 إلى 3
  private backoffDelay = 2000; // زيادة من 1000 إلى 2000
  private readonly LOCAL_STORAGE_KEY = 'pending_error_reports';
  private circuitBreakerOpen = false;
  private circuitBreakerResetTime: number | null = null;
  private recentErrors = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  private consecutiveErrors = 0;
  private MAX_SAME_ERROR_COUNT = 20; // ✅ قابل للتخصيص من DB
  private MAX_CONSECUTIVE_ERRORS = 10; // ✅ قابل للتخصيص من DB
  private errorDeduplication = new Map<string, { count: number; lastSeen: number; resolved: boolean }>();
  private DEDUPLICATION_WINDOW = 15 * 60 * 1000; // ✅ قابل للتخصيص من DB
  private AUTO_RESOLVE_THRESHOLD = 24 * 60 * 60 * 1000; // ✅ قابل للتخصيص من DB
  private CIRCUIT_BREAKER_TIMEOUT = 60000; // ✅ قابل للتخصيص من DB

  private constructor() {
    this.loadSettingsFromDB(); // ✅ تحميل الإعدادات من DB
    this.setupGlobalHandlers();
    this.cleanupOldAuthErrors();
    this.loadPendingErrors();
    this.setupCircuitBreakerCheck();
  }

  /**
   * ✅ تحميل إعدادات Error Tracker من قاعدة البيانات
   */
  private async loadSettingsFromDB() {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'error_tracker_dedup_window_minutes',
          'error_tracker_max_same_error',
          'error_tracker_max_consecutive_errors',
          'error_tracker_auto_resolve_hours',
          'error_tracker_circuit_breaker_timeout'
        ]);

      if (settings && settings.length > 0) {
        settings.forEach(setting => {
          const value = Number(setting.setting_value);
          switch (setting.setting_key) {
            case 'error_tracker_dedup_window_minutes':
              this.DEDUPLICATION_WINDOW = value * 60 * 1000;
              break;
            case 'error_tracker_max_same_error':
              this.MAX_SAME_ERROR_COUNT = value;
              break;
            case 'error_tracker_max_consecutive_errors':
              this.MAX_CONSECUTIVE_ERRORS = value;
              break;
            case 'error_tracker_auto_resolve_hours':
              this.AUTO_RESOLVE_THRESHOLD = value * 60 * 60 * 1000;
              break;
            case 'error_tracker_circuit_breaker_timeout':
              this.CIRCUIT_BREAKER_TIMEOUT = value * 1000;
              break;
          }
        });

        productionLogger.info('Loaded Error Tracker settings from DB', {
          dedupWindow: `${this.DEDUPLICATION_WINDOW / 60000}min`,
          maxSameError: this.MAX_SAME_ERROR_COUNT,
          maxConsecutive: this.MAX_CONSECUTIVE_ERRORS,
          autoResolve: `${this.AUTO_RESOLVE_THRESHOLD / 3600000}h`,
          circuitTimeout: `${this.CIRCUIT_BREAKER_TIMEOUT / 1000}s`
        });
      }
    } catch (error) {
      productionLogger.warn('Failed to load settings from DB, using defaults', error);
    }
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private shouldIgnoreError(message: string, additionalData?: any): boolean {
    // فحص رسالة الخطأ الرئيسية
    if (IGNORE_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
      return true;
    }
    
    // فحص additional_data للتأكد من عدم تسجيل أخطاء auth
    if (additionalData?.request_url) {
      const url = additionalData.request_url.toString();
      if (url.includes('/auth/v1/user') || 
          url.includes('/auth/v1/session') ||
          url.includes('/auth/v1/token')) {
        return true;
      }
    }
    
    return false;
  }

  // ✅ مسح أخطاء auth القديمة من localStorage
  private cleanupOldAuthErrors() {
    try {
      const pending = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (pending) {
        const errors = JSON.parse(pending) as ErrorReport[];
        const cleanedErrors = errors.filter(error => {
          // إزالة جميع أخطاء auth
          if (error.additional_data?.request_url) {
            const url = error.additional_data.request_url.toString();
            if (url.includes('/auth/v1/')) {
              return false;
            }
          }
          // إزالة "Failed to fetch" العامة
          if (error.error_message === 'Failed to fetch') {
            return false;
          }
          return true;
        });
        
        if (cleanedErrors.length !== errors.length) {
          if (cleanedErrors.length > 0) {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(cleanedErrors));
          } else {
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
          }
          productionLogger.info(`Cleaned ${errors.length - cleanedErrors.length} old auth errors from storage`);
        }
      }
    } catch (error) {
      productionLogger.error('Failed to cleanup old errors', error);
    }
  }

  private loadPendingErrors() {
    try {
      const pending = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (pending) {
        const errors = JSON.parse(pending) as ErrorReport[];
        
        // ✅ تصفية الأخطاء: إزالة أخطاء auth القديمة
        const filteredErrors = errors.filter(error => {
          // تجاهل أخطاء auth/v1
          if (error.additional_data?.request_url) {
            const url = error.additional_data.request_url.toString();
            if (url.includes('/auth/v1/')) {
              return false; // تجاهل
            }
          }
          
          // تجاهل أخطاء "Failed to fetch"
          if (error.error_message === 'Failed to fetch') {
            return false;
          }
          
          return true; // احتفظ بالخطأ
        });
        
        if (filteredErrors.length > 0) {
          this.errorQueue.push(...filteredErrors);
          productionLogger.info(`Loaded ${filteredErrors.length} pending errors from storage (filtered ${errors.length - filteredErrors.length})`);
        } else {
          // مسح localStorage إذا كانت كل الأخطاء مُصفّاة
          localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      productionLogger.error('Failed to load pending errors', error);
    }
  }

  private savePendingErrors() {
    try {
      if (this.errorQueue.length > 0) {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.errorQueue));
      } else {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      productionLogger.error('Failed to save pending errors', error);
    }
  }

  private setupCircuitBreakerCheck() {
    // استخدام requestIdleCallback بدلاً من setInterval لتحسين الأداء
    const checkCircuitBreaker = () => {
      if (this.circuitBreakerOpen && this.circuitBreakerResetTime) {
        if (Date.now() >= this.circuitBreakerResetTime) {
          productionLogger.info('Circuit breaker reset');
          this.circuitBreakerOpen = false;
          this.failedAttempts = 0;
          this.backoffDelay = 2000;
          this.processQueue();
        }
      }
      
      // Schedule next check
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setTimeout(checkCircuitBreaker, 30000);
        });
      } else {
        setTimeout(checkCircuitBreaker, 30000);
      }
    };
    
    checkCircuitBreaker();
  }

  private setupGlobalHandlers() {
    // التقاط الأخطاء غير المعالجة
    window.addEventListener('error', (event) => {
      const additionalData: Record<string, unknown> = {};
      if (event.filename) additionalData.filename = event.filename;
      if (event.lineno) additionalData.lineno = event.lineno;
      if (event.colno) additionalData.colno = event.colno;
      
      // ✅ تمرير additional_data للفحص
      if (this.shouldIgnoreError(event.message, additionalData)) return;
      
      this.trackError({
        error_type: 'uncaught_error',
        error_message: event.message || 'Unknown error',
        error_stack: event.error?.stack || undefined,
        severity: 'high',
        url: this.cleanUrl(window.location.href),
        user_agent: navigator.userAgent,
        additional_data: Object.keys(additionalData).length > 0 ? additionalData : undefined,
      });
    });

    // التقاط الوعود المرفوضة
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || String(event.reason);
      const additionalData = {
        reason: event.reason,
        stack: event.reason?.stack,
      };
      
      // ✅ تمرير additional_data للفحص
      if (this.shouldIgnoreError(message, additionalData)) return;

      this.trackError({
        error_type: 'unhandled_promise_rejection',
        error_message: message || 'Promise rejected',
        error_stack: event.reason?.stack || undefined,
        severity: 'high',
        url: this.cleanUrl(window.location.href),
        user_agent: navigator.userAgent,
      });
    });

    // مراقبة أخطاء الشبكة
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.toString() || 'unknown';
      
      // تجاهل طلبات log-error و auth لتجنب الحلقة اللانهائية
      if (requestUrl.includes('log-error') || 
          requestUrl.includes('analytics') ||
          requestUrl.includes('auth/v1/user') ||
          requestUrl.includes('auth/v1/session')) {
        return originalFetch(...args);
      }
      
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 500) {
          const errorKey = `${response.status}-${requestUrl}`;
          const lastError = this.recentErrors.get(errorKey);
          
          // تسجيل فقط إذا مر 30 ثانية على آخر خطأ مشابه
          if (!lastError || Date.now() - lastError > 30 * 1000) {
            this.recentErrors.set(errorKey, Date.now());
            this.trackError({
              error_type: 'network_error',
              error_message: `HTTP ${response.status}: ${response.statusText}`,
              severity: 'medium',
              url: this.cleanUrl(window.location.href),
              user_agent: navigator.userAgent,
              additional_data: {
                request_url: requestUrl,
                status: response.status,
              },
            });
          }
        }
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const additionalData = {
          request_url: requestUrl,
          error: errorMessage,
        };
        
        // ✅ تمرير additional_data للفحص
        if (this.shouldIgnoreError(errorMessage, additionalData)) {
          throw error;
        }

        const errorKey = `fetch-error-${requestUrl}`;
        const lastError = this.recentErrors.get(errorKey);
        
        // تسجيل فقط إذا مر 30 ثانية على آخر خطأ مشابه
        if (!lastError || Date.now() - lastError > 30 * 1000) {
          this.recentErrors.set(errorKey, Date.now());
          this.trackError({
            error_type: 'network_error',
            error_message: errorMessage,
            severity: 'medium',
            url: this.cleanUrl(window.location.href),
            user_agent: navigator.userAgent,
            additional_data: {
              request_url: requestUrl,
            },
          });
        }
        throw error;
      }
    };
  }

  private cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove sensitive query parameters
      urlObj.searchParams.delete('__lovable_token');
      urlObj.searchParams.delete('token');
      urlObj.searchParams.delete('access_token');
      
      let cleanedUrl = urlObj.toString();
      // Truncate to 500 characters max
      if (cleanedUrl.length > 500) {
        cleanedUrl = cleanedUrl.substring(0, 497) + '...';
      }
      return cleanedUrl;
    } catch {
      // If URL parsing fails, just truncate the string
      return url.length > 500 ? url.substring(0, 497) + '...' : url;
    }
  }

  // ❌ حذف setupHealthCheck() و performHealthCheck() - يتم في selfHealing.ts فقط

  async trackError(report: ErrorReport) {
    // تنظيف رسالة الخطأ أولاً
    let cleanMessage = report.error_message;
    
    // إذا كانت رسالة الخطأ كائن، حولها إلى نص
    if (typeof cleanMessage === 'object' && cleanMessage !== null) {
      try {
        cleanMessage = JSON.stringify(cleanMessage);
      } catch {
        cleanMessage = String(cleanMessage);
      }
    }
    
    // تجاهل رسائل "[object Object]"
    if (cleanMessage === '[object Object]') {
      return;
    }
    
    report.error_message = cleanMessage;
    
    // ✅ فحص الخطأ مع additional_data
    if (this.shouldIgnoreError(report.error_message, report.additional_data)) {
      return;
    }

    // 🔧 Deduplication المحسّن
    const errorKey = `${report.error_type}-${report.error_message}`;
    const now = Date.now();
    const dedupEntry = this.errorDeduplication.get(errorKey);
    
    if (dedupEntry) {
      // إذا كان الخطأ محلول تلقائياً، لا نسجله مجدداً
      if (dedupEntry.resolved) {
        return;
      }
      
      // إذا كان في نفس النافذة الزمنية، زيادة العداد فقط
      if (now - dedupEntry.lastSeen < this.DEDUPLICATION_WINDOW) {
        dedupEntry.count++;
        dedupEntry.lastSeen = now;
        
        // إذا تجاوز الحد، نحله تلقائياً
        if (dedupEntry.count >= this.MAX_SAME_ERROR_COUNT) {
          dedupEntry.resolved = true;
          this.autoResolveError(errorKey);
          productionLogger.info(`Auto-resolved repeated error: ${errorKey}`, { count: dedupEntry.count });
        }
        return;
      }
    }
    
    // تسجيل جديد في Deduplication Map
    this.errorDeduplication.set(errorKey, {
      count: 1,
      lastSeen: now,
      resolved: false
    });
    
    // ✅ التحقق من Circuit Breaker
    if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
      console.warn('Circuit breaker opened - too many consecutive errors');
      return;
    }

    // ✅ التحقق من عدد الأخطاء المتطابقة (Fallback)
    const count = this.errorCounts.get(errorKey) || 0;
    
    if (count >= this.MAX_SAME_ERROR_COUNT) {
      return;
    }
    
    this.errorCounts.set(errorKey, count + 1);
    
    // ✅ إعادة تعيين العداد بعد دقيقة
    setTimeout(() => {
      this.errorCounts.delete(errorKey);
    }, 60 * 1000);

    // ✅ استخدام getSession بدلاً من getUser لتجنب HTTP request
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        report.user_id = session.user.id;
      }
    } catch (error) {
      // تجاهل الخطأ بصمت - المستخدم ليس مسجل دخول
    }

    this.errorQueue.push(report);
    this.processQueue();

    productionLogger.error(`Error tracked: ${report.error_type}`, report, {
      severity: report.severity,
      context: 'error_tracker',
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.errorQueue.length === 0 || this.circuitBreakerOpen) {
      return;
    }

    this.isProcessing = true;

    // معالجة باتش من 10 أخطاء فقط لتحسين الأداء
    const batchSize = Math.min(10, this.errorQueue.length);
    
    for (let i = 0; i < batchSize; i++) {
      const report = this.errorQueue.shift();
      if (!report) break;
      
      // تنظيف البيانات قبل الإرسال
      let cleanMessage = report.error_message || 'No error message';
      
      // تأكد من أن الرسالة نص وليست كائن
      if (typeof cleanMessage === 'object' && cleanMessage !== null) {
        try {
          cleanMessage = JSON.stringify(cleanMessage);
        } catch {
          cleanMessage = String(cleanMessage);
        }
      }
      
      // تجاهل رسائل [object Object]
      if (cleanMessage === '[object Object]' || cleanMessage.includes('[object Object]')) {
        continue;
      }
      
      // تنظيف additional_data للتأكد من قابليتها للتسلسل JSON
      let cleanAdditionalData: Record<string, unknown> | undefined;
      if (report.additional_data && Object.keys(report.additional_data).length > 0) {
        try {
          // تنظيف البيانات الإضافية من الكائنات غير القابلة للتسلسل
          const sanitized = JSON.parse(JSON.stringify(report.additional_data));
          cleanAdditionalData = sanitized;
        } catch {
          cleanAdditionalData = { raw: String(report.additional_data) };
        }
      }
      
      const cleanReport: ErrorReport = {
        error_type: report.error_type || 'unknown_error',
        error_message: cleanMessage.substring(0, 2000), // حد أقصى 2000 حرف
        severity: report.severity,
        url: this.cleanUrl(report.url || window.location.href),
        user_agent: (report.user_agent || navigator.userAgent).substring(0, 500),
      };
      
      // إضافة الحقول الاختيارية فقط إذا كانت موجودة
      if (report.error_stack) cleanReport.error_stack = report.error_stack.substring(0, 10000);
      if (report.user_id) cleanReport.user_id = report.user_id;
      if (cleanAdditionalData) cleanReport.additional_data = cleanAdditionalData;
      
      try {
        // 🔒 الحصول على session للمصادقة
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.warn('No session available for error tracking');
          this.errorQueue.unshift(report);
          break;
        }

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        );
        
        // ✅ تحويل البيانات إلى JSON string صريحة
        let bodyString: string;
        try {
          bodyString = JSON.stringify(cleanReport);
        } catch (jsonError) {
          console.warn('Failed to stringify error report, skipping', jsonError);
          continue;
        }
        
        // ✅ إرسال البيانات كـ JSON string
        const invokePromise = supabase.functions.invoke('log-error', {
          body: bodyString,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await Promise.race([invokePromise, timeoutPromise]);
        
        if (result.error) throw result.error;
        
        this.failedAttempts = 0;
        this.consecutiveErrors = 0; // ✅ إعادة تعيين عند النجاح
        this.backoffDelay = 1000;
        
        if (report.severity === 'critical' || report.severity === 'high') {
          await this.createSystemAlert(report);
        }
        
      } catch (error) {
        // ❌ لا نسجل فشل إرسال الأخطاء كخطأ جديد - هذا يسبب حلقة لا نهائية
        console.warn('Failed to send error report (will retry)', error);
        
        this.failedAttempts++;
        this.consecutiveErrors++;
        this.errorQueue.unshift(report);
        
        if (this.failedAttempts >= this.maxFailedAttempts) {
          this.circuitBreakerOpen = true;
          this.circuitBreakerResetTime = Date.now() + this.CIRCUIT_BREAKER_TIMEOUT; // ✅ استخدام الإعداد من DB
          console.warn(`⚠️ Circuit breaker opened. Queue: ${this.errorQueue.length}`);
          this.savePendingErrors();
        } else {
          this.backoffDelay = Math.min(this.backoffDelay * 2, 30000);
          setTimeout(() => this.processQueue(), this.backoffDelay);
        }
        
        break;
      }
    }
    
    this.savePendingErrors();
    this.isProcessing = false;
  }

  private async createSystemAlert(report: ErrorReport): Promise<void> {
    try {
      const { error } = await supabase.from('system_alerts').insert([{
        alert_type: report.error_type,
        severity: report.severity,
        title: `خطأ ${report.severity === 'critical' ? 'حرج' : 'عالي'}: ${report.error_type}`,
        description: report.error_message,
        status: 'active',
        metadata: JSON.parse(JSON.stringify({
          url: report.url,
          user_agent: report.user_agent,
          user_id: report.user_id,
          stack: report.error_stack,
          additional_data: report.additional_data,
        })),
      }]);

      if (error) {
        productionLogger.error('Failed to create system alert', error);
      }
    } catch (error) {
      productionLogger.error('Error creating system alert', error);
    }
  }

  private async autoResolveError(errorKey: string) {
    try {
      // حل الخطأ في قاعدة البيانات
      const { error } = await supabase
        .from('system_error_logs')
        .update({ 
          status: 'auto_resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: 'system'
        })
        .eq('error_type', errorKey.split('-')[0])
        .eq('status', 'new');
      
      if (error) {
        productionLogger.error('Failed to auto-resolve error', error);
      }
    } catch (error) {
      productionLogger.error('Error auto-resolving', error);
    }
  }

  async logError(
    message: string,
    severity: ErrorReport['severity'] = 'medium',
    additionalData?: Record<string, unknown>
  ) {
    await this.trackError({
      error_type: 'manual_log',
      error_message: message || 'Manual log entry',
      severity,
      url: this.cleanUrl(window.location.href),
      user_agent: navigator.userAgent,
      additional_data: additionalData && Object.keys(additionalData).length > 0 ? additionalData : undefined,
    });
  }

  // 🔧 API لإحصائيات Deduplication
  getDeduplicationStats() {
    const stats = {
      total: this.errorDeduplication.size,
      resolved: 0,
      active: 0,
    };
    
    this.errorDeduplication.forEach(entry => {
      if (entry.resolved) stats.resolved++;
      else stats.active++;
    });
    
    return stats;
  }
}

export const errorTracker = ErrorTracker.getInstance();
