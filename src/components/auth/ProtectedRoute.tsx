import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { LoadingState } from '@/components/shared/LoadingState';

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
      if (requiredRole && !roles.includes(requiredRole)) {
        navigate('/', { replace: true });
      }

      if (requiredRoles && requiredRoles.length > 0) {
        const hasAnyRole = requiredRoles.some(role => roles.includes(role));
        if (!hasAnyRole) {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, authLoading, roleLoading, requiredRole, requiredRoles, roles, navigate]);

  if (authLoading || roleLoading) {
    return <LoadingState fullScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
