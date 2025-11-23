/**
 * أنواع موحدة لنظام معالجة الأخطاء
 */

import { PostgrestError } from '@supabase/supabase-js';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: ErrorSeverity;
  url: string;
  user_agent: string;
  user_id?: string;
  additional_data?: Record<string, unknown>;
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: ErrorContext;
  stack?: string;
  userAgent?: string;
}

// Type Guards
export function isDatabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error &&
    'hint' in error
  );
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}
