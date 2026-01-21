/**
 * Navigation Configuration - إعداد التنقل المركزي
 * المصدر الوحيد للحقيقة لشريط التنقل السفلي
 * @version 2.0.0
 */

import type { AppRole } from "@/types/roles";
import type { NavigationItem } from "@/types/navigation";

// استيراد جميع Configs
import { beneficiaryNavigationItems } from "./beneficiaryNavigation";
import { nazerNavigationItems } from "./nazerNavigation";
import { adminNavigationItems } from "./adminNavigation";
import { accountantNavigationItems } from "./accountantNavigation";
import { cashierNavigationItems } from "./cashierNavigation";
import { archivistNavigationItems } from "./archivistNavigation";

// استيراد السجل المركزي
import {
  NAVIGATION_REGISTRY,
  REGISTERED_ROUTES,
  extractAllNavigationPaths,
  validateNavigationPath,
  auditNavigationPaths,
  getValidatedNavigation,
  getNavigationStats,
} from "./navigationRegistry";

/**
 * خريطة التنقل حسب الدور
 * Partial لأن ليس كل الأدوار تحتاج تنقل مخصص (user يستخدم default)
 */
export const NAVIGATION_BY_ROLE: Partial<Record<AppRole, readonly NavigationItem[]>> = {
  nazer: nazerNavigationItems,
  admin: adminNavigationItems,
  accountant: accountantNavigationItems,
  cashier: cashierNavigationItems,
  archivist: archivistNavigationItems,
  beneficiary: beneficiaryNavigationItems,
  waqf_heir: beneficiaryNavigationItems,
  // user: يستخدم defaultNavigationItems
} as const;

/**
 * تسميات aria-label حسب الدور
 */
const NAVIGATION_ARIA_LABELS: Partial<Record<AppRole, string>> = {
  nazer: "التنقل السفلي للناظر",
  admin: "التنقل السفلي للمشرف",
  accountant: "التنقل السفلي للمحاسب",
  cashier: "التنقل السفلي للصراف",
  archivist: "التنقل السفلي للأرشيفي",
  beneficiary: "التنقل السفلي للمستفيد",
  waqf_heir: "التنقل السفلي للمستفيد",
} as const;

/**
 * الحصول على تنقل الدور مع تحذير تشخيصي
 */
export function getNavigationByRole(role: AppRole | string): readonly NavigationItem[] | undefined {
  const navigation = NAVIGATION_BY_ROLE[role as AppRole];
  
  if (!navigation && process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ No navigation config for role: ${role}. Using default.`);
  }
  
  return navigation;
}

/**
 * الحصول على aria-label للتنقل
 */
export function getNavigationAriaLabel(role: AppRole | string): string {
  return NAVIGATION_ARIA_LABELS[role as AppRole] || "التنقل السفلي";
}

// Re-exports from individual files
export { beneficiaryNavigationItems } from "./beneficiaryNavigation";
export { nazerNavigationItems } from "./nazerNavigation";
export { adminNavigationItems } from "./adminNavigation";
export { accountantNavigationItems } from "./accountantNavigation";
export { cashierNavigationItems } from "./cashierNavigation";
export { archivistNavigationItems } from "./archivistNavigation";

// Re-exports from registry
export {
  NAVIGATION_REGISTRY,
  REGISTERED_ROUTES,
  extractAllNavigationPaths,
  validateNavigationPath,
  auditNavigationPaths,
  getValidatedNavigation,
  getNavigationStats,
};

export type { NavigationItem } from "@/types/navigation";
export type { RegisteredRoute } from "./navigationRegistry";
