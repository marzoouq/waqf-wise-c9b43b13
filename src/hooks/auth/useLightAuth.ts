/**
 * Hook خفيف للتحقق من حالة تسجيل الدخول - بدون تبعيات ثقيلة
 * يستخدم فقط في الصفحات العامة (Landing, Login, Signup)
 * لا يسحب AuthContext أو أي تبعيات مصادقة أخرى
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LightAuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: string | null;
}

const ROLES_CACHE_KEY = 'waqf_user_roles';

/**
 * جلب الأدوار من الـ cache المحلي
 */
function getCachedRoles(userId: string): string[] | null {
  try {
    const cached = localStorage.getItem(ROLES_CACHE_KEY);
    if (cached) {
      const { userId: cachedUserId, roles, timestamp } = JSON.parse(cached);
      if (cachedUserId === userId && Date.now() - timestamp < 5 * 60 * 1000) {
        return roles;
      }
    }
  } catch {
    // تجاهل أخطاء localStorage
  }
  return null;
}

/**
 * تحديد لوحة التحكم المناسبة بناءً على الأدوار
 */
function getDashboardPath(roles: string[]): string {
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('nazer')) return '/nazer';
  if (roles.includes('accountant')) return '/accountant';
  if (roles.includes('cashier')) return '/cashier';
  if (roles.includes('archivist')) return '/archive';
  if (roles.includes('waqf_heir')) return '/beneficiary';
  if (roles.includes('beneficiary')) return '/beneficiary';
  return '/dashboard';
}

/**
 * Hook خفيف للتحقق من حالة تسجيل الدخول
 * - لا يجلب الملف الشخصي
 * - لا يجلب الأدوار من قاعدة البيانات
 * - يستخدم فقط الجلسة المحلية والـ cache
 */
export function useLightAuth(): LightAuthState & { redirectPath: string | null } {
  const [state, setState] = useState<LightAuthState>({
    isLoggedIn: false,
    isLoading: true,
    userId: null,
  });
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log('🔑 [useLightAuth] بدء جلب الجلسة...');

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
          console.log('🔑 [useLightAuth] نتيجة:', { hasSession: true, userId: session.user.id });
          // المستخدم مسجل دخوله - تحديد المسار من الـ cache
          const cachedRoles = getCachedRoles(session.user.id);
          console.log('🔑 [useLightAuth] الأدوار المخزنة:', cachedRoles);
          const dashboard = cachedRoles ? getDashboardPath(cachedRoles) : '/dashboard';
          console.log('🔑 [useLightAuth] المسار المحدد:', dashboard);
          
          setState({
            isLoggedIn: true,
            isLoading: false,
            userId: session.user.id,
          });
          setRedirectPath(dashboard);
        } else {
          console.log('🔑 [useLightAuth] نتيجة:', { hasSession: false });
          setState({
            isLoggedIn: false,
            isLoading: false,
            userId: null,
          });
          setRedirectPath(null);
        }
      } catch (error) {
        console.log('🔑 [useLightAuth] خطأ:', error);
        if (isMounted) {
          setState({
            isLoggedIn: false,
            isLoading: false,
            userId: null,
          });
          setRedirectPath(null);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...state, redirectPath };
}
