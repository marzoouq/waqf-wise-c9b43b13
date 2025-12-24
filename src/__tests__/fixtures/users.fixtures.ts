/**
 * بيانات المستخدمين للاختبار
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

import type { AppRole } from '@/types/roles';

// ==================== أنواع البيانات ====================
export interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  roles: AppRole[];
  expectedDashboard: string;
  phone?: string;
  isActive: boolean;
  beneficiaryId?: string;
}

export interface TestUserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface TestProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// تصديرات فارغة
export const testUsers: Record<string, TestUser> = {};
export const testUserRoles: TestUserRole[] = [];
export const testProfiles: TestProfile[] = [];

// Helper functions
export function getUserByRole(role: AppRole): TestUser | undefined {
  return undefined;
}

export function getAllTestUsers(): TestUser[] {
  return [];
}

export function getRolesForUser(userId: string): AppRole[] {
  return [];
}

export function userHasRole(userId: string, role: AppRole): boolean {
  return false;
}

export function getExpectedDashboard(roles: AppRole[]): string {
  return '/dashboard';
}

// سيناريوهات الاختبار
export const loginScenarios = {
  successfulLogins: [],
  failedLogins: [],
};

export const permissionScenarios = {
  nazerPermissions: {},
  accountantPermissions: {},
  beneficiaryPermissions: {},
};

export const unauthorizedAccessScenarios: any[] = [];

export const setupUsersMockData = (
  setMockTableData: <T>(table: string, data: T[]) => void
) => {};

export const createAuthContextMock = (user: TestUser) => ({});

// تصديرات المستخدمين الفردية
export const nazerUser: TestUser | undefined = undefined;
export const adminUser: TestUser | undefined = undefined;
export const accountantUser: TestUser | undefined = undefined;
export const cashierUser: TestUser | undefined = undefined;
export const archivistUser: TestUser | undefined = undefined;
export const mohamedMarzouq: TestUser | undefined = undefined;

export default testUsers;
