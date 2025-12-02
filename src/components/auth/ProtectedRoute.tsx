import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { checkPermission, type Permission } from '@/config/permissions';

type AppRole = "nazer" | "admin" | "accountant" | "cashier" | "archivist" | "beneficiary" | "waqf_heir" | "user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredPermission, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading, roles, rolesLoading, hasRole } = useAuth();

  // التحميل فقط عند الضرورة
  const isLoading = authLoading || (!!user && rolesLoading);

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
    const hasPermissionCheck = checkPermission(requiredPermission, roles);
    if (!hasPermissionCheck) {
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
