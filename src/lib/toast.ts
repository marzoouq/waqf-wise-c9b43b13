/**
 * Toast Utilities - نظام الإشعارات الموحد
 * يستخدم sonner كقاعدة
 */

import { toast as sonnerToast } from "sonner";

// Types
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

/**
 * دالة toast الأساسية - متوافقة مع useToast القديم
 */
export function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    sonnerToast(options);
    return;
  }

  const { title, description, variant, duration } = options;
  
  if (variant === "destructive") {
    sonnerToast.error(title || "خطأ", {
      description,
      duration: duration || 5000,
    });
  } else {
    sonnerToast(title || "", {
      description,
      duration: duration || 3000,
    });
  }
}

/**
 * Toast helpers for common patterns
 */
export function toastSuccess(message: string, title: string = "نجح") {
  sonnerToast.success(title, {
    description: message,
    duration: 3000,
  });
}

export function toastError(message: string, title: string = "خطأ") {
  sonnerToast.error(title, {
    description: message,
    duration: 5000,
  });
}

export function toastWarning(message: string, title: string = "تنبيه") {
  sonnerToast.warning(title, {
    description: message,
    duration: 4000,
  });
}

export function toastInfo(message: string, title: string = "معلومة") {
  sonnerToast.info(title, {
    description: message,
    duration: 3000,
  });
}

export function toastLoading(message: string) {
  return sonnerToast.loading(message);
}

export function toastDismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId);
}

// Re-export sonner toast for direct access
export { sonnerToast };
