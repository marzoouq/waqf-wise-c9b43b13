/**
 * usePermissionsManagement Hook
 * إدارة الصلاحيات التفصيلية للأدوار
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useUserRole";
import { Permission } from "@/hooks/usePermissions";

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

  // جلب جميع الصلاحيات
  const { data: allPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
  });

  // جلب صلاحيات الدور المحدد
  const { data: rolePermissions = [], isLoading: loadingRolePerms } = useQuery({
    queryKey: ["role-permissions", selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", selectedRole);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedRole,
  });

  // تحديث صلاحية
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      permissionId,
      granted,
    }: {
      permissionId: string;
      granted: boolean;
    }) => {
      const { error } = await supabase.from("role_permissions").upsert(
        {
          role: selectedRole,
          permission_id: permissionId,
          granted,
        },
        {
          onConflict: "role,permission_id",
        }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
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
