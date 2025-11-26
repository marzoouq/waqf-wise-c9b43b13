/**
 * نظام Logging احترافي للإنتاج
 * يدعم مستويات مختلفة من الـ logging مع إمكانية التكامل مع خدمات التتبع
 */

import { supabase } from '@/integrations/supabase/client';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;

class ProductionLogger {
  private queue: Array<{ level: LogLevel; message: string; data?: unknown; timestamp: string }> = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (IS_PROD) {
      this.startFlushInterval();
    }
  }

  /**
   * تسجيل رسالة debug (للتطوير فقط)
   */
  debug(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.log(`🐛 ${message}`, data);
    }
  }

  /**
   * تسجيل رسالة معلوماتية
   */
  info(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.info(`ℹ️ ${message}`, data);
    }
    this.addToQueue('info', message, data);
  }

  /**
   * تسجيل تحذير
   */
  warn(message: string, data?: unknown, options?: LogOptions): void {
    if (IS_DEV) {
      console.warn(`⚠️ ${message}`, data);
    }
    this.addToQueue('warn', message, data);
    
    if (IS_PROD && options?.severity === 'high') {
      this.sendToServer('warning', message, data, options);
    }
  }

  /**
   * تسجيل خطأ (يُرسل دائماً للسيرفر في الإنتاج)
   */
  error(message: string, error?: unknown, options?: LogOptions): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;

    if (IS_DEV) {
      console.error(`❌ ${message}`, errorData);
    }

    this.addToQueue('error', message, errorData);

    if (IS_PROD) {
      this.sendToServer('error', message, errorData, options);
    }
  }

  /**
   * تسجيل نجاح عملية (للإحصائيات)
   */
  success(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.log(`✅ ${message}`, data);
    }
    this.addToQueue('info', `SUCCESS: ${message}`, data);
  }

  /**
   * إضافة log إلى الـ queue
   */
  private addToQueue(level: LogLevel, message: string, data?: unknown): void {
    if (IS_PROD) {
      this.queue.push({
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
      });

      // إذا تجاوز الـ queue 50 رسالة، اطرد فوراً
      if (this.queue.length >= 50) {
        this.flush();
      }
    }
  }

  /**
   * بدء interval لإرسال الـ logs بشكل دوري
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // كل 30 ثانية
  }

  /**
   * إرسال جميع الـ logs المتراكمة
   */
  private async flush(): Promise<void> {
    // تعطيل في بيئة التطوير
    if (import.meta.env.DEV) {
      this.queue = [];
      return;
    }

    if (this.queue.length === 0) return;

    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      // إرسال الـ logs واحدة تلو الأخرى
      for (const log of logsToSend.slice(0, 10)) {
        await supabase.functions.invoke('log-error', {
          body: log,
        }).catch(() => {});
      }
    } catch (error) {
      // في حالة فشل الإرسال، أعد الـ logs للـ queue
      this.queue.unshift(...logsToSend);
    }
  }

  /**
   * إرسال log فوري للسيرفر (للأخطاء الحرجة)
   */
  private async sendToServer(
    level: string,
    message: string,
    data?: unknown,
    options?: LogOptions
  ): Promise<void> {
    // تعطيل في بيئة التطوير
    if (import.meta.env.DEV) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      await supabase.functions.invoke('log-error', {
        body: {
          error_type: level,
          error_message: message,
          severity: options?.severity || 'medium',
          url: window.location.href,
          user_agent: navigator.userAgent,
          user_id: user?.id,
          additional_data: {
            context: options?.context,
            metadata: options?.metadata,
            data,
          },
        },
      });
    } catch (error) {
      // Silent fail - لا نريد أن يؤثر فشل الـ logging على التطبيق
    }
  }

  /**
   * تنظيف الموارد عند إغلاق التطبيق
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
export const productionLogger = new ProductionLogger();

// تنظيف عند إغلاق الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    productionLogger.cleanup();
  });
}
