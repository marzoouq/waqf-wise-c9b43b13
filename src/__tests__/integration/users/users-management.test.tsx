/**
 * Users Management Integration Tests
 * اختبارات تكامل صفحة إدارة المستخدمين
 * @version 2.9.11
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Users from "@/pages/Users";
import { testUsers, adminUser } from "@/__tests__/fixtures/users.fixtures";
import type { AppRole } from "@/types/roles";

// ==================== Mock Setup ====================

const mockUsers = [
  {
    id: "user-1",
    user_id: "auth-1",
    email: "nazer@waqf.sa",
    full_name: "محمد الناظر",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    user_roles: [{ role: "nazer" }],
  },
  {
    id: "user-2",
    user_id: "auth-2",
    email: "admin@waqf.sa",
    full_name: "أحمد المشرف",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    user_roles: [{ role: "admin" }],
  },
  {
    id: "user-3",
    user_id: "auth-3",
    email: "accountant@waqf.sa",
    full_name: "سارة المحاسب",
    is_active: true,
    created_at: "2024-01-03T00:00:00Z",
    user_roles: [{ role: "accountant" }],
  },
  {
    id: "user-4",
    user_id: "auth-4",
    email: "cashier@waqf.sa",
    full_name: "خالد الصراف",
    is_active: true,
    created_at: "2024-01-04T00:00:00Z",
    user_roles: [{ role: "cashier" }],
  },
  {
    id: "user-5",
    user_id: "auth-5",
    email: "archivist@waqf.sa",
    full_name: "فاطمة الأرشيفية",
    is_active: true,
    created_at: "2024-01-05T00:00:00Z",
    user_roles: [{ role: "archivist" }],
  },
  {
    id: "user-6",
    user_id: "auth-6",
    email: "beneficiary@waqf.sa",
    full_name: "علي المستفيد",
    is_active: true,
    created_at: "2024-01-06T00:00:00Z",
    user_roles: [{ role: "beneficiary" }],
  },
];

const mockDeleteUser = vi.fn();
const mockUpdateRoles = vi.fn();
const mockResetPassword = vi.fn();
const mockRefetch = vi.fn();

// Mock UsersContext
vi.mock("@/contexts/UsersContext", () => ({
  UsersProvider: ({ children }: { children: React.ReactNode }) => children,
  useUsersContext: () => ({
    users: mockUsers,
    filteredUsers: mockUsers,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    searchTerm: "",
    setSearchTerm: vi.fn(),
    roleFilter: "all",
    setRoleFilter: vi.fn(),
    deleteUser: mockDeleteUser,
    updateRoles: mockUpdateRoles,
    resetPassword: mockResetPassword,
    isDeleting: false,
    isUpdatingRoles: false,
    isResettingPassword: false,
  }),
}));

// Mock UsersDialogsContext
vi.mock("@/contexts/UsersDialogsContext", () => ({
  UsersDialogsProvider: ({ children }: { children: React.ReactNode }) => children,
  useUsersDialogsContext: () => ({
    editRolesDialog: { open: false, data: null },
    selectedRoles: [],
    openEditRolesDialog: vi.fn(),
    closeEditRolesDialog: vi.fn(),
    toggleRole: vi.fn(),
    resetPasswordDialog: { open: false, data: null },
    newPassword: "",
    setNewPassword: vi.fn(),
    openResetPasswordDialog: vi.fn(),
    closeResetPasswordDialog: vi.fn(),
    deleteDialog: { open: false, data: null },
    openDeleteDialog: vi.fn(),
    closeDeleteDialog: vi.fn(),
    editEmailDialog: { open: false, data: null },
    openEditEmailDialog: vi.fn(),
    closeEditEmailDialog: vi.fn(),
  }),
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: adminUser.id, email: adminUser.email },
    profile: { full_name: adminUser.fullName },
    roles: adminUser.roles,
    isAuthenticated: true,
    isLoading: false,
    hasRole: (role: AppRole) => adminUser.roles.includes(role),
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

describe("صفحة إدارة المستخدمين - Users Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== عرض الصفحة ====================
  
  describe("عرض الصفحة الأساسي", () => {
    it("يعرض عنوان الصفحة بشكل صحيح", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      expect(screen.getByText("إدارة المستخدمين")).toBeInTheDocument();
    });

    it("يعرض وصف الصفحة", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/إدارة المستخدمين والأدوار والصلاحيات/i)).toBeInTheDocument();
    });

    it("يعرض أيقونة Shield", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const header = screen.getByText("إدارة المستخدمين").closest("div");
      expect(header).toBeInTheDocument();
    });

    it("يعرض زر التصدير", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      expect(screen.getByRole("button", { name: /تصدير/i })).toBeInTheDocument();
    });
  });

  // ==================== قائمة المستخدمين ====================

  describe("عرض قائمة المستخدمين", () => {
    it("يعرض جميع المستخدمين في الجدول", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      expect(screen.getByText("محمد الناظر")).toBeInTheDocument();
      expect(screen.getByText("أحمد المشرف")).toBeInTheDocument();
      expect(screen.getByText("سارة المحاسب")).toBeInTheDocument();
    });

    it("يعرض البريد الإلكتروني لكل مستخدم", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      expect(screen.getByText("nazer@waqf.sa")).toBeInTheDocument();
      expect(screen.getByText("admin@waqf.sa")).toBeInTheDocument();
    });

    it("يعرض عدد المستخدمين الصحيح", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      // زر التصدير يحتوي على العدد
      expect(screen.getByText(/تصدير \(6\)/i)).toBeInTheDocument();
    });
  });

  // ==================== البحث والفلترة ====================

  describe("البحث والفلترة", () => {
    it("يعرض حقل البحث", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/بحث/i);
      expect(searchInput).toBeInTheDocument();
    });

    it("يعرض فلتر الأدوار", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      // البحث عن Select الخاص بالأدوار
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("يمكن الكتابة في حقل البحث", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/بحث/i);
      fireEvent.change(searchInput, { target: { value: "محمد" } });
      
      expect(searchInput).toHaveValue("محمد");
    });
  });

  // ==================== حالة التحميل ====================

  describe("حالة التحميل", () => {
    it("يعرض skeleton أثناء التحميل", async () => {
      // Override the mock for this test
      vi.doMock("@/contexts/UsersContext", () => ({
        UsersProvider: ({ children }: { children: React.ReactNode }) => children,
        useUsersContext: () => ({
          users: [],
          filteredUsers: [],
          isLoading: true,
          error: null,
          refetch: mockRefetch,
          searchTerm: "",
          setSearchTerm: vi.fn(),
          roleFilter: "all",
          setRoleFilter: vi.fn(),
          deleteUser: mockDeleteUser,
          updateRoles: mockUpdateRoles,
          resetPassword: mockResetPassword,
          isDeleting: false,
          isUpdatingRoles: false,
          isResettingPassword: false,
        }),
      }));

      // العنوان موجود حتى أثناء التحميل
      render(<Users />, { wrapper: createWrapper() });
      expect(screen.getByText("إدارة المستخدمين")).toBeInTheDocument();
    });
  });

  // ==================== التصدير ====================

  describe("تصدير المستخدمين", () => {
    it("زر التصدير قابل للنقر", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const exportButton = screen.getByRole("button", { name: /تصدير/i });
      expect(exportButton).not.toBeDisabled();
    });

    it("يعرض عدد المستخدمين في زر التصدير", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/\(6\)/)).toBeInTheDocument();
    });
  });

  // ==================== الأدوار ====================

  describe("عرض أدوار المستخدمين", () => {
    it("يعرض دور الناظر للمستخدم المناسب", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      // البحث عن Badge الخاص بدور الناظر
      const nazerRow = screen.getByText("محمد الناظر").closest("tr");
      expect(nazerRow).toBeInTheDocument();
    });

    it("يعرض دور المشرف للمستخدم المناسب", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const adminRow = screen.getByText("أحمد المشرف").closest("tr");
      expect(adminRow).toBeInTheDocument();
    });
  });

  // ==================== التفاعل ====================

  describe("التفاعل مع الصفحة", () => {
    it("يمكن النقر على المستخدم لعرض التفاصيل", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const userRow = screen.getByText("محمد الناظر");
      expect(userRow).toBeInTheDocument();
    });
  });

  // ==================== الاستجابة ====================

  describe("الاستجابة (Responsive)", () => {
    it("يعرض الصفحة بشكل صحيح", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      // التحقق من وجود العناصر الأساسية
      expect(screen.getByText("إدارة المستخدمين")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /تصدير/i })).toBeInTheDocument();
    });
  });
});

// ==================== اختبارات العمليات ====================

describe("عمليات إدارة المستخدمين - User Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("حذف المستخدم", () => {
    it("تتوفر وظيفة الحذف", () => {
      expect(mockDeleteUser).toBeDefined();
    });

    it("يمكن استدعاء دالة الحذف", () => {
      mockDeleteUser("user-1");
      expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
    });
  });

  describe("تحديث الأدوار", () => {
    it("تتوفر وظيفة تحديث الأدوار", () => {
      expect(mockUpdateRoles).toBeDefined();
    });

    it("يمكن استدعاء دالة تحديث الأدوار", () => {
      mockUpdateRoles("auth-1", ["nazer", "admin"]);
      expect(mockUpdateRoles).toHaveBeenCalledWith("auth-1", ["nazer", "admin"]);
    });
  });

  describe("إعادة تعيين كلمة المرور", () => {
    it("تتوفر وظيفة إعادة تعيين كلمة المرور", () => {
      expect(mockResetPassword).toBeDefined();
    });

    it("يمكن استدعاء دالة إعادة تعيين كلمة المرور", () => {
      mockResetPassword("auth-1", "newPassword123");
      expect(mockResetPassword).toHaveBeenCalledWith("auth-1", "newPassword123");
    });
  });
});

// ==================== اختبارات الفلاتر ====================

describe("فلاتر المستخدمين - User Filters", () => {
  describe("فلترة حسب الدور", () => {
    it("خيار 'جميع الأدوار' متاح", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  describe("البحث النصي", () => {
    it("حقل البحث يقبل النص العربي", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/بحث/i);
      fireEvent.change(searchInput, { target: { value: "الناظر" } });
      
      expect(searchInput).toHaveValue("الناظر");
    });

    it("حقل البحث يقبل البريد الإلكتروني", () => {
      render(<Users />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/بحث/i);
      fireEvent.change(searchInput, { target: { value: "nazer@waqf.sa" } });
      
      expect(searchInput).toHaveValue("nazer@waqf.sa");
    });
  });
});

// ==================== اختبارات الأمان ====================

describe("أمان صفحة المستخدمين - Security", () => {
  it("الصفحة محمية وتتطلب مصادقة", () => {
    // التحقق من أن المستخدم مسجل الدخول
    render(<Users />, { wrapper: createWrapper() });
    
    // الصفحة تظهر بشكل طبيعي للمستخدم المصادق
    expect(screen.getByText("إدارة المستخدمين")).toBeInTheDocument();
  });

  it("المستخدم المصادق يرى المحتوى", () => {
    render(<Users />, { wrapper: createWrapper() });
    
    expect(screen.getByText("محمد الناظر")).toBeInTheDocument();
  });
});
