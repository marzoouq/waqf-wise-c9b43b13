/**
 * Navigation Registry - السجل المركزي للتنقل
 * مصدر الحقيقة الموحد لجميع مسارات التنقل
 * @version 1.0.0
 */

import type { AppRole } from "@/types/roles";
import type { NavigationItem } from "@/types/navigation";

// استيراد جميع إعدادات التنقل
import { adminNavigationItems } from "./adminNavigation";
import { nazerNavigationItems } from "./nazerNavigation";
import { beneficiaryNavigationItems } from "./beneficiaryNavigation";
import { accountantNavigationItems } from "./accountantNavigation";
import { cashierNavigationItems } from "./cashierNavigation";
import { archivistNavigationItems } from "./archivistNavigation";

/**
 * قائمة المسارات الفعلية المسجلة في التطبيق
 * يجب تحديثها عند إضافة routes جديدة
 */
export const REGISTERED_ROUTES = [
  // Dashboards
  "/nazer-dashboard",
  "/admin-dashboard",
  "/accountant-dashboard",
  "/cashier-dashboard",
  "/archivist-dashboard",
  "/beneficiary-portal",
  "/developer-dashboard",
  
  // Core Pages
  "/properties",
  "/contracts",
  "/tenants",
  "/beneficiaries",
  "/users",
  "/families",
  
  // Accounting
  "/accounting",
  "/journal-entries",
  "/payment-vouchers",
  "/invoices",
  "/reports",
  "/financial-reports",
  "/budgets",
  "/fiscal-years",
  "/all-transactions",
  "/bank-transfers",
  
  // Security & Admin
  "/security",
  "/audit-logs",
  "/system-error-logs",
  "/settings",
  "/settings/roles",
  "/settings/permissions",
  
  // Governance
  "/approvals",
  "/governance/decisions",
  "/governance/boards",
  "/governance/policies",
  "/archive",
  "/documents",
  "/folders",
  
  // POS
  "/pos",
  
  // Beneficiary specific
  "/beneficiary-profile",
  "/beneficiary-settings",
  "/beneficiary-support",
  "/beneficiary/requests",
  
  // Loans & Maintenance
  "/loans",
  "/maintenance",
  
  // Waqf
  "/waqf-units",
] as const;

export type RegisteredRoute = typeof REGISTERED_ROUTES[number];

/**
 * خريطة التنقل حسب الدور
 */
export const NAVIGATION_REGISTRY: Record<string, readonly NavigationItem[]> = {
  nazer: nazerNavigationItems,
  admin: adminNavigationItems,
  accountant: accountantNavigationItems,
  cashier: cashierNavigationItems,
  archivist: archivistNavigationItems,
  beneficiary: beneficiaryNavigationItems,
  waqf_heir: beneficiaryNavigationItems,
};

/**
 * استخراج جميع المسارات من التنقل
 */
export function extractAllNavigationPaths(): string[] {
  const paths = new Set<string>();
  
  Object.values(NAVIGATION_REGISTRY).forEach(items => {
    items.forEach(item => {
      // استخراج المسار الأساسي (بدون query params)
      const basePath = item.path.split('?')[0];
      paths.add(basePath);
      
      // استخراج matchPaths
      item.matchPaths?.forEach(mp => {
        const baseMatchPath = mp.split('?')[0];
        paths.add(baseMatchPath);
      });
    });
  });
  
  return Array.from(paths);
}

/**
 * التحقق من صحة مسار التنقل
 */
export function validateNavigationPath(path: string): {
  isValid: boolean;
  basePath: string;
  hasQueryParams: boolean;
  matchedRoute: string | null;
} {
  const [basePath, queryString] = path.split('?');
  const hasQueryParams = !!queryString;
  
  // البحث عن تطابق في المسارات المسجلة
  const matchedRoute = REGISTERED_ROUTES.find(route => {
    if (route === basePath) return true;
    // التحقق من المسارات الفرعية
    if (basePath.startsWith(route + '/')) return true;
    return false;
  }) || null;
  
  return {
    isValid: matchedRoute !== null,
    basePath,
    hasQueryParams,
    matchedRoute,
  };
}

/**
 * تدقيق جميع مسارات التنقل
 */
export function auditNavigationPaths(): {
  valid: string[];
  invalid: string[];
  warnings: string[];
} {
  const paths = extractAllNavigationPaths();
  const valid: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];
  
  paths.forEach(path => {
    const validation = validateNavigationPath(path);
    
    if (validation.isValid) {
      valid.push(path);
    } else {
      invalid.push(path);
    }
    
    // تحذيرات للمسارات الفارغة
    if (path === '' || path === '/') {
      warnings.push(`Empty or root path detected: "${path}"`);
    }
  });
  
  return { valid, invalid, warnings };
}

/**
 * الحصول على تنقل الدور مع التحقق
 */
export function getValidatedNavigation(role: AppRole | string): {
  items: readonly NavigationItem[];
  audit: ReturnType<typeof auditNavigationPaths>;
} {
  const items = NAVIGATION_REGISTRY[role] || [];
  
  // تدقيق المسارات الخاصة بهذا الدور فقط
  const rolePaths = new Set<string>();
  items.forEach(item => {
    rolePaths.add(item.path.split('?')[0]);
    item.matchPaths?.forEach(mp => rolePaths.add(mp.split('?')[0]));
  });
  
  const valid: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];
  
  rolePaths.forEach(path => {
    const validation = validateNavigationPath(path);
    if (validation.isValid) {
      valid.push(path);
    } else {
      invalid.push(path);
    }
  });
  
  return {
    items,
    audit: { valid, invalid, warnings },
  };
}

/**
 * إحصائيات التنقل
 */
export function getNavigationStats(): {
  totalRoles: number;
  totalItems: number;
  totalPaths: number;
  pathsPerRole: Record<string, number>;
} {
  const pathsPerRole: Record<string, number> = {};
  let totalItems = 0;
  
  Object.entries(NAVIGATION_REGISTRY).forEach(([role, items]) => {
    pathsPerRole[role] = items.length;
    totalItems += items.length;
  });
  
  return {
    totalRoles: Object.keys(NAVIGATION_REGISTRY).length,
    totalItems,
    totalPaths: extractAllNavigationPaths().length,
    pathsPerRole,
  };
}
