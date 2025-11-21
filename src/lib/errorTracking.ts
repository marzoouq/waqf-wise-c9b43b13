import { supabase } from '@/integrations/supabase/client';

export interface ErrorReport {
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  user_agent: string;
  user_id?: string;
  additional_data?: Record<string, any>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: ErrorReport[] = [];
  private isProcessing = false;

  private constructor() {
    this.setupGlobalHandlers();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private setupGlobalHandlers() {
    // التقاط الأخطاء غير المعالجة
    window.addEventListener('error', (event) => {
      this.trackError({
        error_type: 'uncaught_error',
        error_message: event.message,
        error_stack: event.error?.stack,
        severity: 'high',
        url: window.location.href,
        user_agent: navigator.userAgent,
        additional_data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // التقاط الوعود المرفوضة
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        error_type: 'unhandled_promise_rejection',
        error_message: event.reason?.message || String(event.reason),
        error_stack: event.reason?.stack,
        severity: 'high',
        url: window.location.href,
        user_agent: navigator.userAgent,
      });
    });

    // مراقبة أخطاء الشبكة
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // تسجيل الأخطاء من الاستجابات
        if (!response.ok && response.status >= 500) {
          this.trackError({
            error_type: 'network_error',
            error_message: `HTTP ${response.status}: ${response.statusText}`,
            severity: 'medium',
            url: window.location.href,
            user_agent: navigator.userAgent,
            additional_data: {
              request_url: args[0],
              status: response.status,
            },
          });
        }
        
        return response;
      } catch (error) {
        this.trackError({
          error_type: 'network_error',
          error_message: error instanceof Error ? error.message : String(error),
          severity: 'high',
          url: window.location.href,
          user_agent: navigator.userAgent,
          additional_data: {
            request_url: args[0],
          },
        });
        throw error;
      }
    };
  }

  private setupPerformanceMonitoring() {
    // مراقبة الأداء
    if ('PerformanceObserver' in window) {
      try {
        // مراقبة Long Tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              this.trackError({
                error_type: 'performance_issue',
                error_message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                severity: 'low',
                url: window.location.href,
                user_agent: navigator.userAgent,
                additional_data: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                },
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // مراقبة Layout Shifts
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any;
            if (layoutShift.value > 0.1) {
              this.trackError({
                error_type: 'layout_shift',
                error_message: `Cumulative Layout Shift: ${layoutShift.value.toFixed(3)}`,
                severity: 'low',
                url: window.location.href,
                user_agent: navigator.userAgent,
                additional_data: {
                  value: layoutShift.value,
                  hadRecentInput: layoutShift.hadRecentInput,
                },
              });
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring not fully supported', error);
      }
    }

    // فحص صحة النظام كل 5 دقائق
    setInterval(() => this.performHealthCheck(), 5 * 60 * 1000);
  }

  private async performHealthCheck() {
    try {
      // فحص الاتصال بقاعدة البيانات
      const { error } = await supabase.from('beneficiaries').select('id').limit(1);
      
      if (error) {
        this.trackError({
          error_type: 'health_check_failed',
          error_message: 'Database connection check failed',
          severity: 'critical',
          url: window.location.href,
          user_agent: navigator.userAgent,
          additional_data: { error: error.message },
        });
      }
    } catch (error) {
      this.trackError({
        error_type: 'health_check_error',
        error_message: error instanceof Error ? error.message : String(error),
        severity: 'critical',
        url: window.location.href,
        user_agent: navigator.userAgent,
      });
    }
  }

  async trackError(report: ErrorReport) {
    // إضافة معلومات المستخدم إذا كان متاحاً
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      report.user_id = user.id;
    }

    // إضافة إلى قائمة الانتظار
    this.errorQueue.push(report);

    // معالجة القائمة
    this.processQueue();

    // تسجيل في الـ console
    const emoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨',
    }[report.severity];

    console.error(`${emoji} Error tracked:`, report);
  }

  private async processQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;

    while (this.errorQueue.length > 0) {
      const report = this.errorQueue.shift()!;
      
      try {
        await supabase.functions.invoke('log-error', {
          body: report,
        });
      } catch (error) {
        console.error('Failed to send error report:', error);
        // إعادة المحاولة لاحقاً
        this.errorQueue.push(report);
        break;
      }
    }

    this.isProcessing = false;
  }

  // واجهة برمجية للتطبيق لتسجيل الأخطاء يدوياً
  async logError(
    message: string,
    severity: ErrorReport['severity'] = 'medium',
    additionalData?: Record<string, any>
  ) {
    await this.trackError({
      error_type: 'manual_log',
      error_message: message,
      severity,
      url: window.location.href,
      user_agent: navigator.userAgent,
      additional_data: additionalData,
    });
  }
}

export const errorTracker = ErrorTracker.getInstance();

// تصدير دالة مساعدة
export const logError = (
  message: string,
  severity: ErrorReport['severity'] = 'medium',
  additionalData?: Record<string, any>
) => errorTracker.logError(message, severity, additionalData);
