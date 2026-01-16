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
 * 
 * ✅ محسّن: يتعامل مع حالات الأدوار الفارغة والمستخدمين غير النشطين
 */
export function RoleBasedRedirect() {
  const { user, profile, isLoading: authLoading, roles, rolesLoading } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // ✅ Timeout احتياطي لمنع التعليق (تقليل لـ 3 ثواني)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTooLong(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ حالة التحميل الفعلية
  const isLoading = authLoading || (!!user && rolesLoading);

  // إذا لم يكن هناك مستخدم بعد انتهاء التحميل، توجيه لصفحة الدخول
  if (!user && !authLoading) {
    return <Navigate to="/login" replace />;
  }

  // ✅ التحقق من أن المستخدم نشط
  if (profile && profile.is_active === false) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ إذا استمر التحميل لأكثر من 3 ثواني مع وجود مستخدم
  if (loadingTooLong && user) {
    // ✅ توجيه مباشر بناءً على الأدوار المتاحة
    if (roles.length > 0) {
      const target = getDashboardForRoles(roles as AppRole[]);
      return <Navigate to={target} replace />;
    }
    
    // محاولة استخدام الأدوار المخزنة مؤقتاً
    try {
      const cached = localStorage.getItem('waqf_user_roles');
      if (cached) {
        const { roles: cachedRoles, userId } = JSON.parse(cached);
        if (cachedRoles && cachedRoles.length > 0 && userId === user.id) {
          const target = getDashboardForRoles(cachedRoles as AppRole[]);
          return <Navigate to={target} replace />;
        }
      }
    } catch {
      // تجاهل أخطاء localStorage
    }
    
    // ✅ إذا لم تُجلب الأدوار، نوجه للوحة الافتراضية
    // بدلاً من التوجيه لـ /login (المستخدم مسجل دخول فعلاً)
    if (import.meta.env.DEV) {
      console.warn('⚠️ [RoleBasedRedirect] Timeout - توجيه للوحة الافتراضية');
    }
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ انتظار جلب البيانات
  if (isLoading && !loadingTooLong && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ✅ الأدوار جاهزة - توجيه صحيح
  if (user && roles.length > 0) {
    const targetDashboard = getDashboardForRoles(roles as AppRole[]);
    return <Navigate to={targetDashboard} replace />;
  }

  // ✅ مستخدم مسجل لكن بدون أدوار - توجيه للوحة الافتراضية
  if (user && roles.length === 0 && !rolesLoading) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ [RoleBasedRedirect] مستخدم بدون أدوار - توجيه للوحة الافتراضية');
    }
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ حالة غير متوقعة
  return <Navigate to="/login" replace />;
}

export default RoleBasedRedirect;
