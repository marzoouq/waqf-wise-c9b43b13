/**
 * نظام موحد لمعالجة الأخطاء
 * يجمع أفضل ميزات الأنظمة السابقة في واجهة بسيطة
 */

import { toast } from 'sonner';
import { errorTracker } from './tracker';
import { getErrorMessage, getErrorTitle } from './messages';
import type { ErrorContext, ErrorSeverity } from './types';

export * from './types';
export * from './messages';
export { errorTracker };

/**
 * معالجة خطأ وعرض toast
 */
export function handleError(
  error: unknown,
  options: {
    context?: ErrorContext;
    showToast?: boolean;
    toastTitle?: string;
    severity?: ErrorSeverity;
  } = {}
) {
  const {
    context,
    showToast = true,
    toastTitle,
    severity = 'medium'
  } = options;

  const message = getErrorMessage(error);
  const title = toastTitle || getErrorTitle(error, context);
  
  // تسجيل الخطأ
  errorTracker.logError(message, severity, context?.metadata);
  
  // عرض Toast
  if (showToast) {
    toast.error(title, {
      description: message,
    });
  }
  
  return message;
}

/**
 * معالج أخطاء للـ mutations
 */
export function createMutationErrorHandler(options: {
  context?: string | ErrorContext;
  severity?: ErrorSeverity;
  showToast?: boolean;
  toastTitle?: string;
} = {}) {
  return (error: unknown) => {
    const contextObj = typeof options.context === 'string' 
      ? { operation: options.context } 
      : options.context;
    
    handleError(error, {
      context: contextObj,
      severity: options.severity,
      showToast: options.showToast,
      toastTitle: options.toastTitle,
    });
  };
}

/**
 * تسجيل خطأ يدوياً
 */
export function logError(
  message: string | unknown,
  severity: ErrorSeverity = 'medium',
  additionalData?: Record<string, unknown>
) {
  // تحويل الرسالة إلى نص إذا كانت كائن
  let cleanMessage: string;
  
  if (typeof message === 'string') {
    cleanMessage = message;
  } else if (typeof message === 'object' && message !== null) {
    try {
      cleanMessage = JSON.stringify(message);
    } catch {
      cleanMessage = String(message);
    }
  } else {
    cleanMessage = String(message);
  }
  
  // تجاهل رسائل "[object Object]"
  if (cleanMessage === '[object Object]') {
    return;
  }
  
  errorTracker.logError(cleanMessage, severity, additionalData);
}

/**
 * عرض رسالة نجاح
 */
export function showSuccess(title: string, description?: string) {
  toast.success(title, { description });
}

/**
 * عرض رسالة تحذير
 */
export function showWarning(title: string, description?: string) {
  toast.warning(title, { description });
}

/**
 * عرض رسالة معلومات
 */
export function showInfo(title: string, description?: string) {
  toast.info(title, { description });
}
