import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { LoadingState } from '@/components/shared/LoadingState';
import { logger } from '@/lib/logger';

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
      if (roles.length === 0 && !roleLoading) {
        return;
      }
      
      if (requiredRole && !roles.includes(requiredRole)) {
        logger.warn('Access denied', { userId: user.id, metadata: { requiredRole } });
        navigate('/', { replace: true });
        return;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        const hasAnyRole = requiredRoles.some(role => roles.includes(role));
        if (!hasAnyRole) {
          logger.warn('Access denied', { userId: user.id, metadata: { requiredRoles } });
          navigate('/', { replace: true });
          return;
        }
      }
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
