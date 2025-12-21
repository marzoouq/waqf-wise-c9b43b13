/**
 * Hook لإدارة التنبيهات المُتجاهلة
 * Ignored Alerts Management Hook
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ignored-performance-alerts';

export interface IgnoredAlert {
  id: string;
  ignoredAt: string;
  reason?: string;
}

export function useIgnoredAlerts() {
  const [ignoredAlerts, setIgnoredAlerts] = useState<IgnoredAlert[]>([]);

  // تحميل التنبيهات المُتجاهلة من localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setIgnoredAlerts(JSON.parse(stored));
      }
    } catch {
      // تجاهل أخطاء localStorage
    }
  }, []);

  // حفظ التنبيهات في localStorage
  const saveToStorage = useCallback((alerts: IgnoredAlert[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      // تجاهل أخطاء localStorage
    }
  }, []);

  // تجاهل تنبيه
  const ignoreAlert = useCallback((alertId: string, reason?: string) => {
    setIgnoredAlerts(prev => {
      const updated = [...prev, { 
        id: alertId, 
        ignoredAt: new Date().toISOString(),
        reason 
      }];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // إلغاء تجاهل تنبيه
  const unignoreAlert = useCallback((alertId: string) => {
    setIgnoredAlerts(prev => {
      const updated = prev.filter(a => a.id !== alertId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // التحقق إذا كان التنبيه مُتجاهل
  const isIgnored = useCallback((alertId: string) => {
    return ignoredAlerts.some(a => a.id === alertId);
  }, [ignoredAlerts]);

  // مسح جميع التنبيهات المُتجاهلة
  const clearAllIgnored = useCallback(() => {
    setIgnoredAlerts([]);
    saveToStorage([]);
  }, [saveToStorage]);

  // فلترة التنبيهات لإزالة المُتجاهلة
  const filterIgnoredAlerts = useCallback(<T extends { id: string }>(alerts: T[]): T[] => {
    return alerts.filter(alert => !isIgnored(alert.id));
  }, [isIgnored]);

  return {
    ignoredAlerts,
    ignoreAlert,
    unignoreAlert,
    isIgnored,
    clearAllIgnored,
    filterIgnoredAlerts,
    ignoredCount: ignoredAlerts.length,
  };
}
