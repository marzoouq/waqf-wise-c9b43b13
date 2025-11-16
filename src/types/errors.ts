/**
 * أنواع الأخطاء المحددة في التطبيق
 */

import { PostgrestError } from '@supabase/supabase-js';

// أنواع الأخطاء المحددة
export type DatabaseError = PostgrestError;

export interface ValidationError {
  field: string;
  message: string;
  code: 'VALIDATION_ERROR';
}

export interface NetworkError {
  message: string;
  code: 'NETWORK_ERROR';
  statusCode?: number;
}

export interface AuthenticationError {
  message: string;
  code: 'AUTH_ERROR';
  reason?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'SESSION_EXPIRED' | 'INVALID_CREDENTIALS';
}

export interface BusinessLogicError {
  message: string;
  code: 'BUSINESS_ERROR';
  details?: Record<string, unknown>;
}

// نوع موحد محسّن للأخطاء
export type AppError = 
  | Error 
  | DatabaseError 
  | ValidationError 
  | NetworkError 
  | AuthenticationError
  | BusinessLogicError;

/**
 * Type Guards للتحقق من نوع الخطأ
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error &&
    'hint' in error
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'code' in error &&
    (error as ValidationError).code === 'VALIDATION_ERROR'
  );
}

export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NetworkError).code === 'NETWORK_ERROR'
  );
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as AuthenticationError).code === 'AUTH_ERROR'
  );
}

export function isBusinessLogicError(error: unknown): error is BusinessLogicError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as BusinessLogicError).code === 'BUSINESS_ERROR'
  );
}

/**
 * دالة لاستخراج رسالة الخطأ بأمان
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isDatabaseError(error)) return error.message;
  if (isValidationError(error)) return error.message;
  if (isNetworkError(error)) return error.message;
  if (isAuthenticationError(error)) return error.message;
  if (isBusinessLogicError(error)) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'حدث خطأ غير متوقع';
}

/**
 * دالة للحصول على كود الخطأ بأمان
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isDatabaseError(error)) return error.code;
  if (isValidationError(error)) return error.code;
  if (isNetworkError(error)) return error.code;
  if (isAuthenticationError(error)) return error.code;
  if (isBusinessLogicError(error)) return error.code;
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

/**
 * نوع لمعالجات الأخطاء في mutations
 */
export interface ErrorHandler {
  (error: AppError): void;
}

/**
 * نوع لـ mutation options مع معالجة أخطاء محسنة
 */
export interface MutationErrorOptions {
  onError?: (error: AppError) => void;
}
