/**
 * Lazy Loaded Dialogs
 * تحميل كسول للـ Dialogs لتحسين الأداء
 * @version 2.9.14
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load dialogs
export const LazyEditRolesDialog = lazy(() => 
  import('./EditRolesDialog').then(m => ({ default: m.EditRolesDialog }))
);

export const LazyResetPasswordDialog = lazy(() => 
  import('./ResetPasswordDialog').then(m => ({ default: m.ResetPasswordDialog }))
);

export const LazyEditUserEmailDialog = lazy(() => 
  import('./EditUserEmailDialog').then(m => ({ default: m.EditUserEmailDialog }))
);

export const LazyRoleAuditDialog = lazy(() => 
  import('./RoleAuditDialog').then(m => ({ default: m.RoleAuditDialog }))
);

export const LazyAddRoleDialog = lazy(() => 
  import('./AddRoleDialog').then(m => ({ default: m.AddRoleDialog }))
);

// Fallback loading component
export const DialogSkeleton = () => (
  <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
    <div className="bg-card rounded-lg p-6 w-full max-w-md space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  </div>
);

// Wrapper component for lazy dialogs
interface LazyDialogWrapperProps {
  children: React.ReactNode;
  open: boolean;
}

export const LazyDialogWrapper = ({ children, open }: LazyDialogWrapperProps) => {
  if (!open) return null;
  
  return (
    <Suspense fallback={<DialogSkeleton />}>
      {children}
    </Suspense>
  );
};
