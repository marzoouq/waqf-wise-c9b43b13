/**
 * Roles Context - سياق الأدوار
 * لتقليل Props Drilling في صفحة إدارة الأدوار
 * @version 2.9.13
 */

import React, { createContext, useContext, ReactNode, useCallback, useState } from "react";
import { useRolesManagement, type UserWithRoles, type RoleAuditLog } from "@/hooks/users/useRolesManagement";
import type { AppRole } from "@/types/roles";

interface RolesContextValue {
  // البيانات
  users: UserWithRoles[];
  filteredUsers: UserWithRoles[];
  auditLogs: RoleAuditLog[];
  isLoading: boolean;
  
  // الفلترة
  searchQuery: string;
  setSearchQuery: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  
  // Dialog إضافة دور
  addRoleDialogOpen: boolean;
  selectedUser: UserWithRoles | null;
  newRole: AppRole;
  setNewRole: (role: AppRole) => void;
  openAddRoleDialog: (user: UserWithRoles) => void;
  closeAddRoleDialog: () => void;
  
  // Dialog سجل التغييرات
  auditDialogOpen: boolean;
  setAuditDialogOpen: (open: boolean) => void;
  
  // العمليات
  addRole: () => void;
  removeRole: (userId: string, role: string) => void;
  isAddingRole: boolean;
  isRemovingRole: boolean;
}

const RolesContext = createContext<RolesContextValue | null>(null);

export function RolesProvider({ children }: { children: ReactNode }) {
  const {
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
    isAddingRole,
    isRemovingRole,
    addRole,
    removeRole,
  } = useRolesManagement();

  const value: RolesContextValue = {
    users,
    filteredUsers,
    auditLogs,
    isLoading,
    
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
    
    addRole,
    removeRole,
    isAddingRole,
    isRemovingRole,
  };

  return (
    <RolesContext.Provider value={value}>
      {children}
    </RolesContext.Provider>
  );
}

export function useRolesContext() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRolesContext must be used within RolesProvider");
  }
  return context;
}
