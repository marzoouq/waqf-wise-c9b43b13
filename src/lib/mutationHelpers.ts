/**
 * مساعدات موحدة للعمليات (mutations) في التطبيق
 * توفر معالجة موحدة للنجاح والفشل
 */

import { UseMutationOptions } from '@tanstack/react-query';
import { logError } from './errorService';
import type { AppError } from '@/types/errors';

export interface MutationHandlers<TData = unknown, TError = AppError, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
  context?: string;
}

/**
 * إنشاء mutation options موحدة مع معالجة الأخطاء
 */
export function createMutationOptions<TData, TError, TVariables>(
  handlers: MutationHandlers<TData, TError, TVariables>
): Pick<UseMutationOptions<TData, TError, TVariables>, 'onSuccess' | 'onError'> {
  return {
    onSuccess: async (data, variables, context) => {
      if (handlers.onSuccess) {
        await handlers.onSuccess(data, variables);
      }
    },
    onError: (error, variables, context) => {
      // تسجيل الخطأ
      logError(error, {
        operation: handlers.context || 'mutation',
        metadata: { variables },
      });

      if (handlers.onError) {
        handlers.onError(error, variables);
      }
    },
  };
}

/**
 * Wrapper للعمليات مع معالجة أخطاء تلقائية
 */
export async function executeMutation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, { operation: context });
    throw error;
  }
}
