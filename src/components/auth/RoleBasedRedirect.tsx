import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type AppRole, getDashboardForRoles } from '@/types/roles';

// Re-export for backward compatibility
export type { AppRole } from '@/types/roles';
export { getDashboardForRoles } from '@/types/roles';

/**
 * مكون التوجيه التلقائي حسب الدور
 * يستخدم بعد تسجيل الدخول للتوجيه المباشر إلى لوحة التحكم المناسبة
 */
export function RoleBasedRedirect() {
  const { user, isLoading: authLoading, roles, rolesLoading } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // ✅ Timeout احتياطي لمنع التعليق
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTooLong(true);
    }, 5000); // 5 ثواني كحد أقصى

    return () => clearTimeout(timer);
  }, []);

  // ✅ حالة التحميل الفعلية
  const isLoading = authLoading || (!!user && rolesLoading);
  
  // ✅ التحقق من جاهزية الأدوار فعلياً
  const rolesReady = roles.length > 0;

  // إذا لم يكن هناك مستخدم بعد انتهاء التحميل، توجيه لصفحة الدخول
  if (!user && !authLoading) {
    return <Navigate to="/login" replace />;
  }

  // ✅ إصلاح: إذا استمر التحميل لأكثر من 5 ثواني مع وجود مستخدم ولم تُجلب الأدوار
  // لا نوجه لـ /login لأن المستخدم مسجل دخول فعلاً!
  if (loadingTooLong && user && !rolesReady) {
    // محاولة استخدام الأدوار المخزنة مؤقتاً مع التحقق من userId
    try {
      const cached = localStorage.getItem('waqf_user_roles');
      if (cached) {
        const { roles: cachedRoles, userId } = JSON.parse(cached);
        // ✅ تحقق أن الـ cache لنفس المستخدم!
        if (cachedRoles && cachedRoles.length > 0 && userId === user.id) {
          const target = getDashboardForRoles(cachedRoles as AppRole[]);
          return <Navigate to={target} replace />;
        }
      }
    } catch {
      // تجاهل أخطاء localStorage
    }
    
    // ✅ إصلاح: بدلاً من التوجيه لـ /login، نوجه للوحة الافتراضية
    // المستخدم مسجل دخول لكن الأدوار لم تُحمَّل - نتركه يدخل ونترك ProtectedRoute يتعامل
    if (import.meta.env.DEV) {
      console.warn('⚠️ [RoleBasedRedirect] Timeout - توجيه للوحة الافتراضية بدلاً من /login');
    }
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ انتظار حقيقي: لا نوجه حتى تُجلب الأدوار فعلياً
  if ((isLoading || !rolesReady) && !loadingTooLong && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ✅ الآن الأدوار جاهزة فعلياً - توجيه صحيح
  if (user && rolesReady) {
    const targetDashboard = getDashboardForRoles(roles as AppRole[]);
    return <Navigate to={targetDashboard} replace />;
  }

  // ✅ حالة غير متوقعة - توجيه لصفحة الدخول بدلاً من /dashboard
  return <Navigate to="/login" replace />;
}

export default RoleBasedRedirect;
