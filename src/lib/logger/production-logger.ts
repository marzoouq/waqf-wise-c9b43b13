/**
 * نظام Logging احترافي للإنتاج
 * يدعم مستويات مختلفة من الـ logging مع إمكانية التكامل مع خدمات التتبع
 */

import { supabase } from '@/integrations/supabase/client';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface LogOptions {
  context?: string;
  metadata?: Record<string, unknown>;
  severity?: Severity;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

const MODE = (import.meta.env.MODE as string) || 'development';
const IS_DEV = MODE !== 'production';
const IS_PROD = MODE === 'production';

/**
 * تحويل مستوى الـ log إلى severity
 */
function mapLevelToSeverity(level: LogLevel): Severity {
  switch (level) {
    case 'error':
      return 'high';
    case 'warn':
      return 'medium';
    case 'info':
      return 'low';
    case 'debug':
      return 'low';
    default:
      return 'low';
  }
}

/**
 * تحويل مستوى الـ log إلى error_type
 */
function mapLevelToErrorType(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'debug';
    default:
      return 'unknown';
  }
}

class ProductionLogger {
  private queue: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor() {
    if (IS_PROD) {
      this.startFlushInterval();
    }
  }

  /**
   * تسجيل رسالة debug (للتطوير فقط - لا تُرسل للسيرفر أبداً)
   */
  debug(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.log(`🐛 ${message}`, data !== undefined ? data : '');
    }
    // Debug للتطوير فقط - لا ترسل للسيرفر
  }

  /**
   * تسجيل رسالة معلوماتية (لا تُرسل للسيرفر - معلومات فقط)
   */
  info(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.info(`ℹ️ ${message}`, data !== undefined ? data : '');
    }
    // لا ترسل info للسيرفر - معلومات فقط وليست أخطاء
  }

  /**
   * تسجيل تحذير (لا يُرسل للسيرفر إلا للتحذيرات الحرجة)
   */
  warn(message: string, data?: unknown, options?: LogOptions): void {
    if (IS_DEV) {
      console.warn(`⚠️ ${message}`, data !== undefined ? data : '');
    }
    // ✅ لا نضيف للـ queue - فقط إرسال مباشر للتحذيرات الحرجة
    if (IS_PROD && options?.severity === 'high') {
      this.sendToServer('warn', message, data, options);
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
      console.error(`❌ ${message}`, errorData !== undefined ? errorData : '');
    }

    this.addToQueue('error', message, errorData);

    if (IS_PROD) {
      this.sendToServer('error', message, errorData, options);
    }
  }

  /**
   * تسجيل نجاح عملية (للإحصائيات - لا تُرسل للسيرفر)
   */
  success(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.log(`✅ ${message}`, data !== undefined ? data : '');
    }
    // لا ترسل success للسيرفر - معلومات فقط
  }

  /**
   * إضافة log إلى الـ queue
   */
  private addToQueue(level: LogLevel, message: string, data?: unknown): void {
    if (IS_PROD) {
      // تجاهل الرسائل الفارغة
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return;
      }

      this.queue.push({
        level,
        message: message.trim(),
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
   * إرسال جميع الـ logs المتراكمة - بالتنسيق الصحيح
   */
  private async flush(): Promise<void> {
    // تعطيل في بيئة التطوير
    if (IS_DEV) {
      this.queue = [];
      return;
    }

    if (this.queue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      // ✅ فلترة: إرسال الأخطاء فقط (errors only)
      const errorsOnly = logsToSend.filter(log => log.level === 'error');
      
      // إرسال الـ logs بالتنسيق الصحيح
      for (const log of errorsOnly.slice(0, 10)) {
        // تجاهل logs بدون رسالة صالحة
        if (!log.message || typeof log.message !== 'string' || log.message.trim() === '') {
          continue;
        }

        try {
          const errorType = mapLevelToErrorType(log.level) || 'unknown';
          const errorMessage = log.message.trim() || 'No message';
          const severity = mapLevelToSeverity(log.level) || 'low';
          const url = (typeof window !== 'undefined' ? window.location.href : 'server') || 'unknown';
          const userAgent = (typeof navigator !== 'undefined' ? navigator.userAgent : 'server') || 'unknown';

          await supabase.functions.invoke('log-error', {
            body: {
              error_type: errorType,
              error_message: errorMessage,
              severity: severity,
              url: url,
              user_agent: userAgent,
              additional_data: {
                original_level: log.level,
                timestamp: log.timestamp,
                data: log.data,
              },
            },
          });
        } catch (logError) {
          // تسجيل فشل الإرسال في console فقط في DEV
          if (IS_DEV) {
            console.warn('Failed to send log to server:', logError);
          }
        }
      }
    } catch (error) {
      // في حالة فشل الإرسال الكامل، أعد الـ logs للـ queue
      this.queue.unshift(...logsToSend);
      if (IS_DEV) {
        console.warn('Failed to flush logs:', error);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * إرسال log فوري للسيرفر (للأخطاء الحرجة)
   */
  private async sendToServer(
    level: LogLevel,
    message: string,
    data?: unknown,
    options?: LogOptions
  ): Promise<void> {
    // تعطيل في بيئة التطوير
    if (IS_DEV) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      
      await supabase.functions.invoke('log-error', {
        body: {
          error_type: mapLevelToErrorType(level),
          error_message: message,
          severity: options?.severity || mapLevelToSeverity(level),
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          user_id: user?.id,
          additional_data: {
            context: options?.context,
            metadata: options?.metadata,
            data,
          },
        },
      });
    } catch (error) {
      // تسجيل فشل الإرسال - لكن لا نريد أن يؤثر على التطبيق
      if (IS_DEV) {
        console.warn('Failed to send error to server:', error);
      }
    }
  }

  /**
   * تنظيف الموارد عند إغلاق التطبيق
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
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
