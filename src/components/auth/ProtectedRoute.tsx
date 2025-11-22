import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { LoadingState } from '@/components/shared/LoadingState';
import { debug } from '@/lib/debug';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !roleLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, roleLoading, navigate]);

  // Check role permissions after loading
  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      debug.roles('ProtectedRoute - User roles:', roles);
      debug.roles('ProtectedRoute - Required role:', requiredRole);
      debug.roles('ProtectedRoute - Required roles:', requiredRoles);
      
      // ✅ Wait if user exists but roles are still empty (still loading)
      if (roles.length === 0 && !roleLoading) {
        debug.warn('Waiting for roles to load...');
        return;
      }
      
      if (requiredRole && !roles.includes(requiredRole)) {
        debug.warn('Access denied - missing required role:', requiredRole);
        navigate('/', { replace: true });
        return;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        const hasAnyRole = requiredRoles.some(role => roles.includes(role));
        if (!hasAnyRole) {
          debug.warn('Access denied - missing any of required roles:', requiredRoles);
          navigate('/', { replace: true });
          return;
        }
      }
      
      debug.roles('Access granted');
    }
  }, [user, authLoading, roleLoading, requiredRole, requiredRoles, roles, navigate]);

  // Show loading when auth is loading OR when user exists but roles are loading
  if (authLoading || (user && roleLoading)) {
    return <LoadingState fullScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
