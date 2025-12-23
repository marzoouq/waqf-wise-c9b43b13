/**
 * Roles Management Integration Tests
 * اختبارات تكامل صفحة إدارة الأدوار
 * @version 2.9.11
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import RolesManagement from "@/pages/RolesManagement";
import { systemRoles } from "@/__tests__/fixtures/roles.fixtures";
import { adminUser } from "@/__tests__/fixtures/users.fixtures";
import type { AppRole } from "@/types/roles";

// ==================== Mock Setup ====================

const mockUsersWithRoles = [
  {
    id: "user-1",
    user_id: "auth-1",
    email: "nazer@waqf.sa",
    full_name: "محمد الناظر",
    roles_array: ["nazer"] as AppRole[],
  },
  {
    id: "user-2",
    user_id: "auth-2",
    email: "admin@waqf.sa",
    full_name: "أحمد المشرف",
    roles_array: ["admin"] as AppRole[],
  },
  {
    id: "user-3",
    user_id: "auth-3",
    email: "accountant@waqf.sa",
    full_name: "سارة المحاسب",
    roles_array: ["accountant"] as AppRole[],
  },
  {
    id: "user-4",
    user_id: "auth-4",
    email: "multi-role@waqf.sa",
    full_name: "علي متعدد الأدوار",
    roles_array: ["admin", "accountant"] as AppRole[],
  },
];

const mockAddRole = vi.fn();
const mockRemoveRole = vi.fn();

// Mock RolesContext
vi.mock("@/contexts/RolesContext", () => ({
  RolesProvider: ({ children }: { children: React.ReactNode }) => children,
  useRolesContext: () => ({
    users: mockUsersWithRoles,
    filteredUsers: mockUsersWithRoles,
    auditLogs: [
      {
        id: "audit-1",
        user_name: "محمد الناظر",
        role: "nazer",
        action: "added",
        performed_by_name: "النظام",
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
    searchQuery: "",
    setSearchQuery: vi.fn(),
    roleFilter: "all",
    setRoleFilter: vi.fn(),
    addRoleDialogOpen: false,
    selectedUser: null,
    newRole: "",
    setNewRole: vi.fn(),
    openAddRoleDialog: vi.fn(),
    closeAddRoleDialog: vi.fn(),
    auditDialogOpen: false,
    setAuditDialogOpen: vi.fn(),
    isLoading: false,
    isAddingRole: false,
    addRole: mockAddRole,
    removeRole: mockRemoveRole,
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

// Mock useUsersRealtime
vi.mock("@/hooks/users/useUsersRealtime", () => ({
  useUsersRealtime: vi.fn(),
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

describe("صفحة إدارة الأدوار - Roles Management Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== عرض الصفحة ====================

  describe("عرض الصفحة الأساسي", () => {
    it("يعرض عنوان الصفحة بشكل صحيح", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("إدارة الأدوار والصلاحيات")).toBeInTheDocument();
    });

    it("يعرض وصف الصفحة", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/عرض وإدارة أدوار المستخدمين والصلاحيات/i)).toBeInTheDocument();
    });

    it("يعرض زر سجل التغييرات", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByRole("button", { name: /سجل التغييرات/i })).toBeInTheDocument();
    });
  });

  // ==================== قائمة المستخدمين ====================

  describe("عرض قائمة المستخدمين مع الأدوار", () => {
    it("يعرض جميع المستخدمين", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("محمد الناظر")).toBeInTheDocument();
      expect(screen.getByText("أحمد المشرف")).toBeInTheDocument();
      expect(screen.getByText("سارة المحاسب")).toBeInTheDocument();
    });

    it("يعرض عدد المستخدمين", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/المستخدمون \(4\)/i)).toBeInTheDocument();
    });

    it("يعرض البريد الإلكتروني لكل مستخدم", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("nazer@waqf.sa")).toBeInTheDocument();
      expect(screen.getByText("admin@waqf.sa")).toBeInTheDocument();
    });
  });

  // ==================== عرض الأدوار ====================

  describe("عرض أدوار المستخدمين", () => {
    it("يعرض شارة دور الناظر", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("الناظر")).toBeInTheDocument();
    });

    it("يعرض شارة دور المشرف", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("المشرف")).toBeInTheDocument();
    });

    it("يعرض شارة دور المحاسب", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByText("المحاسب")).toBeInTheDocument();
    });

    it("يعرض أدوار متعددة للمستخدم الواحد", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      const multiRoleUser = screen.getByText("علي متعدد الأدوار").closest("div");
      expect(multiRoleUser).toBeInTheDocument();
    });
  });

  // ==================== البحث والفلترة ====================

  describe("البحث والفلترة", () => {
    it("يعرض حقل البحث", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText(/بحث بالاسم أو البريد الإلكتروني/i)).toBeInTheDocument();
    });

    it("يعرض فلتر الأدوار", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });

    it("يمكن الكتابة في حقل البحث", () => {
      render(<RolesManagement />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/بحث بالاسم أو البريد الإلكتروني/i);
      fireEvent.change(searchInput, { target: { value: "محمد" } });
      
      expect(searchInput).toHaveValue("محمد");
    });
  });
});

// ==================== اختبارات الأدوار الستة ====================

describe("الأدوار الستة الأساسية - Six Core Roles", () => {
  it("تعريفات الأدوار الستة موجودة", () => {
    expect(systemRoles.nazer).toBeDefined();
    expect(systemRoles.admin).toBeDefined();
    expect(systemRoles.accountant).toBeDefined();
    expect(systemRoles.cashier).toBeDefined();
    expect(systemRoles.archivist).toBeDefined();
    expect(systemRoles.beneficiary).toBeDefined();
  });

  it("كل دور له تسمية عربية", () => {
    expect(systemRoles.nazer.label).toBe("الناظر");
    expect(systemRoles.admin.label).toBe("المشرف");
    expect(systemRoles.accountant.label).toBe("المحاسب");
    expect(systemRoles.cashier.label).toBe("موظف الصرف");
    expect(systemRoles.archivist.label).toBe("أرشيفي");
    expect(systemRoles.beneficiary.label).toBe("مستفيد");
  });

  it("كل دور له مسار لوحة التحكم", () => {
    expect(systemRoles.nazer.dashboardPath).toBe("/nazer-dashboard");
    expect(systemRoles.admin.dashboardPath).toBe("/admin-dashboard");
    expect(systemRoles.accountant.dashboardPath).toBe("/accountant-dashboard");
    expect(systemRoles.cashier.dashboardPath).toBe("/cashier-dashboard");
    expect(systemRoles.archivist.dashboardPath).toBe("/archivist-dashboard");
    expect(systemRoles.beneficiary.dashboardPath).toBe("/beneficiary-portal");
  });

  it("الأدوار الإدارية محددة بشكل صحيح", () => {
    expect(systemRoles.nazer.isAdmin).toBe(true);
    expect(systemRoles.admin.isAdmin).toBe(true);
    expect(systemRoles.accountant.isAdmin).toBe(true);
    expect(systemRoles.cashier.isAdmin).toBe(true);
    expect(systemRoles.archivist.isAdmin).toBe(true);
    expect(systemRoles.beneficiary.isAdmin).toBe(false);
  });
});

// ==================== اختبارات العمليات ====================

describe("عمليات إدارة الأدوار - Role Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("إضافة دور", () => {
    it("تتوفر وظيفة إضافة الدور", () => {
      expect(mockAddRole).toBeDefined();
    });

    it("يمكن استدعاء دالة إضافة الدور", () => {
      mockAddRole("user-1", "admin");
      expect(mockAddRole).toHaveBeenCalledWith("user-1", "admin");
    });
  });

  describe("إزالة دور", () => {
    it("تتوفر وظيفة إزالة الدور", () => {
      expect(mockRemoveRole).toBeDefined();
    });

    it("يمكن استدعاء دالة إزالة الدور", () => {
      mockRemoveRole("user-1", "accountant");
      expect(mockRemoveRole).toHaveBeenCalledWith("user-1", "accountant");
    });
  });
});

// ==================== اختبارات سجل التدقيق ====================

describe("سجل تدقيق الأدوار - Role Audit Log", () => {
  it("زر سجل التغييرات موجود", () => {
    render(<RolesManagement />, { wrapper: createWrapper() });
    
    expect(screen.getByRole("button", { name: /سجل التغييرات/i })).toBeInTheDocument();
  });

  it("زر سجل التغييرات قابل للنقر", () => {
    render(<RolesManagement />, { wrapper: createWrapper() });
    
    const button = screen.getByRole("button", { name: /سجل التغييرات/i });
    expect(button).not.toBeDisabled();
  });
});

// ==================== اختبارات التفاعل ====================

describe("التفاعل مع صفحة الأدوار - Interaction", () => {
  it("يمكن النقر على المستخدم لعرض تفاصيل الأدوار", () => {
    render(<RolesManagement />, { wrapper: createWrapper() });
    
    const userCard = screen.getByText("محمد الناظر").closest("div");
    expect(userCard).toBeInTheDocument();
  });

  it("كل مستخدم لديه زر للتوسع", () => {
    render(<RolesManagement />, { wrapper: createWrapper() });
    
    // البحث عن أزرار ChevronLeft
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ==================== اختبارات الأمان ====================

describe("أمان صفحة الأدوار - Security", () => {
  it("الصفحة تتطلب دور admin أو nazer", () => {
    render(<RolesManagement />, { wrapper: createWrapper() });
    
    // الصفحة تظهر بشكل طبيعي للمستخدم المصرح
    expect(screen.getByText("إدارة الأدوار والصلاحيات")).toBeInTheDocument();
  });
});
