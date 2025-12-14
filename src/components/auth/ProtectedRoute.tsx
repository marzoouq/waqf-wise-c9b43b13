import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { checkPermission, type Permission } from '@/config/permissions';
import { useState, useEffect } from 'react';
import type { AppRole } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredPermission, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading, roles, rolesLoading, hasRole } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // ✅ Timeout احتياطي لمنع التعليق
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTooLong(true);
    }, 3000); // 3 ثواني كحد أقصى

    return () => clearTimeout(timer);
  }, []);

  // التحميل فقط عند الضرورة
  const isLoading = authLoading || (!!user && rolesLoading);

  // ✅ إذا استمر التحميل لأكثر من المدة المحددة، تجاوز التحميل
  if (isLoading && !loadingTooLong) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ استخدام الأدوار المخزنة مؤقتاً إذا لم تتوفر الأدوار الحالية
  let effectiveRoles = roles;
  if (effectiveRoles.length === 0 && loadingTooLong) {
    try {
      const cached = localStorage.getItem('waqf_user_roles');
      if (cached) {
        const { roles: cachedRoles } = JSON.parse(cached);
        if (cachedRoles && cachedRoles.length > 0) {
          effectiveRoles = cachedRoles;
        }
      }
    } catch {
      // تجاهل أخطاء localStorage
    }
  }

  // ✅ التحقق من الصلاحية المطلوبة
  if (requiredPermission) {
    const hasPermissionCheck = checkPermission(requiredPermission, effectiveRoles);
    if (!hasPermissionCheck) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // التحقق من الدور المطلوب
  if (requiredRole && !effectiveRoles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // التحقق من أي دور من الأدوار المطلوبة
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => effectiveRoles.includes(role));
    if (!hasAnyRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
