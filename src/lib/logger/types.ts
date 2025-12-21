/**
 * Logger Types - أنواع نظام الـ Logging
 * يدعم نمطين من الاستخدام:
 * - النمط الجديد: logger.error('message', error, options)
 * - النمط القديم: logger.error(error, options)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface LogOptions {
  context?: string;
  userId?: string;
  severity?: Severity;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

export interface ILogger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown, options?: LogOptions): void;
  // دعم نمطين: (message, error, options) أو (error, options)
  error(messageOrError: string | Error | unknown, errorOrOptions?: unknown | LogOptions, options?: LogOptions): void;
  success?(message: string, data?: unknown): void;
  flush?(): void;
  cleanup?(): void;
}
