import { useState, useEffect, useCallback } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

/**
 * تحليل JSON آمن خاص بالـ hook
 */
function safeParseJson<T>(value: string | null, defaultValue: T, key: string): T {
  if (!value || value === 'undefined' || value === 'null') {
    return defaultValue;
  }

  const trimmed = value.trim();
  
  // التحقق من أن القيمة تبدأ بـ [ أو { (JSON صالح)
  // أو إذا كانت قيمة نصية بسيطة مثل "string" أو رقم
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{') && !trimmed.startsWith('"')) {
    // قد تكون قيمة بسيطة غير JSON - محاولة إرجاعها كما هي
    productionLogger.warn(`[useLocalStorage] Non-JSON value for key "${key}"`);
    return trimmed as unknown as T;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    productionLogger.warn(`[useLocalStorage] Failed to parse JSON for key "${key}"`);
    // مسح البيانات التالفة
    try {
      localStorage.removeItem(key);
    } catch {
      // تجاهل
    }
    return defaultValue;
  }
}

/**
 * Hook لتخزين البيانات في LocalStorage
 * مع مزامنة تلقائية بين التبويبات
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // قراءة القيمة الأولية من LocalStorage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      return safeParseJson<T>(item, initialValue, key);
    } catch (error) {
      productionLogger.warn(`Error reading localStorage key "${key}"`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // حفظ القيمة في LocalStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        productionLogger.warn(
          `Tried setting localStorage key "${key}" even though environment is not a client`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        
        // إرسال حدث لمزامنة التبويبات الأخرى
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        productionLogger.warn(`Error setting localStorage key "${key}"`, error);
      }
    },
    [key, storedValue]
  );

  // حذف القيمة من LocalStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      productionLogger.warn(
        `Tried removing localStorage key "${key}" even though environment is not a client`
      );
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      productionLogger.warn(`Error removing localStorage key "${key}"`, error);
    }
  }, [initialValue, key]);

  // مزامنة بين التبويبات
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // الاستماع للتغييرات من تبويبات أخرى
    window.addEventListener('storage', handleStorageChange);
    // الاستماع للتغييرات من نفس التبويب
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}
