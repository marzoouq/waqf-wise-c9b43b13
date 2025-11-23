/**
 * Performance utilities for React optimization
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to detect slow renders
 */
export const useRenderTracking = (componentName: string, threshold = 16) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const renderTime = currentTime - lastRenderTime.current;
    
    if (renderTime > threshold) {
      console.warn(
        `[Performance] ${componentName} rendered in ${renderTime}ms (threshold: ${threshold}ms)`,
        { renderCount: renderCount.current }
      );
    }
    
    lastRenderTime.current = currentTime;
  });

  return renderCount.current;
};

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
