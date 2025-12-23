/**
 * Waqf Identity Constants - ثوابت هوية الوقف
 * تُستخدم في جميع الملفات المصدرة والمطبوعة
 * 
 * @version 2.9.6
 */

import { APP_VERSION } from './version';

export const WAQF_IDENTITY = {
  // المعلومات الأساسية
  name: 'وقف مرزوق علي الثبيتي',
  nameEn: 'Marzouq Ali Al-Thubaiti Waqf',
  platformName: 'منصة إدارة الوقف الإلكترونية',
  platformNameEn: 'Waqf Management Platform',
  
  // الشعار (رمز أو رابط)
  logo: '🕌',
  logoAlt: 'شعار الوقف',
  
  // التذييل والبيانات الرسمية
  footer: 'هذا مستند رسمي صادر من منصة إدارة الوقف الإلكترونية',
  footerEn: 'This is an official document issued by Waqf Management Platform',
  confidential: 'سري وخاص - للاستخدام الداخلي فقط',
  
  // معلومات الاتصال
  website: 'waqf-ba7r.store',
  
  // الألوان (ARGB للـ Excel, Hex للـ PDF/CSS)
  colors: {
    primary: {
      hex: '#16A34A',
      argb: 'FF16A34A',
    },
    primaryLight: {
      hex: '#22C55E',
      argb: 'FF22C55E',
    },
    secondary: {
      hex: '#DC2626',
      argb: 'FFDC2626',
    },
    headerBg: {
      hex: '#166534',
      argb: 'FF166534',
    },
    footerBg: {
      hex: '#F3F4F6',
      argb: 'FFF3F4F6',
    },
    textPrimary: {
      hex: '#1F2937',
      argb: 'FF1F2937',
    },
    textSecondary: {
      hex: '#6B7280',
      argb: 'FF6B7280',
    },
    white: {
      hex: '#FFFFFF',
      argb: 'FFFFFFFF',
    },
    alternateRow: {
      hex: '#F9FAFB',
      argb: 'FFF9FAFB',
    },
    totalRow: {
      hex: '#FEF9C3',
      argb: 'FFFEF9C3',
    },
  },
  
  // الإصدار
  version: APP_VERSION,
} as const;

/**
 * الحصول على التاريخ الحالي بالتنسيق العربي
 */
export function getCurrentDateArabic(): string {
  return new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * الحصول على الوقت الحالي بالتنسيق العربي
 */
export function getCurrentTimeArabic(): string {
  return new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * الحصول على التاريخ والوقت الحالي بالتنسيق العربي
 */
export function getCurrentDateTimeArabic(): string {
  return `${getCurrentDateArabic()} - ${getCurrentTimeArabic()}`;
}

/**
 * تنسيق المبلغ بالريال السعودي
 */
export function formatCurrencySAR(amount: number): string {
  return `${amount.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
}
