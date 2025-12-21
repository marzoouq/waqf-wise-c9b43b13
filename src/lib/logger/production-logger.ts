/**
 * نظام Logging احترافي للإنتاج
 * يدعم مستويات مختلفة من الـ logging مع إمكانية التكامل مع خدمات التتبع
 * يدعم نمطين من الاستخدام للـ error
 */

import { supabase } from '@/integrations/supabase/client';
import type { ILogger, LogOptions, LogLevel, Severity, LogEntry } from './types';

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

/**
 * فحص إذا كان الـ object هو LogOptions
 */
function isLogOptions(obj: unknown): obj is LogOptions {
  if (!obj || typeof obj !== 'object') return false;
  const keys = Object.keys(obj);
  const validKeys = ['context', 'userId', 'severity', 'metadata'];
  return keys.some(key => validKeys.includes(key));
}

/**
 * استخراج رسالة من Error أو أي نوع آخر
 */
function extractMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'message' in value) {
    return String((value as { message: unknown }).message);
  }
  return String(value);
}

class ProductionLogger implements ILogger {
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
  }

  /**
   * تسجيل رسالة معلوماتية (لا تُرسل للسيرفر - معلومات فقط)
   */
  info(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.info(`ℹ️ ${message}`, data !== undefined ? data : '');
    }
  }

  /**
   * تسجيل تحذير (لا يُرسل للسيرفر إلا للتحذيرات الحرجة)
   */
  warn(message: string, data?: unknown, options?: LogOptions): void {
    if (IS_DEV) {
      console.warn(`⚠️ ${message}`, data !== undefined ? data : '');
    }
    if (IS_PROD && options?.severity === 'high') {
      this.sendToServer('warn', message, data, options);
    }
  }

  /**
   * تسجيل خطأ - يدعم نمطين:
   * - النمط الجديد: error('message', errorObject, options)
   * - النمط القديم: error(errorObject, options)
   */
  error(
    messageOrError: string | Error | unknown,
    errorOrOptions?: unknown | LogOptions,
    options?: LogOptions
  ): void {
    let message: string;
    let errorData: unknown;
    let finalOptions: LogOptions | undefined;

    // فحص النمط المستخدم
    if (typeof messageOrError === 'string') {
      // النمط الجديد: error('message', error, options)
      message = messageOrError;
      if (errorOrOptions instanceof Error) {
        errorData = { message: errorOrOptions.message, stack: errorOrOptions.stack, name: errorOrOptions.name };
      } else if (errorOrOptions && !isLogOptions(errorOrOptions)) {
        errorData = errorOrOptions;
      }
      finalOptions = options;
    } else {
      // النمط القديم: error(error, options)
      message = extractMessage(messageOrError);
      if (messageOrError instanceof Error) {
        errorData = { message: messageOrError.message, stack: messageOrError.stack, name: messageOrError.name };
      } else {
        errorData = messageOrError;
      }
      // المعامل الثاني هو options في النمط القديم
      finalOptions = isLogOptions(errorOrOptions) ? errorOrOptions : undefined;
    }

    if (IS_DEV) {
      console.error(`❌ ${message}`, errorData !== undefined ? errorData : '');
    }

    this.addToQueue('error', message, errorData);

    if (IS_PROD) {
      this.sendToServer('error', message, errorData, finalOptions);
    }
  }

  /**
   * تسجيل نجاح عملية (للإحصائيات - لا تُرسل للسيرفر)
   */
  success(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.log(`✅ ${message}`, data !== undefined ? data : '');
    }
  }

  /**
   * إضافة log إلى الـ queue
   */
  private addToQueue(level: LogLevel, message: string, data?: unknown): void {
    if (IS_PROD) {
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return;
      }

      this.queue.push({
        level,
        message: message.trim(),
        data,
        timestamp: new Date().toISOString(),
      });

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
    }, 30000);
  }

  /**
   * إرسال جميع الـ logs المتراكمة
   */
  flush(): void {
    if (IS_DEV) {
      this.queue = [];
      return;
    }

    if (this.queue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    this.processLogs(logsToSend).finally(() => {
      this.isProcessing = false;
    });
  }

  private async processLogs(logsToSend: LogEntry[]): Promise<void> {
    try {
      const errorsOnly = logsToSend.filter(log => log.level === 'error');
      
      for (const log of errorsOnly.slice(0, 10)) {
        if (!log.message || typeof log.message !== 'string' || log.message.trim() === '') {
          continue;
        }

        try {
          await supabase.functions.invoke('log-error', {
            body: {
              error_type: mapLevelToErrorType(log.level) || 'unknown',
              error_message: log.message.trim() || 'No message',
              severity: mapLevelToSeverity(log.level) || 'low',
              url: (typeof window !== 'undefined' ? window.location.href : 'server') || 'unknown',
              user_agent: (typeof navigator !== 'undefined' ? navigator.userAgent : 'server') || 'unknown',
              additional_data: {
                original_level: log.level,
                timestamp: log.timestamp,
                data: log.data,
              },
            },
          });
        } catch (logError) {
          if (IS_DEV) {
            console.warn('Failed to send log to server:', logError);
          }
        }
      }
    } catch (error) {
      this.queue.unshift(...logsToSend);
      if (IS_DEV) {
        console.warn('Failed to flush logs:', error);
      }
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

export const productionLogger = new ProductionLogger();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    productionLogger.cleanup();
  });
}
