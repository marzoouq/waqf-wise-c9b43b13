/**
 * Users Context - سياق المستخدمين
 * لتقليل Props Drilling في مكونات المستخدمين
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useUsersManagement, type UserProfile } from "@/hooks/useUsersManagement";
import type { AppRole } from "@/types/roles";

interface UsersContextValue {
  // البيانات
  users: UserProfile[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  
  // العمليات
  deleteUser: (userId: string) => void;
  updateRoles: (userId: string, roles: AppRole[]) => void;
  updateStatus: (userId: string, isActive: boolean) => void;
  resetPassword: (userId: string, password: string) => void;
  
  // حالات التحميل
  isDeleting: boolean;
  isUpdatingRoles: boolean;
  isUpdatingStatus: boolean;
  isResettingPassword: boolean;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
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

  const value: UsersContextValue = {
    users,
    isLoading,
    error: error as Error | null,
    refetch,
    
    deleteUser: (userId: string) => deleteUserMutation.mutate(userId),
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
