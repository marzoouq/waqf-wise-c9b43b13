import { Navigate } from 'react-router-dom';
import { useAuth, ROLE_PERMISSIONS } from '@/contexts/AuthContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
}

/**
 * التحقق من صلاحية معينة بناءً على الأدوار
 */
function checkPermission(permission: string, roles: AppRole[]): boolean {
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (permissions.includes(permission) || permissions.includes('view_all_data')) {
      return true;
    }
  }
  return false;
}

export function ProtectedRoute({ children, requiredPermission, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasRole, roles, isLoading: rolesLoading } = useUserRole();

  const isLoading = authLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ التحقق من الصلاحية المطلوبة
  if (requiredPermission) {
    const hasPermission = checkPermission(requiredPermission, roles);
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // التحقق من الدور المطلوب
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // التحقق من أي دور من الأدوار المطلوبة
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => hasRole(role));
    if (!hasAnyRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
