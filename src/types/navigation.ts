/**
 * Navigation Types - أنواع التنقل الموحدة
 * @version 1.0.0
 */

import type { ComponentType } from "react";

/**
 * عنصر تنقل واحد في شريط التنقل السفلي
 */
export interface NavigationItem {
  /** معرف فريد للعنصر */
  id: string;
  /** النص المعروض */
  label: string;
  /** أيقونة Lucide */
  icon: ComponentType<{ className?: string }>;
  /** مسار التنقل */
  path: string;
  /** مسارات إضافية للتفعيل */
  matchPaths?: string[];
  /** عداد الإشعارات (اختياري) */
  badge?: number;
}
