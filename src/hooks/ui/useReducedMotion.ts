/**
 * useReducedMotion - إدارة تفضيلات الحركة
 * WCAG 2.1 - 2.3.3 Animation from Interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  prefersReducedMotion as checkReducedMotion,
  onReducedMotionChange,
  prefersHighContrast as checkHighContrast,
} from '@/lib/accessibility';
import { DURATIONS, TRANSITIONS } from '@/lib/motion-system';

// ==================== Reduced Motion Hook ====================

interface UseReducedMotionReturn {
  /** هل المستخدم يفضل تقليل الحركة */
  prefersReducedMotion: boolean;
  /** الحصول على مدة الحركة المناسبة */
  getDuration: (duration: number) => number;
  /** الحصول على transition مع مراعاة التفضيل */
  getTransition: <T extends { duration: number }>(transition: T) => T;
  /** فئات CSS للحركة */
  motionClass: string;
}

export function useReducedMotion(): UseReducedMotionReturn {
  const [prefersReduced, setPrefersReduced] = useState(() => checkReducedMotion());

  useEffect(() => {
    return onReducedMotionChange(setPrefersReduced);
  }, []);

  const getDuration = useCallback(
    (duration: number): number => {
      return prefersReduced ? 0 : duration;
    },
    [prefersReduced]
  );

  const getTransition = useCallback(
    <T extends { duration: number }>(transition: T): T => {
      if (prefersReduced) {
        return { ...transition, duration: 0 };
      }
      return transition;
    },
    [prefersReduced]
  );

  const motionClass = prefersReduced ? 'motion-reduce' : 'motion-safe';

  return {
    prefersReducedMotion: prefersReduced,
    getDuration,
    getTransition,
    motionClass,
  };
}

// ==================== High Contrast Hook ====================

interface UseHighContrastReturn {
  /** هل المستخدم يفضل التباين العالي */
  prefersHighContrast: boolean;
  /** فئات CSS للتباين */
  contrastClass: string;
}

export function useHighContrast(): UseHighContrastReturn {
  const [prefersContrast, setPrefersContrast] = useState(() => checkHighContrast());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handler = (e: MediaQueryListEvent) => setPrefersContrast(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const contrastClass = prefersContrast ? 'contrast-more' : 'contrast-normal';

  return {
    prefersHighContrast: prefersContrast,
    contrastClass,
  };
}

// ==================== Color Scheme Hook ====================

type ColorScheme = 'light' | 'dark' | 'system';

interface UseColorSchemeReturn {
  /** النظام اللوني الحالي */
  colorScheme: ColorScheme;
  /** النظام اللوني الفعلي */
  resolvedColorScheme: 'light' | 'dark';
  /** تغيير النظام اللوني */
  setColorScheme: (scheme: ColorScheme) => void;
  /** تبديل النظام اللوني */
  toggleColorScheme: () => void;
}

export function useColorScheme(): UseColorSchemeReturn {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('color-scheme') as ColorScheme) || 'system';
  });

  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedColorScheme = colorScheme === 'system' ? systemScheme : colorScheme;

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('color-scheme', scheme);
      
      // تحديث الـ DOM
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (scheme === 'system') {
        root.classList.add(systemScheme);
      } else {
        root.classList.add(scheme);
      }
    }
  }, [systemScheme]);

  const toggleColorScheme = useCallback(() => {
    const schemes: ColorScheme[] = ['light', 'dark', 'system'];
    const currentIndex = schemes.indexOf(colorScheme);
    const nextScheme = schemes[(currentIndex + 1) % schemes.length];
    setColorScheme(nextScheme);
  }, [colorScheme, setColorScheme]);

  return {
    colorScheme,
    resolvedColorScheme,
    setColorScheme,
    toggleColorScheme,
  };
}

// ==================== Safe Animation Hook ====================

interface UseSafeAnimationOptions {
  /** مدة الحركة الافتراضية */
  duration?: number;
  /** منحنى التسهيل */
  easing?: string;
  /** تأخير */
  delay?: number;
}

interface UseSafeAnimationReturn {
  /** خصائص الحركة الآمنة */
  animationProps: {
    style: React.CSSProperties;
    className: string;
  };
  /** هل الحركة ممكنة */
  canAnimate: boolean;
}

export function useSafeAnimation({
  duration = DURATIONS.normal,
  easing = 'ease-out',
  delay = 0,
}: UseSafeAnimationOptions = {}): UseSafeAnimationReturn {
  const { prefersReducedMotion, getDuration } = useReducedMotion();

  const safeDuration = getDuration(duration);
  const safeDelay = getDuration(delay);

  return {
    animationProps: {
      style: {
        transitionDuration: `${safeDuration}ms`,
        transitionTimingFunction: easing,
        transitionDelay: `${safeDelay}ms`,
        animationDuration: prefersReducedMotion ? '0s' : `${duration}ms`,
      },
      className: prefersReducedMotion ? 'motion-reduce:transform-none motion-reduce:animate-none' : '',
    },
    canAnimate: !prefersReducedMotion,
  };
}

export default useReducedMotion;
