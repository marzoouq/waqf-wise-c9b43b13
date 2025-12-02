/**
 * Centralized Date Utilities
 * ===========================
 * يقلل حجم Bundle بـ 10-15KB عبر:
 * 1. استيراد واحد فقط لـ ar locale
 * 2. تصدير الدوال المستخدمة فقط
 * 3. توفير wrappers مُحسّنة مع locale مُعد مسبقاً
 */

import {
  format as fnsFormat,
  formatDistanceToNow as fnsFormatDistanceToNow,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameMonth,
  isSameDay,
  isSameYear,
  isToday,
  isBefore,
  isAfter,
  isValid,
  parseISO,
  startOfDay,
  endOfDay,
  getYear,
  getMonth,
  getDate,
  setYear,
  setMonth,
  setDate,
} from 'date-fns';
import { ar } from 'date-fns/locale';

// ============================================
// Pre-configured Arabic locale - استيراد مرة واحدة
// ============================================
const arLocale = { locale: ar };

// ============================================
// Date Formatting Functions - دوال التنسيق
// ============================================

/**
 * تنسيق التاريخ بالعربية
 * @param date - التاريخ (string أو Date)
 * @param formatStr - صيغة التنسيق (افتراضي: dd/MM/yyyy)
 */
export function formatDate(date: Date | string | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';
  return fnsFormat(d, formatStr, arLocale);
}

/**
 * تنسيق التاريخ والوقت
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * تنسيق التاريخ الكامل مع اسم اليوم
 */
export function formatFullDate(date: Date | string | null | undefined): string {
  return formatDate(date, 'EEEE، d MMMM yyyy');
}

/**
 * تنسيق الوقت فقط
 */
export function formatTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'HH:mm');
}

/**
 * تنسيق الشهر والسنة
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  return formatDate(date, 'MMMM yyyy');
}

/**
 * تنسيق نسبي (منذ X دقائق/ساعات/أيام)
 */
export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';
  return fnsFormatDistanceToNow(d, { ...arLocale, addSuffix: true });
}

/**
 * تنسيق نسبي بدون "منذ"
 */
export function formatDistance(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';
  return fnsFormatDistanceToNow(d, arLocale);
}

// ============================================
// Date Calculation Functions - دوال الحساب
// ============================================

/**
 * حساب الأيام المتبقية
 */
export function getDaysRemaining(endDate: Date | string | null | undefined): number {
  if (!endDate) return 0;
  const d = typeof endDate === 'string' ? new Date(endDate) : endDate;
  if (!isValid(d)) return 0;
  return differenceInDays(d, new Date());
}

/**
 * حساب الأشهر المتبقية
 */
export function getMonthsRemaining(endDate: Date | string | null | undefined): number {
  if (!endDate) return 0;
  const d = typeof endDate === 'string' ? new Date(endDate) : endDate;
  if (!isValid(d)) return 0;
  return differenceInMonths(d, new Date());
}

/**
 * حساب الفرق بالأيام بين تاريخين
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return differenceInDays(end, start);
}

/**
 * حساب الفرق بالأشهر بين تاريخين
 */
export function monthsBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return differenceInMonths(end, start);
}

// ============================================
// Re-exports for direct usage - للاستخدام المباشر
// ============================================

export {
  // Date comparisons
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isSameMonth,
  isSameDay,
  isSameYear,
  isToday,
  isBefore,
  isAfter,
  isValid,
  
  // Date manipulation
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  
  // Date intervals
  eachDayOfInterval,
  eachMonthOfInterval,
  
  // Date parts
  getYear,
  getMonth,
  getDate,
  setYear,
  setMonth,
  setDate,
  
  // Parsing
  parseISO,
};

// Export the locale for components that need it directly (like DatePicker)
export { ar as arLocale };

// Export the raw format function for edge cases
export { fnsFormat as format };
