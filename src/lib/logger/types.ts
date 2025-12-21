/**
 * Logger Types - أنواع نظام الـ Logging
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
  error(message: string, error?: unknown, options?: LogOptions): void;
  success?(message: string, data?: unknown): void;
  flush?(): void;
  cleanup?(): void;
}
