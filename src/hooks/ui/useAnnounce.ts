/**
 * useAnnounce - إعلان الرسائل لقارئات الشاشة
 * WCAG 2.1 - 4.1.3 Status Messages
 */

import { useCallback, useEffect, useRef } from 'react';
import { announce, type LiveRegionPriority } from '@/lib/accessibility';

interface UseAnnounceOptions {
  /**
   * أولوية الإعلان
   * @default 'polite'
   */
  defaultPriority?: LiveRegionPriority;
  /**
   * تأخير بين الإعلانات لتجنب التكرار
   * @default 100
   */
  debounceMs?: number;
}

interface UseAnnounceReturn {
  /** إعلان رسالة */
  announce: (message: string, priority?: LiveRegionPriority) => void;
  /** إعلان نجاح */
  announceSuccess: (message: string) => void;
  /** إعلان خطأ */
  announceError: (message: string) => void;
  /** إعلان تحميل */
  announceLoading: (message?: string) => void;
  /** إعلان تحديث عدد النتائج */
  announceResults: (count: number, type?: string) => void;
}

export function useAnnounce({
  defaultPriority = 'polite',
  debounceMs = 100,
}: UseAnnounceOptions = {}): UseAnnounceReturn {
  const timeoutRef = useRef<number>();

  // تنظيف عند إزالة المكون
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedAnnounce = useCallback(
    (message: string, priority: LiveRegionPriority = defaultPriority) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        announce(message, priority);
      }, debounceMs);
    },
    [defaultPriority, debounceMs]
  );

  const announceSuccess = useCallback(
    (message: string) => {
      debouncedAnnounce(`نجاح: ${message}`, 'polite');
    },
    [debouncedAnnounce]
  );

  const announceError = useCallback(
    (message: string) => {
      debouncedAnnounce(`خطأ: ${message}`, 'assertive');
    },
    [debouncedAnnounce]
  );

  const announceLoading = useCallback(
    (message: string = 'جاري التحميل') => {
      debouncedAnnounce(message, 'polite');
    },
    [debouncedAnnounce]
  );

  const announceResults = useCallback(
    (count: number, type: string = 'نتيجة') => {
      const message = count === 0
        ? 'لا توجد نتائج'
        : count === 1
        ? `${type} واحدة`
        : count === 2
        ? `${type}ان`
        : count <= 10
        ? `${count} ${type}ات`
        : `${count} ${type}`;
      
      debouncedAnnounce(message, 'polite');
    },
    [debouncedAnnounce]
  );

  return {
    announce: debouncedAnnounce,
    announceSuccess,
    announceError,
    announceLoading,
    announceResults,
  };
}

// ==================== Form Announce Hook ====================

interface UseFormAnnounceReturn {
  /** إعلان خطأ في حقل */
  announceFieldError: (fieldName: string, error: string) => void;
  /** إعلان نجاح الإرسال */
  announceSubmitSuccess: (message?: string) => void;
  /** إعلان خطأ الإرسال */
  announceSubmitError: (error?: string) => void;
  /** إعلان جاري الإرسال */
  announceSubmitting: () => void;
}

export function useFormAnnounce(): UseFormAnnounceReturn {
  const { announce: baseAnnounce } = useAnnounce();

  const announceFieldError = useCallback(
    (fieldName: string, error: string) => {
      baseAnnounce(`خطأ في ${fieldName}: ${error}`, 'assertive');
    },
    [baseAnnounce]
  );

  const announceSubmitSuccess = useCallback(
    (message: string = 'تم الحفظ بنجاح') => {
      baseAnnounce(message, 'polite');
    },
    [baseAnnounce]
  );

  const announceSubmitError = useCallback(
    (error: string = 'حدث خطأ أثناء الحفظ') => {
      baseAnnounce(error, 'assertive');
    },
    [baseAnnounce]
  );

  const announceSubmitting = useCallback(() => {
    baseAnnounce('جاري الحفظ...', 'polite');
  }, [baseAnnounce]);

  return {
    announceFieldError,
    announceSubmitSuccess,
    announceSubmitError,
    announceSubmitting,
  };
}

// ==================== Table Announce Hook ====================

interface UseTableAnnounceReturn {
  /** إعلان الترتيب */
  announceSort: (column: string, direction: 'asc' | 'desc') => void;
  /** إعلان تغيير الصفحة */
  announcePage: (current: number, total: number) => void;
  /** إعلان تحديد الصف */
  announceRowSelection: (selected: number, total: number) => void;
  /** إعلان تغيير الفلتر */
  announceFilter: (filterName: string, value: string) => void;
}

export function useTableAnnounce(): UseTableAnnounceReturn {
  const { announce: baseAnnounce } = useAnnounce();

  const announceSort = useCallback(
    (column: string, direction: 'asc' | 'desc') => {
      const dirText = direction === 'asc' ? 'تصاعدياً' : 'تنازلياً';
      baseAnnounce(`تم ترتيب الجدول حسب ${column} ${dirText}`, 'polite');
    },
    [baseAnnounce]
  );

  const announcePage = useCallback(
    (current: number, total: number) => {
      baseAnnounce(`صفحة ${current} من ${total}`, 'polite');
    },
    [baseAnnounce]
  );

  const announceRowSelection = useCallback(
    (selected: number, total: number) => {
      if (selected === 0) {
        baseAnnounce('تم إلغاء تحديد جميع الصفوف', 'polite');
      } else if (selected === total) {
        baseAnnounce('تم تحديد جميع الصفوف', 'polite');
      } else {
        baseAnnounce(`تم تحديد ${selected} من ${total} صف`, 'polite');
      }
    },
    [baseAnnounce]
  );

  const announceFilter = useCallback(
    (filterName: string, value: string) => {
      if (value) {
        baseAnnounce(`تم تطبيق فلتر ${filterName}: ${value}`, 'polite');
      } else {
        baseAnnounce(`تم إزالة فلتر ${filterName}`, 'polite');
      }
    },
    [baseAnnounce]
  );

  return {
    announceSort,
    announcePage,
    announceRowSelection,
    announceFilter,
  };
}

export default useAnnounce;
