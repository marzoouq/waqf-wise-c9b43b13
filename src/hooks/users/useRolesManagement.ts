/**
 * useRolesManagement Hook
 * إدارة أدوار المستخدمين
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useUserRole";
import { UserService } from "@/services";
import { invalidateUserQueries } from "@/lib/query-invalidation";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UserWithRoles {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  roles: string[];
  roles_array: string[];
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

  const { data: users = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.USERS_PROFILES_CACHE,
    queryFn: () => UserService.getUsersWithRoles(),
    staleTime: 30 * 1000,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: QUERY_KEYS.USER_ROLES_AUDIT,
    queryFn: () => UserService.getRolesAuditLog(),
  });

  const addRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      UserService.addRole(userId, role as "accountant" | "admin" | "archivist" | "beneficiary" | "cashier" | "nazer" | "user" | "waqf_heir"),
    onSuccess: () => {
      invalidateUserQueries(queryClient);
      toast({ title: "تمت الإضافة", description: "تم إضافة الدور بنجاح" });
      setAddRoleDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message || "فشلت إضافة الدور", variant: "destructive" });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      UserService.removeRole(userId, role as "accountant" | "admin" | "archivist" | "beneficiary" | "cashier" | "nazer" | "user" | "waqf_heir"),
    onSuccess: () => {
      invalidateUserQueries(queryClient);
      toast({ title: "تم الحذف", description: "تم حذف الدور بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message || "فشل حذف الدور", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.roles_array?.includes(roleFilter as AppRole);
    return matchesSearch && matchesRole;
  });

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
      addRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  const removeRole = (userId: string, role: string) => {
    removeRoleMutation.mutate({ userId, role });
  };

  return {
    users,
    filteredUsers,
    auditLogs,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    addRoleDialogOpen,
    selectedUser,
    newRole,
    setNewRole,
    openAddRoleDialog,
    closeAddRoleDialog,
    auditDialogOpen,
    setAuditDialogOpen,
    isLoading,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    addRole,
    removeRole,
  };
}
