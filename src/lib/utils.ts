import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج classNames مع Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * إعادة تصدير دوال المنفعة الأكثر استخداماً بشكل مباشر
 * لتحسين الأداء وتقليل حجم الحزمة
 */

// الدوال الأكثر استخداماً
export { 
  formatCurrency, 
  formatDate, 
  formatNumber,
  formatPercentage 
} from './utils/formatting';

export { 
  groupBy, 
  sortBy, 
  unique 
} from './utils/arrays';

export { 
  isValidEmail,
  isValidSaudiPhone,
  isNotEmpty 
} from './utils/validation';

// استيراد كسول للدوال الأقل استخداماً
export * from './utils/arrays';
export * from './utils/formatting';
export * from './utils/validation';
