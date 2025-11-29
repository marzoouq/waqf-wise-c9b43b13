/**
 * useRolesManagement Hook
 * إدارة أدوار المستخدمين
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useUserRole";

export interface UserWithRoles {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  roles: AppRole[];
  roles_array: AppRole[];
  roles_count: number;
}

export interface RoleAuditLog {
  id: string;
  user_id: string;
  role: string;
  action: string;
  changed_by: string;
  changed_by_name: string | null;
  changed_at: string;
}

export function useRolesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);

  // جلب المستخدمين مع أدوارهم
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-profiles-cache"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users_profiles_cache")
        .select("*")
        .order("user_created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((u) => ({
        id: u.user_id,
        user_id: u.user_id,
        full_name: u.full_name || u.email || "",
        email: u.email || "",
        avatar_url: "",
        roles: Array.isArray(u.roles) ? u.roles : [],
        roles_array: Array.isArray(u.roles) ? u.roles : [],
        roles_count: Array.isArray(u.roles) ? u.roles.length : 0,
      })) as UserWithRoles[];
    },
    staleTime: 30 * 1000,
  });

  // جلب سجل تغييرات الأدوار
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["user-roles-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles_audit")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as RoleAuditLog[];
    },
  });

  // إضافة دور
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-profiles-cache"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles-audit"] });
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة الدور بنجاح",
      });
      setAddRoleDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشلت إضافة الدور",
        variant: "destructive",
      });
    },
  });

  // حذف دور
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-profiles-cache"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles-audit"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الدور بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل حذف الدور",
        variant: "destructive",
      });
    },
  });

  // تصفية المستخدمين
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      user.roles_array?.includes(roleFilter as AppRole);
    return matchesSearch && matchesRole;
  });

  // دوال مساعدة
  const openAddRoleDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setAddRoleDialogOpen(true);
  };

  const closeAddRoleDialog = () => {
    setAddRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const addRole = () => {
    if (selectedUser) {
      addRoleMutation.mutate({
        userId: selectedUser.id,
        role: newRole,
      });
    }
  };

  const removeRole = (userId: string, role: AppRole) => {
    removeRoleMutation.mutate({ userId, role });
  };

  return {
    // البيانات
    users,
    filteredUsers,
    auditLogs,
    
    // الفلاتر
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,

    // حالة Dialog إضافة الدور
    addRoleDialogOpen,
    selectedUser,
    newRole,
    setNewRole,
    openAddRoleDialog,
    closeAddRoleDialog,

    // حالة Dialog سجل التدقيق
    auditDialogOpen,
    setAuditDialogOpen,

    // الحالة
    isLoading,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,

    // العمليات
    addRole,
    removeRole,
  };
}
