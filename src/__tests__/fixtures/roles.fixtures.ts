/**
 * Roles & Permissions Fixtures
 * بيانات الأدوار والصلاحيات للاختبارات
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

import type { AppRole } from "@/types/roles";

// ==================== أنواع البيانات ====================
export interface RoleFixture {
  name: AppRole;
  label: string;
  description: string;
  permissions: string[];
  isAdmin: boolean;
  dashboardPath: string;
}

export interface PermissionFixture {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface RoleAssignmentScenario {
  userId: string;
  userName: string;
  currentRoles: AppRole[];
  roleToAdd?: AppRole;
  roleToRemove?: AppRole;
  expectedSuccess: boolean;
  errorMessage?: string;
}

export interface RolePermissionMapping {
  role: AppRole;
  permissions: string[];
}

export const permissionCategories = [
  "accounting",
  "beneficiaries",
  "properties",
  "archive",
  "reports",
  "admin",
  "funds",
] as const;

export type PermissionCategory = (typeof permissionCategories)[number];

// تصديرات فارغة
export const systemRoles: Record<string, RoleFixture> = {};
export const samplePermissions: PermissionFixture[] = [];
export const roleAssignmentScenarios: RoleAssignmentScenario[] = [];
export const rolePermissionMappings: RolePermissionMapping[] = [];

// Role capabilities for testing - exported as a typed record
export const roleCapabilities: Record<string, Record<string, boolean>> = {
  nazer: {
    canAccessNazerDashboard: true,
    canManageUsers: true,
    canPublishFiscalYear: true,
  },
  accountant: {
    canAccessNazerDashboard: false,
    canAccessAccountantDashboard: true,
    canManageJournalEntries: true,
  },
  beneficiary: {
    canAccessNazerDashboard: false,
    canAccessBeneficiaryPortal: true,
    canManageOtherBeneficiaries: false,
  },
};

// Helper functions
export function getPermissionsForRole(role: AppRole): string[] {
  return [];
}

export function roleHasPermission(role: AppRole, permission: string): boolean {
  return false;
}

export function getRolesWithPermission(permission: string): AppRole[] {
  return [];
}

// Grouped permissions by category - returns an object with category keys
export function getPermissionsByCategory(
  category?: PermissionCategory
): PermissionFixture[] | Record<string, PermissionFixture[]> {
  if (category) {
    return samplePermissions.filter(p => p.category === category);
  }
  // Return grouped permissions
  const grouped: Record<string, PermissionFixture[]> = {
    accounting: [],
    beneficiaries: [],
    properties: [],
    archive: [],
    reports: [],
    admin: [],
    funds: [],
  };
  return grouped;
}

// Alias for backward compatibility - returns grouped object when no args
export function groupPermissionsByCategory(): Record<string, PermissionFixture[]> {
  return getPermissionsByCategory() as Record<string, PermissionFixture[]>;
}
