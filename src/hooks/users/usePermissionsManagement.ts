/**
 * usePermissionsManagement Hook
 * إدارة الصلاحيات التفصيلية للأدوار
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useUserRole";
import { Permission } from "@/hooks/usePermissions";
import { AuthService } from "@/services/auth.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface RolePermissionState {
  permissionId: string;
  granted: boolean;
  modified: boolean;
}

export function usePermissionsManagement(initialRole: AppRole = "accountant") {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRole, setSelectedRole] = useState<AppRole>(initialRole);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modifications, setModifications] = useState<Map<string, RolePermissionState>>(new Map());

  // جلب جميع الصلاحيات باستخدام الخدمة
  const { data: allPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: QUERY_KEYS.ALL_PERMISSIONS,
    queryFn: async () => {
      const permissions = await AuthService.getAllPermissions();
      return permissions as Permission[];
    },
  });

  // جلب صلاحيات الدور المحدد باستخدام الخدمة
  const { data: rolePermissions = [], isLoading: loadingRolePerms } = useQuery({
    queryKey: QUERY_KEYS.ROLE_PERMISSIONS(selectedRole),
    queryFn: async () => {
      return AuthService.getRolePermissions(selectedRole);
    },
    enabled: !!selectedRole,
  });

  // تحديث صلاحية باستخدام الخدمة
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      permissionId,
      granted,
    }: {
      permissionId: string;
      granted: boolean;
    }) => {
      await AuthService.updateRolePermission(selectedRole, permissionId, granted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLE_PERMISSIONS(selectedRole) });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الصلاحيات بنجاح",
      });
      setModifications(new Map());
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث الصلاحيات",
        variant: "destructive",
      });
    },
  });

  // التحقق من منح الصلاحية
  const isPermissionGranted = (permissionId: string): boolean => {
    const modification = modifications.get(permissionId);
    if (modification !== undefined) {
      return modification.granted;
    }
    return rolePermissions.some(
      (rp) => rp.permission_id === permissionId && rp.granted
    );
  };

  // تبديل حالة الصلاحية
  const togglePermission = (permissionId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setModifications((prev) => {
      const newMap = new Map(prev);
      newMap.set(permissionId, {
        permissionId,
        granted: newValue,
        modified: true,
      });
      return newMap;
    });
  };

  // إعادة تعيين التعديلات
  const resetModifications = () => {
    setModifications(new Map());
  };

  // حفظ جميع التعديلات
  const saveAllModifications = async () => {
    const updates: Array<{ permissionId: string; granted: boolean }> = [];
    modifications.forEach((state, permissionId) => {
      if (state.modified) {
        updates.push({ permissionId, granted: state.granted });
      }
    });

    for (const update of updates) {
      await updatePermissionMutation.mutateAsync(update);
    }
  };

  // تصفية الصلاحيات
  const filteredPermissions = allPermissions.filter((perm) => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || perm.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // تجميع الصلاحيات حسب الفئة
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // استخراج الفئات الفريدة
  const categories = [...new Set(allPermissions.map((p) => p.category))];

  const hasModifications = modifications.size > 0;
  const isLoading = loadingPermissions || loadingRolePerms;

  return {
    // البيانات
    allPermissions,
    rolePermissions,
    filteredPermissions,
    groupedPermissions,
    categories,

    // الفلاتر
    selectedRole,
    setSelectedRole,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,

    // التعديلات
    modifications,
    hasModifications,
    
    // الحالة
    isLoading,
    isSaving: updatePermissionMutation.isPending,

    // العمليات
    isPermissionGranted,
    togglePermission,
    resetModifications,
    saveAllModifications,
  };
}
