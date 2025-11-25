/**
 * ✅ Error Tracker Settings Manager
 * إدارة إعدادات تتبع الأخطاء من قاعدة البيانات
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export interface ErrorTrackerSettings {
  dedupWindowMinutes: number;
  maxSameError: number;
  maxConsecutiveErrors: number;
  autoResolveHours: number;
  circuitBreakerTimeout: number;
  cronOldErrorsThreshold: number;
  cronDuplicateAlertsWindow: number;
}

const DEFAULT_SETTINGS: ErrorTrackerSettings = {
  dedupWindowMinutes: 15,
  maxSameError: 20,
  maxConsecutiveErrors: 10,
  autoResolveHours: 24,
  circuitBreakerTimeout: 60,
  cronOldErrorsThreshold: 24,
  cronDuplicateAlertsWindow: 1,
};

/**
 * تحميل إعدادات Error Tracker من قاعدة البيانات
 */
export async function loadErrorTrackerSettings(): Promise<ErrorTrackerSettings> {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'error_tracker_dedup_window_minutes',
        'error_tracker_max_same_error',
        'error_tracker_max_consecutive_errors',
        'error_tracker_auto_resolve_hours',
        'error_tracker_circuit_breaker_timeout',
        'cron_old_errors_threshold_hours',
        'cron_duplicate_alerts_window_hours',
      ]);

    if (error) throw error;

    const result: ErrorTrackerSettings = { ...DEFAULT_SETTINGS };

    if (settings && settings.length > 0) {
      settings.forEach(setting => {
        const value = Number(setting.setting_value);
        switch (setting.setting_key) {
          case 'error_tracker_dedup_window_minutes':
            result.dedupWindowMinutes = value;
            break;
          case 'error_tracker_max_same_error':
            result.maxSameError = value;
            break;
          case 'error_tracker_max_consecutive_errors':
            result.maxConsecutiveErrors = value;
            break;
          case 'error_tracker_auto_resolve_hours':
            result.autoResolveHours = value;
            break;
          case 'error_tracker_circuit_breaker_timeout':
            result.circuitBreakerTimeout = value;
            break;
          case 'cron_old_errors_threshold_hours':
            result.cronOldErrorsThreshold = value;
            break;
          case 'cron_duplicate_alerts_window_hours':
            result.cronDuplicateAlertsWindow = value;
            break;
        }
      });

      productionLogger.info('Loaded Error Tracker settings from DB', result);
    }

    return result;
  } catch (error) {
    productionLogger.warn('Failed to load settings from DB, using defaults', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * تحديث إعداد محدد في قاعدة البيانات
 */
export async function updateErrorTrackerSetting(
  key: keyof ErrorTrackerSettings,
  value: number
): Promise<void> {
  const settingKeyMap: Record<keyof ErrorTrackerSettings, string> = {
    dedupWindowMinutes: 'error_tracker_dedup_window_minutes',
    maxSameError: 'error_tracker_max_same_error',
    maxConsecutiveErrors: 'error_tracker_max_consecutive_errors',
    autoResolveHours: 'error_tracker_auto_resolve_hours',
    circuitBreakerTimeout: 'error_tracker_circuit_breaker_timeout',
    cronOldErrorsThreshold: 'cron_old_errors_threshold_hours',
    cronDuplicateAlertsWindow: 'cron_duplicate_alerts_window_hours',
  };

  const settingKey = settingKeyMap[key];
  
  const { error } = await supabase
    .from('system_settings')
    .update({ setting_value: String(value), updated_at: new Date().toISOString() })
    .eq('setting_key', settingKey);

  if (error) throw error;

  productionLogger.info(`Updated ${settingKey} to ${value}`);
}
