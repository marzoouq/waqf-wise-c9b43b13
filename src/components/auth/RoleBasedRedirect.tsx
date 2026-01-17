import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type AppRole, getDashboardForRoles } from '@/types/roles';
import { supabase } from '@/integrations/supabase/client';

// Re-export for backward compatibility
export type { AppRole } from '@/types/roles';
export { getDashboardForRoles } from '@/types/roles';

/**
 * مكون التوجيه التلقائي حسب الدور
 * يستخدم بعد تسجيل الدخول للتوجيه المباشر إلى لوحة التحكم المناسبة
 * 
 * ✅ محسّن: timeout مخفض + جلب الأدوار مباشرة كـ fallback
 */
export function RoleBasedRedirect() {
  const { user, profile, isLoading: authLoading, roles, rolesLoading } = useAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const [directRoles, setDirectRoles] = useState<AppRole[] | null>(null);

  // ✅ Timeout مخفض لـ 1 ثانية بدلاً من 3
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTooLong(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ جلب الأدوار مباشرة كـ fallback إذا لم تتوفر من Context
  useEffect(() => {
    const fetchDirectRoles = async () => {
      if (user && roles.length === 0 && !rolesLoading && loadingTooLong) {
        try {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          if (data && data.length > 0) {
            setDirectRoles(data.map(r => r.role as AppRole));
          }
        } catch (error) {
          console.error('Error fetching roles directly:', error);
        }
      }
    };

    fetchDirectRoles();
  }, [user, roles.length, rolesLoading, loadingTooLong]);

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

  // ✅ استخدام الأدوار المجلوبة مباشرة إذا توفرت
  const effectiveRoles = roles.length > 0 ? roles : (directRoles || []);

  // ✅ إذا توفرت أدوار (من أي مصدر)، توجيه فوري
  if (user && effectiveRoles.length > 0) {
    const target = getDashboardForRoles(effectiveRoles as AppRole[]);
    return <Navigate to={target} replace />;
  }

  // ✅ إذا استمر التحميل لأكثر من 1 ثانية مع وجود مستخدم
  if (loadingTooLong && user) {
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
    
    // ✅ توجيه للوحة الافتراضية
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

  // ✅ مستخدم مسجل لكن بدون أدوار - توجيه للوحة الافتراضية
  if (user && effectiveRoles.length === 0 && !rolesLoading) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ [RoleBasedRedirect] مستخدم بدون أدوار - توجيه للوحة الافتراضية');
    }
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ حالة غير متوقعة
  return <Navigate to="/login" replace />;
}

export default RoleBasedRedirect;
