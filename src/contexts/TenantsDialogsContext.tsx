/**
 * TenantsDialogsContext
 * إدارة حالة الحوارات في صفحة المستأجرين
 * @version 2.9.15
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Tenant } from '@/types/tenants';

interface DialogState<T> {
  isOpen: boolean;
  data: T | null;
}

interface TenantsDialogsContextValue {
  // Dialog States
  tenantDialog: DialogState<Tenant>;
  deleteDialog: DialogState<Tenant>;
  
  // Dialog Actions
  openTenantDialog: (tenant?: Tenant) => void;
  closeTenantDialog: () => void;
  openDeleteDialog: (tenant: Tenant) => void;
  closeDeleteDialog: () => void;
  
  // Selected Tenant
  selectedTenant: Tenant | null;
}

const TenantsDialogsContext = createContext<TenantsDialogsContextValue | null>(null);

interface TenantsDialogsProviderProps {
  children: ReactNode;
}

export function TenantsDialogsProvider({ children }: TenantsDialogsProviderProps) {
  // Tenant Dialog State
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Tenant Dialog Actions
  const openTenantDialog = useCallback((tenant?: Tenant) => {
    setSelectedTenant(tenant || null);
    setTenantDialogOpen(true);
  }, []);

  const closeTenantDialog = useCallback(() => {
    setTenantDialogOpen(false);
    setTimeout(() => setSelectedTenant(null), 200);
  }, []);

  // Delete Dialog Actions
  const openDeleteDialog = useCallback((tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTimeout(() => setTenantToDelete(null), 200);
  }, []);

  const value: TenantsDialogsContextValue = {
    tenantDialog: {
      isOpen: tenantDialogOpen,
      data: selectedTenant,
    },
    deleteDialog: {
      isOpen: deleteDialogOpen,
      data: tenantToDelete,
    },
    openTenantDialog,
    closeTenantDialog,
    openDeleteDialog,
    closeDeleteDialog,
    selectedTenant,
  };

  return (
    <TenantsDialogsContext.Provider value={value}>
      {children}
    </TenantsDialogsContext.Provider>
  );
}

export function useTenantsDialogsContext(): TenantsDialogsContextValue {
  const context = useContext(TenantsDialogsContext);
  if (!context) {
    throw new Error('useTenantsDialogsContext must be used within TenantsDialogsProvider');
  }
  return context;
}
