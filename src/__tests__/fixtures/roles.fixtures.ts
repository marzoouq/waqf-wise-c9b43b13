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

export function getPermissionsByCategory(
  category: PermissionCategory
): PermissionFixture[] {
  return [];
}
