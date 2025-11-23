import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج classNames مع Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * إعادة تصدير جميع دوال المنفعة من المجلدات المنظمة
 */
export * from './utils/arrays';
export * from './utils/formatting';
export * from './utils/validation';
