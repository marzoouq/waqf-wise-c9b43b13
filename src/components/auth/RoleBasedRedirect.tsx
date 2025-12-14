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

  // ✅ إذا استمر التحميل لأكثر من 5 ثواني مع وجود مستخدم
  if (loadingTooLong && user) {
    // محاولة استخدام الأدوار المخزنة مؤقتاً
    try {
      const cached = localStorage.getItem('waqf_user_roles');
      if (cached) {
        const { roles: cachedRoles } = JSON.parse(cached);
        if (cachedRoles && cachedRoles.length > 0) {
          const target = getDashboardForRoles(cachedRoles as AppRole[]);
          return <Navigate to={target} replace />;
        }
      }
    } catch {
      // تجاهل أخطاء localStorage
    }
    // التوجيه للـ dashboard العام كحل أخير
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ إظهار مؤشر التحميل فقط إذا لم يمر وقت طويل
  if (isLoading && !loadingTooLong) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، توجيه لصفحة الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ الحصول على المسار المناسب - استخدام الأدوار المتاحة
  const availableRoles = roles.length > 0 ? roles : [];
  const targetDashboard = getDashboardForRoles(availableRoles as AppRole[]);
  
  return <Navigate to={targetDashboard} replace />;
}

export default RoleBasedRedirect;
