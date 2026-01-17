/**
 * useFocusManagement - إدارة التركيز للوصولية
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  getFocusableElements, 
  trapFocus, 
  createFocusRestore 
} from '@/lib/accessibility';
import { hapticFeedback } from '@/lib/mobile-ux';

// ==================== Focus Trap Hook ====================

interface UseFocusTrapOptions {
  /** تمكين حصر التركيز */
  enabled?: boolean;
  /** التركيز على أول عنصر عند التفعيل */
  autoFocus?: boolean;
  /** استعادة التركيز عند التعطيل */
  restoreFocus?: boolean;
}

interface UseFocusTrapReturn<T extends HTMLElement> {
  /** المرجع للحاوية */
  containerRef: React.RefObject<T>;
  /** التركيز على أول عنصر */
  focusFirst: () => void;
  /** التركيز على آخر عنصر */
  focusLast: () => void;
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  enabled = true,
  autoFocus = true,
  restoreFocus = true,
}: UseFocusTrapOptions = {}): UseFocusTrapReturn<T> {
  const containerRef = useRef<T>(null);
  const focusRestore = useRef(createFocusRestore());

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // حفظ التركيز الحالي
    if (restoreFocus) {
      focusRestore.current.save();
    }

    // حصر التركيز
    const cleanup = trapFocus(containerRef.current);

    // التركيز على أول عنصر
    if (autoFocus) {
      const focusable = getFocusableElements(containerRef.current);
      focusable[0]?.focus();
    }

    return () => {
      cleanup();
      // استعادة التركيز
      if (restoreFocus) {
        focusRestore.current.restore();
      }
    };
  }, [enabled, autoFocus, restoreFocus]);

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;
    const focusable = getFocusableElements(containerRef.current);
    focusable[0]?.focus();
    hapticFeedback('selection');
  }, []);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;
    const focusable = getFocusableElements(containerRef.current);
    focusable[focusable.length - 1]?.focus();
    hapticFeedback('selection');
  }, []);

  return {
    containerRef,
    focusFirst,
    focusLast,
  };
}

// ==================== Roving Tabindex Hook ====================

interface UseRovingTabindexOptions {
  /** الاتجاه */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** التفاف */
  wrap?: boolean;
  /** RTL */
  rtl?: boolean;
}

interface UseRovingTabindexReturn {
  /** الفهرس المركز عليه */
  focusedIndex: number;
  /** تعيين الفهرس */
  setFocusedIndex: (index: number) => void;
  /** خصائص العنصر */
  getItemProps: (index: number) => {
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
    ref: (el: HTMLElement | null) => void;
  };
  /** التركيز على عنصر محدد */
  focusItem: (index: number) => void;
}

export function useRovingTabindex(
  itemCount: number,
  {
    orientation = 'vertical',
    wrap = true,
    rtl = true,
  }: UseRovingTabindexOptions = {}
): UseRovingTabindexReturn {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const focusItem = useCallback((index: number) => {
    const element = itemRefs.current[index];
    if (element) {
      element.focus();
      setFocusedIndex(index);
      hapticFeedback('selection');
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex = currentIndex;
      
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      // تحديد المفاتيح بناءً على الاتجاه و RTL
      const nextKey = isHorizontal 
        ? (rtl ? 'ArrowLeft' : 'ArrowRight')
        : null;
      const prevKey = isHorizontal
        ? (rtl ? 'ArrowRight' : 'ArrowLeft')
        : null;
      const downKey = isVertical ? 'ArrowDown' : null;
      const upKey = isVertical ? 'ArrowUp' : null;

      switch (e.key) {
        case nextKey:
        case downKey:
          e.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= itemCount) {
            nextIndex = wrap ? 0 : itemCount - 1;
          }
          break;

        case prevKey:
        case upKey:
          e.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = wrap ? itemCount - 1 : 0;
          }
          break;

        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          nextIndex = itemCount - 1;
          break;

        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        focusItem(nextIndex);
      }
    },
    [itemCount, orientation, wrap, rtl, focusItem]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
      onFocus: () => setFocusedIndex(index),
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
    }),
    [focusedIndex, handleKeyDown]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
    focusItem,
  };
}

// ==================== Focus Visible Hook ====================

interface UseFocusVisibleReturn {
  /** هل التركيز مرئي */
  isFocusVisible: boolean;
  /** خصائص للعنصر */
  focusVisibleProps: {
    onFocus: () => void;
    onBlur: () => void;
    onMouseDown: () => void;
    onKeyDown: () => void;
    'data-focus-visible': boolean;
  };
}

export function useFocusVisible(): UseFocusVisibleReturn {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const hadKeyboardEvent = useRef(false);

  const handleFocus = useCallback(() => {
    if (hadKeyboardEvent.current) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    hadKeyboardEvent.current = false;
  }, []);

  const handleKeyDown = useCallback(() => {
    hadKeyboardEvent.current = true;
  }, []);

  return {
    isFocusVisible,
    focusVisibleProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseDown: handleMouseDown,
      onKeyDown: handleKeyDown,
      'data-focus-visible': isFocusVisible,
    },
  };
}

// ==================== Focus Within Hook ====================

interface UseFocusWithinOptions {
  onFocusIn?: () => void;
  onFocusOut?: () => void;
}

interface UseFocusWithinReturn<T extends HTMLElement> {
  containerRef: React.RefObject<T>;
  isFocusWithin: boolean;
}

export function useFocusWithin<T extends HTMLElement = HTMLDivElement>({
  onFocusIn,
  onFocusOut,
}: UseFocusWithinOptions = {}): UseFocusWithinReturn<T> {
  const containerRef = useRef<T>(null);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = () => {
      if (!isFocusWithin) {
        setIsFocusWithin(true);
        onFocusIn?.();
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (!container.contains(e.relatedTarget as Node)) {
        setIsFocusWithin(false);
        onFocusOut?.();
      }
    };

    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, [isFocusWithin, onFocusIn, onFocusOut]);

  return {
    containerRef,
    isFocusWithin,
  };
}

export default useFocusTrap;
