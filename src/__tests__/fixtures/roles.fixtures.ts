/**
 * Roles & Permissions Fixtures
 * بيانات الأدوار والصلاحيات للاختبارات
 * @version 2.9.11
 */

import type { AppRole, AllRole, WorkflowRole } from "@/types/roles";

// ==================== الأدوار الأساسية ====================

export interface RoleFixture {
  name: AppRole;
  label: string;
  description: string;
  permissions: string[];
  isAdmin: boolean;
  dashboardPath: string;
}

export const systemRoles: Record<AppRole, RoleFixture> = {
  nazer: {
    name: "nazer",
    label: "الناظر",
    description: "المسؤول الأعلى عن إدارة الوقف",
    permissions: [
      "users.manage",
      "roles.manage",
      "permissions.manage",
      "settings.manage",
      "reports.all",
      "distributions.approve",
      "fiscal_year.publish",
      "beneficiaries.manage",
      "properties.manage",
      "accounting.full",
    ],
    isAdmin: true,
    dashboardPath: "/nazer-dashboard",
  },
  admin: {
    name: "admin",
    label: "المشرف",
    description: "مشرف النظام بصلاحيات إدارية واسعة",
    permissions: [
      "users.manage",
      "roles.manage",
      "settings.manage",
      "reports.view",
      "beneficiaries.manage",
      "properties.manage",
    ],
    isAdmin: true,
    dashboardPath: "/admin-dashboard",
  },
  accountant: {
    name: "accountant",
    label: "المحاسب",
    description: "مسؤول العمليات المحاسبية والمالية",
    permissions: [
      "accounting.full",
      "journal_entries.manage",
      "invoices.manage",
      "payments.manage",
      "reports.financial",
      "distributions.view",
    ],
    isAdmin: true,
    dashboardPath: "/accountant-dashboard",
  },
  cashier: {
    name: "cashier",
    label: "موظف الصرف",
    description: "مسؤول عمليات الصرف والتحصيل",
    permissions: [
      "payments.create",
      "payments.view",
      "pos.manage",
      "vouchers.create",
      "collections.manage",
    ],
    isAdmin: true,
    dashboardPath: "/cashier-dashboard",
  },
  archivist: {
    name: "archivist",
    label: "أرشيفي",
    description: "مسؤول الأرشيف والوثائق",
    permissions: [
      "archive.manage",
      "documents.manage",
      "documents.upload",
      "documents.view",
    ],
    isAdmin: true,
    dashboardPath: "/archivist-dashboard",
  },
  beneficiary: {
    name: "beneficiary",
    label: "مستفيد",
    description: "مستفيد من الوقف",
    permissions: [
      "beneficiary.profile",
      "beneficiary.requests",
      "beneficiary.payments.view",
    ],
    isAdmin: false,
    dashboardPath: "/beneficiary-portal",
  },
  waqf_heir: {
    name: "waqf_heir",
    label: "وارث الوقف",
    description: "وارث في الوقف مع صلاحيات خاصة",
    permissions: [
      "beneficiary.profile",
      "beneficiary.requests",
      "beneficiary.payments.view",
      "disclosures.view",
    ],
    isAdmin: false,
    dashboardPath: "/beneficiary-portal",
  },
  user: {
    name: "user",
    label: "مستخدم",
    description: "مستخدم عادي بصلاحيات محدودة",
    permissions: ["profile.view", "profile.edit"],
    isAdmin: false,
    dashboardPath: "/dashboard",
  },
};

// ==================== الصلاحيات ====================

export interface PermissionFixture {
  id: string;
  name: string;
  category: string;
  description: string;
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

export const samplePermissions: PermissionFixture[] = [
  // المحاسبة
  {
    id: "perm-001",
    name: "accounting.view",
    category: "accounting",
    description: "عرض البيانات المحاسبية",
  },
  {
    id: "perm-002",
    name: "accounting.create",
    category: "accounting",
    description: "إنشاء قيود محاسبية",
  },
  {
    id: "perm-003",
    name: "accounting.edit",
    category: "accounting",
    description: "تعديل القيود المحاسبية",
  },
  {
    id: "perm-004",
    name: "accounting.delete",
    category: "accounting",
    description: "حذف القيود المحاسبية",
  },
  {
    id: "perm-005",
    name: "accounting.approve",
    category: "accounting",
    description: "اعتماد القيود المحاسبية",
  },

  // المستفيدين
  {
    id: "perm-010",
    name: "beneficiaries.view",
    category: "beneficiaries",
    description: "عرض بيانات المستفيدين",
  },
  {
    id: "perm-011",
    name: "beneficiaries.create",
    category: "beneficiaries",
    description: "إضافة مستفيد جديد",
  },
  {
    id: "perm-012",
    name: "beneficiaries.edit",
    category: "beneficiaries",
    description: "تعديل بيانات المستفيدين",
  },
  {
    id: "perm-013",
    name: "beneficiaries.delete",
    category: "beneficiaries",
    description: "حذف المستفيدين",
  },

  // العقارات
  {
    id: "perm-020",
    name: "properties.view",
    category: "properties",
    description: "عرض العقارات",
  },
  {
    id: "perm-021",
    name: "properties.create",
    category: "properties",
    description: "إضافة عقار جديد",
  },
  {
    id: "perm-022",
    name: "properties.edit",
    category: "properties",
    description: "تعديل بيانات العقارات",
  },
  {
    id: "perm-023",
    name: "properties.delete",
    category: "properties",
    description: "حذف العقارات",
  },

  // الأرشيف
  {
    id: "perm-030",
    name: "archive.view",
    category: "archive",
    description: "عرض الأرشيف",
  },
  {
    id: "perm-031",
    name: "archive.upload",
    category: "archive",
    description: "رفع وثائق للأرشيف",
  },
  {
    id: "perm-032",
    name: "archive.delete",
    category: "archive",
    description: "حذف من الأرشيف",
  },

  // التقارير
  {
    id: "perm-040",
    name: "reports.view",
    category: "reports",
    description: "عرض التقارير",
  },
  {
    id: "perm-041",
    name: "reports.export",
    category: "reports",
    description: "تصدير التقارير",
  },
  {
    id: "perm-042",
    name: "reports.create",
    category: "reports",
    description: "إنشاء تقارير مخصصة",
  },

  // الإدارة
  {
    id: "perm-050",
    name: "admin.users.view",
    category: "admin",
    description: "عرض المستخدمين",
  },
  {
    id: "perm-051",
    name: "admin.users.manage",
    category: "admin",
    description: "إدارة المستخدمين",
  },
  {
    id: "perm-052",
    name: "admin.roles.manage",
    category: "admin",
    description: "إدارة الأدوار",
  },
  {
    id: "perm-053",
    name: "admin.settings",
    category: "admin",
    description: "إعدادات النظام",
  },

  // الصناديق
  {
    id: "perm-060",
    name: "funds.view",
    category: "funds",
    description: "عرض الصناديق",
  },
  {
    id: "perm-061",
    name: "funds.manage",
    category: "funds",
    description: "إدارة الصناديق",
  },
  {
    id: "perm-062",
    name: "funds.transfer",
    category: "funds",
    description: "تحويل بين الصناديق",
  },
];

// ==================== سيناريوهات الاختبار ====================

export interface RoleAssignmentScenario {
  userId: string;
  userName: string;
  currentRoles: AppRole[];
  roleToAdd?: AppRole;
  roleToRemove?: AppRole;
  expectedSuccess: boolean;
  errorMessage?: string;
}

export const roleAssignmentScenarios: RoleAssignmentScenario[] = [
  {
    userId: "user-001",
    userName: "أحمد محمد",
    currentRoles: ["user"],
    roleToAdd: "accountant",
    expectedSuccess: true,
  },
  {
    userId: "user-002",
    userName: "سارة أحمد",
    currentRoles: ["accountant"],
    roleToAdd: "admin",
    expectedSuccess: true,
  },
  {
    userId: "user-003",
    userName: "محمد علي",
    currentRoles: ["admin", "accountant"],
    roleToRemove: "accountant",
    expectedSuccess: true,
  },
  {
    userId: "user-004",
    userName: "فاطمة حسن",
    currentRoles: ["nazer"],
    roleToAdd: "nazer", // محاولة إضافة دور موجود
    expectedSuccess: false,
    errorMessage: "الدور موجود بالفعل",
  },
];

// ==================== صلاحيات الأدوار ====================

export interface RolePermissionMapping {
  role: AppRole;
  permissions: string[];
}

export const rolePermissionMappings: RolePermissionMapping[] = [
  {
    role: "nazer",
    permissions: [
      "accounting.view",
      "accounting.create",
      "accounting.edit",
      "accounting.delete",
      "accounting.approve",
      "beneficiaries.view",
      "beneficiaries.create",
      "beneficiaries.edit",
      "beneficiaries.delete",
      "properties.view",
      "properties.create",
      "properties.edit",
      "properties.delete",
      "archive.view",
      "archive.upload",
      "archive.delete",
      "reports.view",
      "reports.export",
      "reports.create",
      "admin.users.view",
      "admin.users.manage",
      "admin.roles.manage",
      "admin.settings",
      "funds.view",
      "funds.manage",
      "funds.transfer",
    ],
  },
  {
    role: "admin",
    permissions: [
      "beneficiaries.view",
      "beneficiaries.create",
      "beneficiaries.edit",
      "properties.view",
      "properties.create",
      "properties.edit",
      "reports.view",
      "admin.users.view",
      "admin.users.manage",
      "admin.roles.manage",
    ],
  },
  {
    role: "accountant",
    permissions: [
      "accounting.view",
      "accounting.create",
      "accounting.edit",
      "accounting.approve",
      "reports.view",
      "reports.export",
      "funds.view",
      "funds.manage",
    ],
  },
  {
    role: "cashier",
    permissions: [
      "accounting.view",
      "accounting.create",
      "funds.view",
      "funds.transfer",
    ],
  },
  {
    role: "archivist",
    permissions: [
      "archive.view",
      "archive.upload",
      "archive.delete",
      "reports.view",
    ],
  },
  {
    role: "beneficiary",
    permissions: [],
  },
  {
    role: "waqf_heir",
    permissions: ["reports.view"],
  },
  {
    role: "user",
    permissions: [],
  },
];

// ==================== دوال مساعدة ====================

/**
 * الحصول على صلاحيات دور معين
 */
export function getPermissionsForRole(role: AppRole): string[] {
  return rolePermissionMappings.find((m) => m.role === role)?.permissions || [];
}

/**
 * التحقق من امتلاك دور لصلاحية معينة
 */
export function roleHasPermission(role: AppRole, permission: string): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * الحصول على جميع الأدوار التي تملك صلاحية معينة
 */
export function getRolesWithPermission(permission: string): AppRole[] {
  return rolePermissionMappings
    .filter((m) => m.permissions.includes(permission))
    .map((m) => m.role);
}

/**
 * الحصول على صلاحيات حسب الفئة
 */
export function getPermissionsByCategory(
  category: PermissionCategory
): PermissionFixture[] {
  return samplePermissions.filter((p) => p.category === category);
}

/**
 * تجميع الصلاحيات حسب الفئة
 */
export function groupPermissionsByCategory(): Record<string, PermissionFixture[]> {
  return samplePermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, PermissionFixture[]>
  );
}

// ==================== Mock Data للاختبارات ====================

export const mockUserWithRoles = {
  id: "mock-user-001",
  user_id: "mock-auth-001",
  email: "test@waqf.sa",
  full_name: "مستخدم اختباري",
  roles_array: ["accountant", "user"] as AppRole[],
};

export const mockRoleAuditLog = {
  id: "audit-001",
  user_id: "mock-user-001",
  user_name: "مستخدم اختباري",
  role: "accountant" as AppRole,
  action: "added",
  performed_by: "admin-001",
  performed_by_name: "المشرف",
  created_at: new Date().toISOString(),
};

export default {
  systemRoles,
  samplePermissions,
  permissionCategories,
  roleAssignmentScenarios,
  rolePermissionMappings,
  getPermissionsForRole,
  roleHasPermission,
  getRolesWithPermission,
  getPermissionsByCategory,
  groupPermissionsByCategory,
  mockUserWithRoles,
  mockRoleAuditLog,
};
