import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredPermission, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRole();

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

  // تجاهل requiredPermission مؤقتاً حتى نطبق نظام الصلاحيات
  if (requiredPermission) {
    // TODO: تطبيق نظام الصلاحيات
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => hasRole(role));
    if (!hasAnyRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
