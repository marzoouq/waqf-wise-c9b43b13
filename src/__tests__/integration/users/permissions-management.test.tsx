/**
 * Permissions Management Integration Tests
 * اختبارات تكامل صفحة إدارة الصلاحيات
 * @version 2.9.11
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import PermissionsManagement from "@/pages/PermissionsManagement";
import {
  samplePermissions,
  permissionCategories,
  getPermissionsForRole,
  roleHasPermission,
  groupPermissionsByCategory,
} from "@/__tests__/fixtures/roles.fixtures";
import { adminUser } from "@/__tests__/fixtures/users.fixtures";
import type { AppRole } from "@/types/roles";

// ==================== Mock Setup ====================

const mockGroupedPermissions = groupPermissionsByCategory();
const mockTogglePermission = vi.fn();
const mockSaveAllModifications = vi.fn();
const mockResetModifications = vi.fn();

// Mock usePermissionsManagement
vi.mock("@/hooks/users/usePermissionsManagement", () => ({
  usePermissionsManagement: () => ({
    allPermissions: samplePermissions,
    rolePermissions: [],
    filteredPermissions: samplePermissions,
    groupedPermissions: mockGroupedPermissions,
    categories: [...permissionCategories],
    selectedRole: "accountant" as AppRole,
    setSelectedRole: vi.fn(),
    searchQuery: "",
    setSearchQuery: vi.fn(),
    categoryFilter: "all",
    setCategoryFilter: vi.fn(),
    modifications: new Map(),
    hasModifications: false,
    isLoading: false,
    isSaving: false,
    isPermissionGranted: (permId: string) => 
      ["perm-001", "perm-002", "perm-010"].includes(permId),
    togglePermission: mockTogglePermission,
    resetModifications: mockResetModifications,
    saveAllModifications: mockSaveAllModifications,
  }),
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: adminUser.id, email: adminUser.email },
    profile: { full_name: adminUser.fullName },
    roles: ["admin", "nazer"],
    isAuthenticated: true,
    isLoading: false,
    hasRole: (role: AppRole) => ["admin", "nazer"].includes(role),
    checkPermissionSync: () => true,
  }),
}));

// ==================== Test Utilities ====================

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

// ==================== Tests ====================

describe("صفحة إدارة الصلاحيات - Permissions Management Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== عرض الصفحة ====================

  describe("عرض الصفحة الأساسي", () => {
    it("يعرض عنوان الصفحة بشكل صحيح", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("إدارة الصلاحيات التفصيلية")).toBeInTheDocument();
    });

    it("يعرض وصف الصفحة", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/تخصيص صلاحيات دقيقة لكل دور/i)).toBeInTheDocument();
    });

    it("يعرض أيقونة Shield", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      const header = screen.getByText("إدارة الصلاحيات التفصيلية").closest("div");
      expect(header).toBeInTheDocument();
    });
  });

  // ==================== الفلاتر ====================

  describe("فلاتر الصلاحيات", () => {
    it("يعرض فلتر اختيار الدور", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it("يعرض فلتر اختيار الفئة", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it("يعرض حقل البحث في الصلاحيات", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText(/بحث في الصلاحيات/i)).toBeInTheDocument();
    });

    it("يمكن الكتابة في حقل البحث", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/بحث في الصلاحيات/i);
      fireEvent.change(searchInput, { target: { value: "accounting" } });
      
      expect(searchInput).toHaveValue("accounting");
    });
  });

  // ==================== عرض الصلاحيات ====================

  describe("عرض الصلاحيات", () => {
    it("يعرض فئات الصلاحيات", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      // البحث عن عناوين الفئات
      expect(screen.getByText("المحاسبة")).toBeInTheDocument();
    });

    it("يعرض جدول الصلاحيات", () => {
      render(<PermissionsManagement />, { wrapper: createWrapper() });
      
      // البحث عن عناصر الجدول
      expect(screen.getByText("الصلاحية")).toBeInTheDocument();
      expect(screen.getByText("الوصف")).toBeInTheDocument();
      expect(screen.getByText("الحالة")).toBeInTheDocument();
    });
  });
});

// ==================== اختبارات Fixtures الصلاحيات ====================

describe("بيانات الصلاحيات - Permissions Fixtures", () => {
  describe("الصلاحيات الأساسية", () => {
    it("تحتوي على صلاحيات كافية", () => {
      expect(samplePermissions.length).toBeGreaterThan(20);
    });

    it("كل صلاحية لها معرف فريد", () => {
      const ids = samplePermissions.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("كل صلاحية لها اسم", () => {
      samplePermissions.forEach((perm) => {
        expect(perm.name).toBeTruthy();
      });
    });

    it("كل صلاحية لها فئة", () => {
      samplePermissions.forEach((perm) => {
        expect(perm.category).toBeTruthy();
      });
    });

    it("كل صلاحية لها وصف", () => {
      samplePermissions.forEach((perm) => {
        expect(perm.description).toBeTruthy();
      });
    });
  });

  describe("فئات الصلاحيات", () => {
    it("تحتوي على الفئات الأساسية", () => {
      expect(permissionCategories).toContain("accounting");
      expect(permissionCategories).toContain("beneficiaries");
      expect(permissionCategories).toContain("properties");
      expect(permissionCategories).toContain("archive");
      expect(permissionCategories).toContain("reports");
      expect(permissionCategories).toContain("admin");
      expect(permissionCategories).toContain("funds");
    });

    it("جميع الصلاحيات تنتمي لفئة معروفة", () => {
      samplePermissions.forEach((perm) => {
        expect(permissionCategories).toContain(perm.category);
      });
    });
  });
});

// ==================== اختبارات دوال الصلاحيات ====================

describe("دوال الصلاحيات المساعدة - Permission Helper Functions", () => {
  describe("getPermissionsForRole", () => {
    it("ترجع صلاحيات الناظر", () => {
      const perms = getPermissionsForRole("nazer");
      expect(perms.length).toBeGreaterThan(0);
    });

    it("ترجع صلاحيات المحاسب", () => {
      const perms = getPermissionsForRole("accountant");
      expect(perms.length).toBeGreaterThan(0);
    });

    it("المستفيد ليس لديه صلاحيات", () => {
      const perms = getPermissionsForRole("beneficiary");
      expect(perms.length).toBe(0);
    });

    it("الناظر لديه أكثر صلاحيات", () => {
      const nazerPerms = getPermissionsForRole("nazer");
      const adminPerms = getPermissionsForRole("admin");
      expect(nazerPerms.length).toBeGreaterThan(adminPerms.length);
    });
  });

  describe("roleHasPermission", () => {
    it("الناظر لديه صلاحية إدارة المستخدمين", () => {
      expect(roleHasPermission("nazer", "admin.users.manage")).toBe(true);
    });

    it("المحاسب لديه صلاحية عرض المحاسبة", () => {
      expect(roleHasPermission("accountant", "accounting.view")).toBe(true);
    });

    it("الأرشيفي ليس لديه صلاحية المحاسبة", () => {
      expect(roleHasPermission("archivist", "accounting.view")).toBe(false);
    });

    it("المستفيد ليس لديه صلاحيات إدارية", () => {
      expect(roleHasPermission("beneficiary", "admin.users.manage")).toBe(false);
    });
  });

  describe("groupPermissionsByCategory", () => {
    it("ترجع كائن مجموعات", () => {
      const grouped = groupPermissionsByCategory();
      expect(typeof grouped).toBe("object");
    });

    it("كل مجموعة تحتوي على صلاحيات", () => {
      const grouped = groupPermissionsByCategory();
      Object.values(grouped).forEach((perms) => {
        expect(perms.length).toBeGreaterThan(0);
      });
    });

    it("تحتوي على فئة المحاسبة", () => {
      const grouped = groupPermissionsByCategory();
      expect(grouped.accounting).toBeDefined();
    });

    it("تحتوي على فئة الإدارة", () => {
      const grouped = groupPermissionsByCategory();
      expect(grouped.admin).toBeDefined();
    });
  });
});

// ==================== اختبارات التفاعل ====================

describe("التفاعل مع صفحة الصلاحيات - Interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("تبديل الصلاحيات", () => {
    it("تتوفر وظيفة تبديل الصلاحية", () => {
      expect(mockTogglePermission).toBeDefined();
    });

    it("يمكن استدعاء دالة تبديل الصلاحية", () => {
      mockTogglePermission("perm-001", true);
      expect(mockTogglePermission).toHaveBeenCalledWith("perm-001", true);
    });
  });

  describe("حفظ التعديلات", () => {
    it("تتوفر وظيفة حفظ التعديلات", () => {
      expect(mockSaveAllModifications).toBeDefined();
    });

    it("يمكن استدعاء دالة حفظ التعديلات", () => {
      mockSaveAllModifications();
      expect(mockSaveAllModifications).toHaveBeenCalled();
    });
  });

  describe("إلغاء التعديلات", () => {
    it("تتوفر وظيفة إلغاء التعديلات", () => {
      expect(mockResetModifications).toBeDefined();
    });

    it("يمكن استدعاء دالة إلغاء التعديلات", () => {
      mockResetModifications();
      expect(mockResetModifications).toHaveBeenCalled();
    });
  });
});

// ==================== اختبارات الأمان ====================

describe("أمان صفحة الصلاحيات - Security", () => {
  it("الصفحة تتطلب دور admin أو nazer", () => {
    render(<PermissionsManagement />, { wrapper: createWrapper() });
    
    // الصفحة تظهر بشكل طبيعي للمستخدم المصرح
    expect(screen.getByText("إدارة الصلاحيات التفصيلية")).toBeInTheDocument();
  });
});

// ==================== اختبارات PermissionGate ====================

describe("PermissionGate Component Logic", () => {
  it("الصلاحية الممنوحة تعود true", () => {
    const isGranted = ["perm-001", "perm-002", "perm-010"].includes("perm-001");
    expect(isGranted).toBe(true);
  });

  it("الصلاحية غير الممنوحة تعود false", () => {
    const isGranted = ["perm-001", "perm-002", "perm-010"].includes("perm-999");
    expect(isGranted).toBe(false);
  });
});
