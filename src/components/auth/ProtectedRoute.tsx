import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { checkPermission, type Permission } from '@/config/permissions';
import { useState, useEffect, useRef } from 'react';
import type { AppRole } from '@/types/roles';
import { debugLog } from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredPermission, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading: authLoading, roles, rolesLoading } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const lastLoggedDecision = useRef<string>('');

  // ✅ Log الحالة عند التغيير فقط
  useEffect(() => {
    debugLog('ProtectedRoute', 'تحديث الحالة', { 
      authLoading, 
      rolesLoading, 
      hasUser: !!user, 
      roles,
      path: window.location.pathname 
    });
  }, [authLoading, rolesLoading, user, roles]);

  // ✅ Timeout مُحسَّن - يتوقف عند اكتمال التحميل
  useEffect(() => {
    // لا حاجة للـ timer إذا انتهى التحميل
    if (!authLoading && !rolesLoading) return;
    
    const timer = setTimeout(() => {
      debugLog('ProtectedRoute', '⏰ Timeout - تجاوز وقت التحميل');
      setLoadingTooLong(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [authLoading, rolesLoading]);

  // التحميل فقط عند الضرورة
  const isLoading = authLoading || (!!user && rolesLoading);

  // ✅ Helper لتسجيل القرار مرة واحدة فقط
  const logDecision = (decision: string) => {
    if (decision !== lastLoggedDecision.current) {
      lastLoggedDecision.current = decision;
      debugLog('ProtectedRoute', `قرار: ${decision}`);
    }
  };

  // ✅ إصلاح: إذا الصفحة تتطلب دور معين، ننتظر حتى تنتهي rolesLoading
  const requiresRoleCheck = requiredRole || (requiredRoles && requiredRoles.length > 0);
  const isStillLoadingRoles = requiresRoleCheck && rolesLoading && !loadingTooLong;
  
  // ✅ إذا استمر التحميل لأكثر من المدة المحددة، تجاوز التحميل
  if ((isLoading || isStillLoadingRoles) && !loadingTooLong) {
    logDecision('عرض Loader');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ✅ إصلاح: فقط نوجه لـ /login إذا انتهى التحميل ولا يوجد مستخدم
  if (!authLoading && !user) {
    logDecision('توجيه للدخول - لا يوجد مستخدم');
    return <Navigate to="/login" replace />;
  }
  
  // ✅ إذا لا يزال التحميل جاري ولكن تجاوزنا الـ timeout
  if (!user && authLoading && loadingTooLong) {
    logDecision('توجيه للدخول - timeout');
    return <Navigate to="/login" replace />;
  }
  
  logDecision('السماح');

  // ✅ استخدام الأدوار من السياق فقط (بدون localStorage)
  const effectiveRoles = roles;

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
