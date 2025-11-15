/**
 * Hook آمن لمعالجة الأخطاء مع type safety
 */

import { useCallback } from 'react';
import { useToast } from './use-toast';
import { getErrorMessage } from '@/lib/errorService';
import type { AppError } from '@/types/errors';

export function useSafeErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: AppError, title?: string) => {
      const message = getErrorMessage(error);
      
      toast({
        title: title || 'حدث خطأ',
        description: message,
        variant: 'destructive',
      });
    },
    [toast]
  );

  return { handleError };
}
