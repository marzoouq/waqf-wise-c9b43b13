/**
 * دوال تنسيق البيانات
 */

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * تنسيق العملة بالريال السعودي
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * تنسيق التاريخ
 */
export function formatDate(date: string | Date, formatString: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: ar });
}

/**
 * تنسيق الأرقام
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
}

/**
 * تنسيق النسبة المئوية
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * تنسيق رقم الهاتف السعودي
 */
export function formatPhoneNumber(phone: string): string {
  // إزالة جميع الأحرف غير الرقمية
  const cleaned = phone.replace(/\D/g, '');
  
  // التنسيق: 05XX XXX XXXX
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * تنسيق رقم الهوية الوطنية
 */
export function formatNationalId(id: string): string {
  const cleaned = id.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
  }
  
  return id;
}

/**
 * اختصار النص
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * تحويل الحجم بالبايت إلى صيغة قابلة للقراءة
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
