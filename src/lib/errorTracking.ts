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
  private failedAttempts = 0;
  private maxFailedAttempts = 5;
  private backoffDelay = 1000; // البدء بثانية واحدة
  private readonly LOCAL_STORAGE_KEY = 'pending_error_reports';
  private circuitBreakerOpen = false;
  private circuitBreakerResetTime: number | null = null;

  private constructor() {
    this.setupGlobalHandlers();
    this.setupPerformanceMonitoring();
    this.loadPendingErrors();
    this.setupCircuitBreakerCheck();
  }
  
  private loadPendingErrors() {
    // تحميل الأخطاء المعلقة من localStorage
    try {
      const pending = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (pending) {
        const errors = JSON.parse(pending) as ErrorReport[];
        this.errorQueue.push(...errors);
        console.log(`📥 Loaded ${errors.length} pending errors from local storage`);
      }
    } catch (error) {
      console.error('Failed to load pending errors:', error);
    }
  }

  private savePendingErrors() {
    // حفظ الأخطاء المعلقة في localStorage كنسخة احتياطية
    try {
      if (this.errorQueue.length > 0) {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.errorQueue));
      } else {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save pending errors:', error);
    }
  }

  private setupCircuitBreakerCheck() {
    // فحص Circuit Breaker كل 30 ثانية
    setInterval(() => {
      if (this.circuitBreakerOpen && this.circuitBreakerResetTime) {
        if (Date.now() >= this.circuitBreakerResetTime) {
          console.log('🔄 Circuit breaker reset - attempting to reconnect');
          this.circuitBreakerOpen = false;
          this.failedAttempts = 0;
          this.backoffDelay = 1000;
          this.processQueue(); // محاولة معالجة القائمة
        }
      }
    }, 30000);
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

    // مراقبة أخطاء الشبكة - محسّنة لتقليل التسجيل المكرر
    const originalFetch = window.fetch;
    const recentErrors = new Map<string, number>(); // تتبع الأخطاء الأخيرة
    
    window.fetch = async (...args) => {
      const requestUrl = typeof args[0] === 'string' ? args[0] : args[0]?.toString() || 'unknown';
      
      // تجاهل طلبات log-error و analytics لتجنب الحلقة اللانهائية
      if (requestUrl.includes('log-error') || requestUrl.includes('analytics')) {
        return originalFetch(...args);
      }
      
      try {
        const response = await originalFetch(...args);
        
        // تسجيل الأخطاء من الاستجابات (فقط 5xx errors)
        if (!response.ok && response.status >= 500) {
          const errorKey = `${response.status}-${requestUrl}`;
          const lastError = recentErrors.get(errorKey);
          
          // تسجيل فقط إذا مر 5 دقائق على آخر خطأ مشابه
          if (!lastError || Date.now() - lastError > 5 * 60 * 1000) {
            recentErrors.set(errorKey, Date.now());
            this.trackError({
              error_type: 'network_error',
              error_message: `HTTP ${response.status}: ${response.statusText}`,
              severity: 'medium',
              url: window.location.href,
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
        const errorKey = `fetch-error-${requestUrl}`;
        const lastError = recentErrors.get(errorKey);
        
        // تسجيل فقط إذا مر 2 دقيقة على آخر خطأ مشابه (أخطاء fetch متكررة)
        if (!lastError || Date.now() - lastError > 2 * 60 * 1000) {
          recentErrors.set(errorKey, Date.now());
          this.trackError({
            error_type: 'network_error',
            error_message: error instanceof Error ? error.message : String(error),
            severity: 'medium', // تخفيض من high إلى medium
            url: window.location.href,
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

  private setupPerformanceMonitoring() {
    // ⚠️ Performance Monitoring معطل حالياً لتقليل الضوضاء
    // سيتم تفعيله فقط عند الحاجة للتشخيص
    console.log('📊 Performance monitoring is currently disabled to reduce noise');
    
    // يمكن إعادة تفعيله بتغيير false إلى true
    if (false) {
      try {
        // الكود الأصلي معطل
      } catch (error) {
        console.error('Failed to setup performance monitoring:', error);
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
    if (this.isProcessing || this.errorQueue.length === 0 || this.circuitBreakerOpen) {
      return;
    }

    this.isProcessing = true;

    while (this.errorQueue.length > 0) {
      const report = this.errorQueue.shift()!;
      
      try {
        // إضافة timeout للطلب
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const invokePromise = supabase.functions.invoke('log-error', {
          body: report,
        });
        
        const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;
        
        if (error) throw error;
        
        // نجحت العملية - إعادة تعيين العدادات
        this.failedAttempts = 0;
        this.backoffDelay = 1000;
        
        console.log('✅ Error reported successfully');
        
        // إنشاء تنبيه للمسؤولين عند الأخطاء الحرجة
        if (report.severity === 'critical' || report.severity === 'high') {
          await this.createSystemAlert(report);
        }
        
      } catch (error) {
        console.error('❌ Failed to send error report:', error);
        
        this.failedAttempts++;
        
        // إعادة الخطأ للقائمة
        this.errorQueue.unshift(report);
        
        // تطبيق استراتيجية Exponential Backoff
        if (this.failedAttempts >= this.maxFailedAttempts) {
          // فتح Circuit Breaker
          this.circuitBreakerOpen = true;
          this.circuitBreakerResetTime = Date.now() + 60000; // إعادة المحاولة بعد دقيقة
          console.warn(`🔴 Circuit breaker opened. Will retry after 1 minute. Queue size: ${this.errorQueue.length}`);
          
          // حفظ الأخطاء المعلقة في localStorage
          this.savePendingErrors();
        } else {
          // زيادة وقت الانتظار
          this.backoffDelay = Math.min(this.backoffDelay * 2, 30000); // أقصى 30 ثانية
          console.warn(`⏳ Backing off for ${this.backoffDelay}ms. Attempt ${this.failedAttempts}/${this.maxFailedAttempts}`);
          
          // إعادة المحاولة بعد التأخير
          setTimeout(() => this.processQueue(), this.backoffDelay);
        }
        
        break;
      }
    }
    
    // حفظ الحالة
    this.savePendingErrors();
    this.isProcessing = false;
  }

  /**
   * إنشاء تنبيه نظامي للمسؤولين
   */
  private async createSystemAlert(report: ErrorReport): Promise<void> {
    try {
      const { error } = await supabase.from('system_alerts').insert({
        alert_type: report.error_type,
        severity: report.severity,
        title: `خطأ ${report.severity === 'critical' ? 'حرج' : 'عالي'}: ${report.error_type}`,
        description: report.error_message,
        source: 'error_tracking',
        status: 'active',
        metadata: {
          url: report.url,
          user_agent: report.user_agent,
          user_id: report.user_id,
          stack: report.error_stack,
          additional_data: report.additional_data,
        },
      });

      if (error) {
        console.error('Failed to create system alert:', error);
      } else {
        console.log('✅ System alert created for admins');
      }
    } catch (error) {
      console.error('Error creating system alert:', error);
    }
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
