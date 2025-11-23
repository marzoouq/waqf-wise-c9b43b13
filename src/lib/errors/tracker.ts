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
];

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: ErrorReport[] = [];
  private isProcessing = false;
  private failedAttempts = 0;
  private maxFailedAttempts = 5;
  private backoffDelay = 1000;
  private readonly LOCAL_STORAGE_KEY = 'pending_error_reports';
  private circuitBreakerOpen = false;
  private circuitBreakerResetTime: number | null = null;
  private recentErrors = new Map<string, number>();

  private constructor() {
    this.setupGlobalHandlers();
    this.loadPendingErrors();
    this.setupCircuitBreakerCheck();
    this.setupHealthCheck();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private shouldIgnoreError(message: string): boolean {
    return IGNORE_ERROR_PATTERNS.some(pattern => pattern.test(message));
  }

  private loadPendingErrors() {
    try {
      const pending = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (pending) {
        const errors = JSON.parse(pending) as ErrorReport[];
        this.errorQueue.push(...errors);
        productionLogger.info(`Loaded ${errors.length} pending errors from storage`);
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
    setInterval(() => {
      if (this.circuitBreakerOpen && this.circuitBreakerResetTime) {
        if (Date.now() >= this.circuitBreakerResetTime) {
          productionLogger.info('Circuit breaker reset');
          this.circuitBreakerOpen = false;
          this.failedAttempts = 0;
          this.backoffDelay = 1000;
          this.processQueue();
        }
      }
    }, 30000);
  }

  private setupGlobalHandlers() {
    // التقاط الأخطاء غير المعالجة
    window.addEventListener('error', (event) => {
      if (this.shouldIgnoreError(event.message)) return;
      
      const additionalData: Record<string, unknown> = {};
      if (event.filename) additionalData.filename = event.filename;
      if (event.lineno) additionalData.lineno = event.lineno;
      if (event.colno) additionalData.colno = event.colno;
      
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
      if (this.shouldIgnoreError(message)) return;

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
      
      // تجاهل طلبات log-error لتجنب الحلقة اللانهائية
      if (requestUrl.includes('log-error') || requestUrl.includes('analytics')) {
        return originalFetch(...args);
      }
      
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 500) {
          const errorKey = `${response.status}-${requestUrl}`;
          const lastError = this.recentErrors.get(errorKey);
          
          // تسجيل فقط إذا مر 10 دقائق على آخر خطأ مشابه
          if (!lastError || Date.now() - lastError > 10 * 60 * 1000) {
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
        if (this.shouldIgnoreError(errorMessage)) {
          throw error;
        }

        const errorKey = `fetch-error-${requestUrl}`;
        const lastError = this.recentErrors.get(errorKey);
        
        // تسجيل فقط إذا مر 10 دقائق على آخر خطأ مشابه
        if (!lastError || Date.now() - lastError > 10 * 60 * 1000) {
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

  private setupHealthCheck() {
    setInterval(() => this.performHealthCheck(), 5 * 60 * 1000);
  }

  private async performHealthCheck() {
    try {
      const { error } = await supabase.from('beneficiaries').select('id').limit(1);
      
      if (error) {
        this.trackError({
          error_type: 'health_check_failed',
          error_message: error.message || 'Database connection check failed',
          severity: 'critical',
          url: this.cleanUrl(window.location.href),
          user_agent: navigator.userAgent,
          additional_data: { error: error.message },
        });
      } else {
        productionLogger.info('All systems healthy');
      }
    } catch (error) {
      this.trackError({
        error_type: 'health_check_error',
        error_message: error instanceof Error ? error.message : String(error) || 'Health check failed',
        severity: 'critical',
        url: this.cleanUrl(window.location.href),
        user_agent: navigator.userAgent,
      });
    }
  }

  async trackError(report: ErrorReport) {
    if (this.shouldIgnoreError(report.error_message)) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      report.user_id = user.id;
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

    while (this.errorQueue.length > 0) {
      const report = this.errorQueue.shift()!;
      
      // تنظيف البيانات قبل الإرسال
      const cleanReport: ErrorReport = {
        error_type: report.error_type || 'unknown_error',
        error_message: report.error_message || 'No error message',
        severity: report.severity,
        url: this.cleanUrl(report.url || window.location.href),
        user_agent: report.user_agent || navigator.userAgent,
      };
      
      // إضافة الحقول الاختيارية فقط إذا كانت موجودة
      if (report.error_stack) cleanReport.error_stack = report.error_stack;
      if (report.user_id) cleanReport.user_id = report.user_id;
      if (report.additional_data && Object.keys(report.additional_data).length > 0) {
        cleanReport.additional_data = report.additional_data;
      }
      
      try {
        // 🔒 الحصول على session للمصادقة
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.warn('No session available for error tracking');
          this.errorQueue.unshift(report);
          break;
        }

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        // ✅ إرسال البيانات النظيفة
        const invokePromise = supabase.functions.invoke('log-error', {
          body: cleanReport,
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        const result = await Promise.race([invokePromise, timeoutPromise]);
        
        if (result.error) throw result.error;
        
        this.failedAttempts = 0;
        this.backoffDelay = 1000;
        
        if (report.severity === 'critical' || report.severity === 'high') {
          await this.createSystemAlert(report);
        }
        
      } catch (error) {
        productionLogger.error('Failed to send error report', error);
        
        this.failedAttempts++;
        this.errorQueue.unshift(report);
        
        if (this.failedAttempts >= this.maxFailedAttempts) {
          this.circuitBreakerOpen = true;
          this.circuitBreakerResetTime = Date.now() + 60000;
          productionLogger.warn(`Circuit breaker opened. Queue: ${this.errorQueue.length}`, undefined, {
            severity: 'high',
          });
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
}

export const errorTracker = ErrorTracker.getInstance();
