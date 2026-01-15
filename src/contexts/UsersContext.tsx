/**
 * Users Context - سياق المستخدمين
 * لتقليل Props Drilling في مكونات المستخدمين
 * @version 2.9.13
 * 
 * التحسينات:
 * - إضافة فلتر نوع المستخدم (staff/beneficiaries)
 */

import React, { createContext, useContext, ReactNode, useCallback } from "react";
import { useUsersManagement, type UserProfile } from "@/hooks/users/useUsersManagement";
import { useUsersFilter, type UserTypeFilter } from "@/hooks/users/useUsersFilter";
import type { AppRole } from "@/types/roles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/ui/use-toast";

interface UsersContextValue {
  // البيانات
  users: UserProfile[];
  filteredUsers: UserProfile[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  
  // الفلترة
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  userTypeFilter: UserTypeFilter;
  setUserTypeFilter: (type: UserTypeFilter) => void;
  staffCount: number;
  beneficiariesCount: number;
  
  // العمليات
  deleteUser: (user: UserProfile) => void;
  updateRoles: (userId: string, roles: AppRole[]) => void;
  updateStatus: (userId: string, isActive: boolean) => void;
  resetPassword: (userId: string, password: string) => void;
  
  // حالات التحميل
  isDeleting: boolean;
  isUpdatingRoles: boolean;
  isUpdatingStatus: boolean;
  isResettingPassword: boolean;
  
  // المستخدم الحالي
  currentUserId?: string;
  
  // التصدير
  showNotAvailableToast: () => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const {
    users,
    isLoading,
    error,
    refetch,
    deleteUser: deleteUserMutation,
    updateRoles: updateRolesMutation,
    updateStatus: updateStatusMutation,
    resetPassword: resetPasswordMutation,
    isDeleting,
    isUpdatingRoles,
    isUpdatingStatus,
    isResettingPassword,
  } = useUsersManagement();

  const {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    userTypeFilter,
    setUserTypeFilter,
    staffCount,
    beneficiariesCount,
  } = useUsersFilter({ users });

  // حذف المستخدم - موحد (بدون تكرار التحقق من الصلاحيات)
  const handleDeleteUser = useCallback((user: UserProfile) => {
    deleteUserMutation.mutate(user.user_id);
  }, [deleteUserMutation]);

  const showNotAvailableToast = useCallback(() => {
    toast({ 
      title: "غير متاح", 
      description: "هذا المستخدم ليس لديه حساب مفعّل في النظام", 
      variant: "destructive" 
    });
  }, [toast]);

  const value: UsersContextValue = {
    users,
    filteredUsers,
    isLoading,
    error: error as Error | null,
    refetch,
    
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    userTypeFilter,
    setUserTypeFilter,
    staffCount,
    beneficiariesCount,
    
    deleteUser: handleDeleteUser,
    updateRoles: (userId: string, roles: AppRole[]) => 
      updateRolesMutation.mutate({ userId, roles }),
    updateStatus: (userId: string, isActive: boolean) => 
      updateStatusMutation.mutate({ userId, isActive }),
    resetPassword: (userId: string, password: string) => 
      resetPasswordMutation.mutate({ userId, password }),
    
    isDeleting,
    isUpdatingRoles,
    isUpdatingStatus,
    isResettingPassword,
    
    currentUserId: currentUser?.id,
    showNotAvailableToast,
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsersContext() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within UsersProvider");
  }
  return context;
}
