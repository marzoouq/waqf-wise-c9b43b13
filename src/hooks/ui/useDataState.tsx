/**
 * useDataState Hook - معالجة موحدة لحالات البيانات
 * يوفر معالجة متسقة لحالات Loading/Error/Empty
 * @version 2.9.2
 */

import { ReactNode } from 'react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import type { LucideIcon } from 'lucide-react';
import { FileText } from 'lucide-react';

export interface UseDataStateOptions<T> {
  /** حالة التحميل */
  isLoading: boolean;
  /** الخطأ إن وجد */
  error: unknown;
  /** البيانات */
  data: T | undefined | null;
  /** دالة إعادة المحاولة */
  refetch?: () => void;
  /** رسالة التحميل */
  loadingMessage?: string;
  /** عنوان الخطأ */
  errorTitle?: string;
  /** رسالة الخطأ */
  errorMessage?: string;
  /** عنوان الحالة الفارغة */
  emptyTitle?: string;
  /** رسالة الحالة الفارغة */
  emptyMessage?: string;
  /** أيقونة الحالة الفارغة */
  emptyIcon?: LucideIcon;
  /** التحقق من البيانات الفارغة (اختياري - الافتراضي: التحقق من المصفوفة الفارغة) */
  isEmpty?: (data: T) => boolean;
}

export interface DataStateResult {
  /** هل البيانات جاهزة للعرض */
  isReady: boolean;
  /** مكون الحالة للعرض (null إذا كانت البيانات جاهزة) */
  StateComponent: ReactNode | null;
}

/**
 * Hook موحد لمعالجة حالات البيانات الثلاث (Loading/Error/Empty)
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useQuery(...);
 * const { isReady, StateComponent } = useDataState({
 *   isLoading,
 *   error,
 *   data,
 *   refetch,
 *   loadingMessage: "جاري التحميل...",
 *   emptyTitle: "لا توجد بيانات"
 * });
 * 
 * if (!isReady) return StateComponent;
 * 
 * // عرض البيانات
 * return <DataView data={data} />;
 * ```
 */
export function useDataState<T>({
  isLoading,
  error,
  data,
  refetch,
  loadingMessage = 'جاري التحميل...',
  errorTitle = 'حدث خطأ',
  errorMessage = 'فشل تحميل البيانات. يرجى المحاولة مرة أخرى.',
  emptyTitle = 'لا توجد بيانات',
  emptyMessage = 'لم يتم العثور على أي بيانات',
  emptyIcon = FileText,
  isEmpty,
}: UseDataStateOptions<T>): DataStateResult {
  // حالة التحميل
  if (isLoading) {
    return {
      isReady: false,
      StateComponent: <LoadingState message={loadingMessage} />,
    };
  }

  // حالة الخطأ
  if (error) {
    return {
      isReady: false,
      StateComponent: (
        <ErrorState
          title={errorTitle}
          message={errorMessage}
          onRetry={refetch}
        />
      ),
    };
  }

  // التحقق من البيانات الفارغة
  const isDataEmpty = isEmpty
    ? isEmpty(data as T)
    : !data || (Array.isArray(data) && data.length === 0);

  if (isDataEmpty) {
    return {
      isReady: false,
      StateComponent: (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyMessage}
        />
      ),
    };
  }

  // البيانات جاهزة
  return {
    isReady: true,
    StateComponent: null,
  };
}

/**
 * دالة مساعدة سريعة للتحقق من حالة البيانات
 */
export function getDataStateStatus<T>(
  isLoading: boolean,
  error: unknown,
  data: T | undefined | null
): 'loading' | 'error' | 'empty' | 'ready' {
  if (isLoading) return 'loading';
  if (error) return 'error';
  if (!data || (Array.isArray(data) && data.length === 0)) return 'empty';
  return 'ready';
}
