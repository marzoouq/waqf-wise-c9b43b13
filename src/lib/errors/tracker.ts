/**
 * نظام تتبع الأخطاء مع Queue و Circuit Breaker
 * ملف مُقسّم ومُحسّن
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { safeJsonParse } from '@/lib/utils/safeJson';
import { ErrorReport } from './types';
import { 
  DEFAULT_CONFIG, 
  DB_SETTING_KEYS, 
  type TrackerConfig,
  type DBSettingKey 
} from './tracker-config';
import { 
  shouldIgnoreError, 
  cleanUrl, 
  cleanErrorMessage,
  sanitizeAdditionalData,
  createErrorKey,
  isAuthRelatedUrl 
} from './tracker-utils';
import type { 
  DeduplicationEntry, 
  DeduplicationStats, 
  TrackerStats 
} from './tracker-types';

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: ErrorReport[] = [];
  private isProcessing = false;
  private failedAttempts = 0;
  private config: TrackerConfig = { ...DEFAULT_CONFIG };
  private circuitBreakerOpen = false;
  private circuitBreakerResetTime: number | null = null;
  private recentErrors = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  private consecutiveErrors = 0;
  private errorDeduplication = new Map<string, DeduplicationEntry>();

  private constructor() {
    this.loadSettingsFromDB();
    this.setupGlobalHandlers();
    this.cleanupOldAuthErrors();
    this.loadPendingErrors();
    this.setupCircuitBreakerCheck();
  }

  private async loadSettingsFromDB(): Promise<void> {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [...DB_SETTING_KEYS]);

      if (settings && settings.length > 0) {
        settings.forEach(setting => {
          const value = Number(setting.setting_value);
          const key = setting.setting_key as DBSettingKey;
          
          switch (key) {
            case 'error_tracker_dedup_window_minutes':
              this.config.deduplicationWindow = value * 60 * 1000;
              break;
            case 'error_tracker_max_same_error':
              this.config.maxSameErrorCount = value;
              break;
            case 'error_tracker_max_consecutive_errors':
              this.config.maxConsecutiveErrors = value;
              break;
            case 'error_tracker_auto_resolve_hours':
              this.config.autoResolveThreshold = value * 60 * 60 * 1000;
              break;
            case 'error_tracker_circuit_breaker_timeout':
              this.config.circuitBreakerTimeout = value * 1000;
              break;
          }
        });

        productionLogger.info('Loaded Error Tracker settings from DB', {
          dedupWindow: `${this.config.deduplicationWindow / 60000}min`,
          maxSameError: this.config.maxSameErrorCount,
          maxConsecutive: this.config.maxConsecutiveErrors,
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

  private cleanupOldAuthErrors(): void {
    try {
      const pending = localStorage.getItem(this.config.localStorageKey);
      if (!pending) return;

      const errors = safeJsonParse<ErrorReport[]>(pending, [], this.config.localStorageKey);
      if (errors.length === 0) return;
      const cleanedErrors = errors.filter(error => {
        if (error.additional_data?.request_url) {
          const url = String(error.additional_data.request_url);
          if (url.includes('/auth/v1/')) return false;
        }
        if (error.error_message === 'Failed to fetch') return false;
        return true;
      });
      
      if (cleanedErrors.length !== errors.length) {
        if (cleanedErrors.length > 0) {
          localStorage.setItem(this.config.localStorageKey, JSON.stringify(cleanedErrors));
        } else {
          localStorage.removeItem(this.config.localStorageKey);
        }
        productionLogger.info(`Cleaned ${errors.length - cleanedErrors.length} old auth errors`);
      }
    } catch (error) {
      productionLogger.error('Failed to cleanup old errors', error);
    }
  }

  private loadPendingErrors(): void {
    try {
      const pending = localStorage.getItem(this.config.localStorageKey);
      if (!pending) return;

      const errors = safeJsonParse<ErrorReport[]>(pending, [], this.config.localStorageKey);
      if (errors.length === 0) return;
      const filteredErrors = errors.filter(error => {
        if (error.additional_data?.request_url) {
          const url = String(error.additional_data.request_url);
          if (url.includes('/auth/v1/')) return false;
        }
        if (error.error_message === 'Failed to fetch') return false;
        return true;
      });
      
      if (filteredErrors.length > 0) {
        this.errorQueue.push(...filteredErrors);
        productionLogger.info(`Loaded ${filteredErrors.length} pending errors`);
      } else {
        localStorage.removeItem(this.config.localStorageKey);
      }
    } catch (error) {
      productionLogger.error('Failed to load pending errors', error);
    }
  }

  private savePendingErrors(): void {
    try {
      if (this.errorQueue.length > 0) {
        localStorage.setItem(this.config.localStorageKey, JSON.stringify(this.errorQueue));
      } else {
        localStorage.removeItem(this.config.localStorageKey);
      }
    } catch (error) {
      productionLogger.error('Failed to save pending errors', error);
    }
  }

  private setupCircuitBreakerCheck(): void {
    const checkCircuitBreaker = (): void => {
      if (this.circuitBreakerOpen && this.circuitBreakerResetTime) {
        if (Date.now() >= this.circuitBreakerResetTime) {
          productionLogger.info('Circuit breaker reset');
          this.circuitBreakerOpen = false;
          this.failedAttempts = 0;
          this.config.backoffDelay = DEFAULT_CONFIG.backoffDelay;
          this.processQueue();
        }
      }
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setTimeout(checkCircuitBreaker, 30000));
      } else {
        setTimeout(checkCircuitBreaker, 30000);
      }
    };
    
    checkCircuitBreaker();
  }

  private setupGlobalHandlers(): void {
    // التقاط الأخطاء غير المعالجة
    window.addEventListener('error', (event) => {
      const additionalData: Record<string, unknown> = {};
      if (event.filename) additionalData.filename = event.filename;
      if (event.lineno) additionalData.lineno = event.lineno;
      if (event.colno) additionalData.colno = event.colno;
      
      if (shouldIgnoreError(event.message, additionalData)) return;
      
      this.trackError({
        error_type: 'uncaught_error',
        error_message: event.message || 'Unknown error',
        error_stack: event.error?.stack,
        severity: 'high',
        url: cleanUrl(window.location.href),
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
      
      if (shouldIgnoreError(message, additionalData)) return;

      this.trackError({
        error_type: 'unhandled_promise_rejection',
        error_message: message || 'Promise rejected',
        error_stack: event.reason?.stack,
        severity: 'high',
        url: cleanUrl(window.location.href),
        user_agent: navigator.userAgent,
      });
    });

    // مراقبة أخطاء الشبكة
    this.setupNetworkErrorTracking();
  }

  private setupNetworkErrorTracking(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const requestUrl = typeof args[0] === 'string' 
        ? args[0] 
        : (args[0] as Request)?.url || 'unknown';
      
      if (isAuthRelatedUrl(requestUrl)) {
        return originalFetch(...args);
      }
      
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 500) {
          this.handleServerError(response, requestUrl);
        }
        
        return response;
      } catch (error) {
        this.handleFetchError(error, requestUrl);
        throw error;
      }
    };
  }

  private handleServerError(response: Response, requestUrl: string): void {
    const errorKey = `${response.status}-${requestUrl}`;
    const lastError = this.recentErrors.get(errorKey);
    
    if (!lastError || Date.now() - lastError > 30 * 1000) {
      this.recentErrors.set(errorKey, Date.now());
      this.trackError({
        error_type: 'network_error',
        error_message: `HTTP ${response.status}: ${response.statusText}`,
        severity: 'medium',
        url: cleanUrl(window.location.href),
        user_agent: navigator.userAgent,
        additional_data: { request_url: requestUrl, status: response.status },
      });
    }
  }

  private handleFetchError(error: unknown, requestUrl: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const additionalData = { request_url: requestUrl, error: errorMessage };
    
    if (shouldIgnoreError(errorMessage, additionalData)) return;

    const errorKey = `fetch-error-${requestUrl}`;
    const lastError = this.recentErrors.get(errorKey);
    
    if (!lastError || Date.now() - lastError > 30 * 1000) {
      this.recentErrors.set(errorKey, Date.now());
      this.trackError({
        error_type: 'network_error',
        error_message: errorMessage,
        severity: 'medium',
        url: cleanUrl(window.location.href),
        user_agent: navigator.userAgent,
        additional_data: { request_url: requestUrl },
      });
    }
  }

  async trackError(report: ErrorReport): Promise<void> {
    // تنظيف رسالة الخطأ
    const cleanMessage = cleanErrorMessage(report.error_message);
    
    // تجاهل رسائل "[object Object]"
    if (cleanMessage === '[object Object]') return;
    
    report.error_message = cleanMessage;
    
    if (shouldIgnoreError(report.error_message, report.additional_data)) return;

    // Deduplication
    const errorKey = createErrorKey(report.error_type, report.error_message);
    const now = Date.now();
    const dedupEntry = this.errorDeduplication.get(errorKey);
    
    if (dedupEntry) {
      if (dedupEntry.resolved) return;
      
      if (now - dedupEntry.lastSeen < this.config.deduplicationWindow) {
        dedupEntry.count++;
        dedupEntry.lastSeen = now;
        
        if (dedupEntry.count >= this.config.maxSameErrorCount) {
          dedupEntry.resolved = true;
          this.autoResolveError(errorKey);
          productionLogger.info(`Auto-resolved repeated error: ${errorKey}`);
        }
        return;
      }
    }
    
    this.errorDeduplication.set(errorKey, { count: 1, lastSeen: now, resolved: false });
    
    if (this.consecutiveErrors >= this.config.maxConsecutiveErrors) {
      productionLogger.warn('Circuit breaker opened - too many consecutive errors');
      return;
    }

    const count = this.errorCounts.get(errorKey) || 0;
    if (count >= this.config.maxSameErrorCount) return;
    
    this.errorCounts.set(errorKey, count + 1);
    setTimeout(() => this.errorCounts.delete(errorKey), 60 * 1000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) report.user_id = session.user.id;
    } catch {
      // تجاهل - المستخدم ليس مسجل دخول
    }

    this.errorQueue.push(report);
    this.processQueue();

    productionLogger.error(`Error tracked: ${report.error_type}`, report, {
      severity: report.severity,
      context: 'error_tracker',
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0 || this.circuitBreakerOpen) {
      return;
    }

    this.isProcessing = true;
    const batchSize = Math.min(this.config.batchSize, this.errorQueue.length);
    
    for (let i = 0; i < batchSize; i++) {
      const report = this.errorQueue.shift();
      if (!report) break;
      
      const cleanMessage = cleanErrorMessage(report.error_message);
      if (cleanMessage === '[object Object]' || cleanMessage.includes('[object Object]')) {
        continue;
      }
      
      const cleanAdditionalData = sanitizeAdditionalData(report.additional_data);
      
      const cleanReport: ErrorReport = {
        error_type: report.error_type || 'unknown_error',
        error_message: (cleanMessage || 'No message').substring(0, 2000),
        severity: report.severity || 'medium',
        url: cleanUrl(report.url || window.location.href) || 'unknown',
        user_agent: ((report.user_agent || navigator.userAgent) || 'unknown').substring(0, 500),
      };
      
      if (report.error_stack) cleanReport.error_stack = report.error_stack.substring(0, 10000);
      if (report.user_id) cleanReport.user_id = report.user_id;
      if (cleanAdditionalData) cleanReport.additional_data = cleanAdditionalData;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          productionLogger.warn('No session available for error tracking');
          this.errorQueue.unshift(report);
          break;
        }

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.config.requestTimeout)
        );
        
        // إرسال object مباشرة - Supabase client يقوم بالـ serialization تلقائياً
        const invokePromise = supabase.functions.invoke('log-error', {
          body: cleanReport,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await Promise.race([invokePromise, timeoutPromise]);
        
        if (result.error) throw result.error;
        
        this.failedAttempts = 0;
        this.consecutiveErrors = 0;
        this.config.backoffDelay = DEFAULT_CONFIG.backoffDelay;
        
        if (report.severity === 'critical' || report.severity === 'high') {
          await this.createSystemAlert(report);
        }
        
      } catch (error) {
        productionLogger.warn('Failed to send error report (will retry)', error);
        
        this.failedAttempts++;
        this.consecutiveErrors++;
        this.errorQueue.unshift(report);
        
        if (this.failedAttempts >= this.config.maxFailedAttempts) {
          this.circuitBreakerOpen = true;
          this.circuitBreakerResetTime = Date.now() + this.config.circuitBreakerTimeout;
          productionLogger.warn(`Circuit breaker opened. Queue: ${this.errorQueue.length}`);
          this.savePendingErrors();
        } else {
          this.config.backoffDelay = Math.min(this.config.backoffDelay * 2, 30000);
          setTimeout(() => this.processQueue(), this.config.backoffDelay);
        }
        
        break;
      }
    }
    
    this.savePendingErrors();
    this.isProcessing = false;
  }

  private async createSystemAlert(report: ErrorReport): Promise<void> {
    try {
      // التحقق من وجود جلسة مصادقة قبل إنشاء التنبيه
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        productionLogger.warn('Skipping system alert creation - no auth session');
        return;
      }

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

      if (error) productionLogger.error('Failed to create system alert', error);
    } catch (error) {
      productionLogger.error('Error creating system alert', error);
    }
  }

  private async autoResolveError(errorKey: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_error_logs')
        .update({ 
          status: 'auto_resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: 'system'
        })
        .eq('error_type', errorKey.split('-')[0])
        .eq('status', 'new');
      
      if (error) productionLogger.error('Failed to auto-resolve error', error);
    } catch (error) {
      productionLogger.error('Error auto-resolving', error);
    }
  }

  async logError(
    message: string,
    severity: ErrorReport['severity'] = 'medium',
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    await this.trackError({
      error_type: 'manual_log',
      error_message: message || 'Manual log entry',
      severity,
      url: cleanUrl(window.location.href),
      user_agent: navigator.userAgent,
      additional_data: additionalData && Object.keys(additionalData).length > 0 ? additionalData : undefined,
    });
  }

  getDeduplicationStats(): DeduplicationStats {
    const stats: DeduplicationStats = { total: this.errorDeduplication.size, resolved: 0, active: 0 };
    
    this.errorDeduplication.forEach(entry => {
      if (entry.resolved) stats.resolved++;
      else stats.active++;
    });
    
    return stats;
  }

  getStats(): TrackerStats {
    return {
      queueSize: this.errorQueue.length,
      isProcessing: this.isProcessing,
      circuitBreakerOpen: this.circuitBreakerOpen,
      failedAttempts: this.failedAttempts,
      consecutiveErrors: this.consecutiveErrors,
      deduplication: this.getDeduplicationStats(),
    };
  }

  clearQueue(): void {
    this.errorQueue = [];
    this.savePendingErrors();
  }

  resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false;
    this.failedAttempts = 0;
    this.consecutiveErrors = 0;
    this.config.backoffDelay = DEFAULT_CONFIG.backoffDelay;
    this.processQueue();
  }
}

// تصدير singleton
export const errorTracker = ErrorTracker.getInstance();

// تصدير للاستخدام المباشر
export const trackError = (report: ErrorReport) => errorTracker.trackError(report);
export const logError = (
  message: string, 
  severity?: ErrorReport['severity'], 
  data?: Record<string, unknown>
) => errorTracker.logError(message, severity, data);
