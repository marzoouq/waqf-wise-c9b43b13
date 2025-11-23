import { useState, useEffect, useCallback } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

/**
 * Hook لتخزين البيانات في SessionStorage
 * البيانات تُحذف عند إغلاق التبويب
 * 
 * @example
 * const [filters, setFilters] = useSessionStorage('search-filters', {});
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // قراءة القيمة الأولية من SessionStorage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      productionLogger.warn(`Error reading sessionStorage key "${key}"`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // حفظ القيمة في SessionStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        productionLogger.warn(
          `Tried setting sessionStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch (error) {
        productionLogger.warn(`Error setting sessionStorage key "${key}"`, error);
      }
    },
    [key, storedValue]
  );

  // حذف القيمة من SessionStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      productionLogger.warn(
        `Tried removing sessionStorage key "${key}" even though environment is not a client`
      );
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      productionLogger.warn(`Error removing sessionStorage key "${key}"`, error);
    }
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue];
}
