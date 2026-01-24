/**
 * Time and timezone utility functions
 * Provides timezone conversion and formatting capabilities
 */

import { format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { ar } from 'date-fns/locale';

export interface TimeZoneInfo {
  id: string;
  name: string;
  nameAr: string;
  offset: string;
}

/**
 * Get local timezone (cached for performance)
 */
let cachedLocalTimeZone: string | null = null;
function getLocalTimeZone(): string {
  if (!cachedLocalTimeZone) {
    cachedLocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return cachedLocalTimeZone;
}

/**
 * Predefined list of major world timezones
 */
export const WORLD_TIMEZONES: TimeZoneInfo[] = [
  {
    id: 'local',
    name: 'Local Time',
    nameAr: 'التوقيت المحلي',
    offset: '', // Set on first access
  },
  {
    id: 'utc',
    name: 'UTC/GMT',
    nameAr: 'التوقيت العالمي',
    offset: 'UTC',
  },
  {
    id: 'riyadh',
    name: 'Riyadh',
    nameAr: 'الرياض',
    offset: 'Asia/Riyadh',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    nameAr: 'دبي',
    offset: 'Asia/Dubai',
  },
  {
    id: 'mecca',
    name: 'Mecca',
    nameAr: 'مكة المكرمة',
    offset: 'Asia/Riyadh', // Same timezone as Riyadh
  },
  {
    id: 'newyork',
    name: 'New York',
    nameAr: 'نيويورك',
    offset: 'America/New_York',
  },
  {
    id: 'london',
    name: 'London',
    nameAr: 'لندن',
    offset: 'Europe/London',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    nameAr: 'طوكيو',
    offset: 'Asia/Tokyo',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    nameAr: 'سيدني',
    offset: 'Australia/Sydney',
  },
];

// Initialize local timezone on first module load
WORLD_TIMEZONES[0].offset = getLocalTimeZone();

/**
 * Get current time in a specific timezone
 */
export function getTimeInTimeZone(timezone: string): Date {
  const now = new Date();
  
  if (timezone === 'local' || timezone === getLocalTimeZone()) {
    return now;
  }
  
  if (timezone === 'UTC') {
    return new Date(now.toISOString());
  }
  
  return toZonedTime(now, timezone);
}

/**
 * Format time in 24-hour format (HH:mm:ss)
 */
export function format24Hour(date: Date, timezone: string): string {
  try {
    return formatInTimeZone(date, timezone, 'HH:mm:ss');
  } catch {
    // Fallback for invalid timezone
    return format(date, 'HH:mm:ss');
  }
}

/**
 * Format time in 12-hour format (hh:mm:ss a)
 */
export function format12Hour(date: Date, timezone: string): string {
  try {
    return formatInTimeZone(date, timezone, 'hh:mm:ss a');
  } catch {
    // Fallback for invalid timezone
    return format(date, 'hh:mm:ss a');
  }
}

/**
 * Format date in readable format
 */
export function formatDate(date: Date, timezone: string, useArabic = false): string {
  try {
    const formatString = 'EEE, MMM dd, yyyy';
    return formatInTimeZone(date, timezone, formatString, {
      locale: useArabic ? ar : undefined,
    });
  } catch {
    // Fallback for invalid timezone
    return format(date, 'EEE, MMM dd, yyyy', {
      locale: useArabic ? ar : undefined,
    });
  }
}

/**
 * Get timezone offset string (e.g., "+03:00")
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    return formatInTimeZone(now, timezone, 'XXX');
  } catch {
    return '+00:00';
  }
}

/**
 * Determine if it's daytime in a given timezone (6 AM - 6 PM)
 */
export function isDaytime(date: Date, timezone: string): boolean {
  try {
    const hourString = formatInTimeZone(date, timezone, 'H');
    const hour = parseInt(hourString, 10);
    return hour >= 6 && hour < 18;
  } catch {
    const hour = date.getHours();
    return hour >= 6 && hour < 18;
  }
}
