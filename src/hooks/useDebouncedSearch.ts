import { useState, useEffect, useCallback } from "react";

/**
 * Hook for debounced search input
 * Reduces re-renders by delaying callback execution
 * 
 * @param initialValue - Initial search value
 * @param callback - Function to call with debounced value
 * @param delay - Debounce delay in ms (default: 300)
 */
export function useDebouncedSearch(
  initialValue: string,
  callback: (value: string) => void,
  delay: number = 300
) {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== initialValue) {
        callback(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, callback, initialValue]);

  const handleChange = useCallback((value: string) => {
    setLocalValue(value);
  }, []);

  return {
    value: localValue,
    onChange: handleChange,
  };
}
