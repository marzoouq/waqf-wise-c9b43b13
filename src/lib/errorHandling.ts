/**
 * Unified error handling utilities
 */

import { getErrorMessage } from '@/types/errors';
import { logger } from './logger';
import { toast } from '@/hooks/use-toast';

export interface ErrorHandlerOptions {
  context?: string;
  showToast?: boolean;
  toastTitle?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * معالجة خطأ موحدة
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  const {
    context = 'operation',
    showToast = true,
    toastTitle = 'خطأ',
    severity = 'medium'
  } = options;

  // استخراج رسالة الخطأ
  const message = getErrorMessage(error);
  
  // تسجيل الخطأ
  logger.error(error, { context, severity });
  
  // إظهار Toast إذا لزم الأمر
  if (showToast) {
    toast({
      title: toastTitle,
      description: message,
      variant: 'destructive',
    });
  }
  
  return message;
}

/**
 * معالج أخطاء لـ React Query mutations
 */
export function createMutationErrorHandler(options: ErrorHandlerOptions = {}) {
  return (error: unknown) => {
    handleError(error, options);
  };
}
