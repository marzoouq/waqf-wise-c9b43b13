/**
 * Users Dialogs Context - سياق حوارات المستخدمين
 * لإدارة حالة جميع الحوارات في صفحة المستخدمين
 * @version 2.9.12
 */

import React, { createContext, useContext, ReactNode, useState, useCallback } from "react";
import type { UserProfile } from "@/types/auth";
import type { AppRole } from "@/types/roles";

interface DialogState<T> {
  open: boolean;
  data: T | null;
}

interface UsersDialogsContextValue {
  // Edit Roles Dialog
  editRolesDialog: DialogState<UserProfile>;
  selectedRoles: AppRole[];
  setSelectedRoles: (roles: AppRole[]) => void;
  openEditRolesDialog: (user: UserProfile) => void;
  closeEditRolesDialog: () => void;
  toggleRole: (role: AppRole) => void;
  
  // Reset Password Dialog
  resetPasswordDialog: DialogState<UserProfile>;
  newPassword: string;
  setNewPassword: (password: string) => void;
  openResetPasswordDialog: (user: UserProfile) => void;
  closeResetPasswordDialog: () => void;
  
  // Delete Dialog
  deleteDialog: DialogState<UserProfile>;
  openDeleteDialog: (user: UserProfile) => void;
  closeDeleteDialog: () => void;
  
  // Edit Email Dialog
  editEmailDialog: DialogState<UserProfile>;
  openEditEmailDialog: (user: UserProfile) => void;
  closeEditEmailDialog: () => void;
}

const UsersDialogsContext = createContext<UsersDialogsContextValue | null>(null);

export function UsersDialogsProvider({ children }: { children: ReactNode }) {
  // Edit Roles Dialog State
  const [editRolesDialog, setEditRolesDialog] = useState<DialogState<UserProfile>>({
    open: false,
    data: null,
  });
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);

  // Reset Password Dialog State
  const [resetPasswordDialog, setResetPasswordDialog] = useState<DialogState<UserProfile>>({
    open: false,
    data: null,
  });
  const [newPassword, setNewPassword] = useState("");

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<DialogState<UserProfile>>({
    open: false,
    data: null,
  });

  // Edit Email Dialog State
  const [editEmailDialog, setEditEmailDialog] = useState<DialogState<UserProfile>>({
    open: false,
    data: null,
  });

  // Edit Roles Handlers
  const openEditRolesDialog = useCallback((user: UserProfile) => {
    setEditRolesDialog({ open: true, data: user });
    setSelectedRoles(user.user_roles?.map(r => r.role as AppRole) || ["user"]);
  }, []);

  const closeEditRolesDialog = useCallback(() => {
    setEditRolesDialog({ open: false, data: null });
    setSelectedRoles([]);
  }, []);

  const toggleRole = useCallback((role: AppRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  }, []);

  // Reset Password Handlers
  const openResetPasswordDialog = useCallback((user: UserProfile) => {
    setResetPasswordDialog({ open: true, data: user });
    setNewPassword("");
  }, []);

  const closeResetPasswordDialog = useCallback(() => {
    setResetPasswordDialog({ open: false, data: null });
    setNewPassword("");
  }, []);

  // Delete Handlers
  const openDeleteDialog = useCallback((user: UserProfile) => {
    setDeleteDialog({ open: true, data: user });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, data: null });
  }, []);

  // Edit Email Handlers
  const openEditEmailDialog = useCallback((user: UserProfile) => {
    setEditEmailDialog({ open: true, data: user });
  }, []);

  const closeEditEmailDialog = useCallback(() => {
    setEditEmailDialog({ open: false, data: null });
  }, []);

  const value: UsersDialogsContextValue = {
    editRolesDialog,
    selectedRoles,
    setSelectedRoles,
    openEditRolesDialog,
    closeEditRolesDialog,
    toggleRole,
    
    resetPasswordDialog,
    newPassword,
    setNewPassword,
    openResetPasswordDialog,
    closeResetPasswordDialog,
    
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    
    editEmailDialog,
    openEditEmailDialog,
    closeEditEmailDialog,
  };

  return (
    <UsersDialogsContext.Provider value={value}>
      {children}
    </UsersDialogsContext.Provider>
  );
}

export function useUsersDialogsContext() {
  const context = useContext(UsersDialogsContext);
  if (!context) {
    throw new Error("useUsersDialogsContext must be used within UsersDialogsProvider");
  }
  return context;
}
