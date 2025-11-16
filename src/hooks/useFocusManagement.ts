import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook لإدارة الـ Focus بشكل صحيح
 * يضمن أن الـ focus ينتقل للعنصر الصحيح عند فتح/إغلاق الـ dialogs
 */
export function useFocusManagement(
  isOpen: boolean,
  firstElementRef: RefObject<HTMLElement>,
  returnFocusRef?: RefObject<HTMLElement>
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // حفظ العنصر النشط الحالي
      previousActiveElement.current = document.activeElement as HTMLElement;

      // نقل الـ focus للعنصر الأول في الـ dialog
      setTimeout(() => {
        if (firstElementRef.current) {
          firstElementRef.current.focus();
        }
      }, 100);
    } else {
      // إرجاع الـ focus للعنصر السابق عند الإغلاق
      setTimeout(() => {
        if (returnFocusRef?.current) {
          returnFocusRef.current.focus();
        } else if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, 100);
    }
  }, [isOpen, firstElementRef, returnFocusRef]);
}

/**
 * Hook للـ Focus Trap داخل الـ Dialog
 * يمنع الـ focus من الخروج من الـ dialog
 */
export function useFocusTrap(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // يمكن إضافة منطق للإغلاق هنا
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, containerRef]);
}

/**
 * Hook للتركيز التلقائي على أول حقل خطأ في النموذج
 */
export function useFocusOnError(errors: Record<string, unknown>) {
  useEffect(() => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const errorElement = document.querySelector(
        `[name="${firstErrorKey}"]`
      ) as HTMLElement;
      if (errorElement) {
        errorElement.focus();
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors]);
}
