import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionGateProps {
  permission: string | string[];
  fallback?: ReactNode;
  children: ReactNode;
  requireAll?: boolean; // If true with array, requires ALL permissions. Default is ANY.
  showLoader?: boolean; // Show skeleton loader while checking permissions
}

export function PermissionGate({ 
  permission, 
  fallback = null, 
  children,
  requireAll = false,
  showLoader = false
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
  
  if (isLoading) {
    if (showLoader) {
      return <Skeleton className="h-20 w-full" />;
    }
    return null;
  }
  
  let allowed = false;
  
  if (Array.isArray(permission)) {
    allowed = requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  } else {
    allowed = hasPermission(permission);
  }
  
  return allowed ? <>{children}</> : <>{fallback}</>;
}
