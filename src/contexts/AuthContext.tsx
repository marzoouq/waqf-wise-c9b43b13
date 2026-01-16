import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useToast } from '@/hooks/ui/use-toast';
import { productionLogger } from '@/lib/logger/production-logger';
import { ROLE_PERMISSIONS, checkPermission, type Permission } from '@/config/permissions';
import { AuthService } from '@/services/auth.service';
import { queryInvalidationManager } from '@/lib/query-invalidation-manager';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  roles: string[];
  rolesLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
  isRole: (roleName: string) => Promise<boolean>;
  checkPermissionSync: (permission: string, userRoles: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const initRef = useRef(false);
  // ✅ استخدام useRef بدلاً من localStorage للأمان
  const rolesCache = useRef<string[]>([]);
  // ✅ قفل لمنع تكرار طلبات تحديث الـ Token (يمنع 429 rate limit)
  const tokenRefreshLock = useRef(false);

  // جلب أدوار المستخدم باستخدام AuthService
  const fetchUserRoles = useCallback(async (userId: string): Promise<string[]> => {
    // ✅ استخدام الـ cache المؤقت في الذاكرة فقط
    if (rolesCache.current.length > 0) {
      setRoles(rolesCache.current);
      setRolesLoading(false);
      // جلب الأدوار في الخلفية للتحديث
      AuthService.getUserRoles(userId)
        .then((freshRoles) => {
          if (JSON.stringify(freshRoles) !== JSON.stringify(rolesCache.current)) {
            rolesCache.current = freshRoles;
            setRoles(freshRoles);
          }
        })
        .catch(() => {});
      return rolesCache.current;
    }

    // ✅ جلب الأدوار باستخدام AuthService
    setRolesLoading(true);
    try {
      const fetchedRoles = await AuthService.getUserRoles(userId);
      rolesCache.current = fetchedRoles;
      setRoles(fetchedRoles);
      setRolesLoading(false);
      return fetchedRoles;
    } catch (err) {
      productionLogger.error('Exception fetching user roles', err);
      setRolesLoading(false);
      return [];
    }
  }, []);

  // تنظيف الجلسات التالفة
  const cleanupInvalidSession = useCallback(async () => {
    try {
      const keysToClean = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      keysToClean.forEach(key => localStorage.removeItem(key));
      
      await supabase.auth.signOut({ scope: 'local' });
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      rolesCache.current = [];
      setRolesLoading(false);
    } catch (err) {
      productionLogger.error('Error cleaning up invalid session', err);
    }
  }, []);

  // جلب الملف الشخصي باستخدام AuthService
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const data = await AuthService.getProfile(userId);
      
      if (!data) {
        // ✅ إعادة المحاولة فوراً بدون تأخير
        const retryData = await AuthService.getProfile(userId);
        if (retryData) {
          setProfile(retryData as Profile);
          return retryData as Profile;
        }
        return null;
      } else {
        setProfile(data as Profile);
        return data as Profile;
      }
    } catch (error) {
      productionLogger.error('Exception fetching profile', error);
      return null;
    }
  }, []);

  // جلب البيانات بشكل متوازي
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      await Promise.all([
        fetchProfile(userId),
        fetchUserRoles(userId)
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, fetchUserRoles]);

  // ✅ إزالة Lazy Auth - نجلب البيانات دائماً عند وجود جلسة

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let isMounted = true;

    const initializeAuth = async () => {
      if (import.meta.env.DEV) {
        console.log('🔐 [AuthContext] بدء التهيئة...');
        console.log('🔐 [AuthContext] المسار:', window.location.pathname);
      }
      
      try {
        // ✅ جلب الجلسة الحالية
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (import.meta.env.DEV) {
          console.log('🔐 [AuthContext] نتيجة getSession:', { hasSession: !!currentSession });
        }
        
        if (!isMounted) return;

        if (error) {
          const errorMsg = error.message?.toLowerCase() || '';
          if (errorMsg.includes('invalid') || 
              errorMsg.includes('bad_jwt') || 
              errorMsg.includes('missing sub claim') ||
              errorMsg.includes('expired')) {
            productionLogger.warn('Invalid session detected, cleaning up', error.message);
            await cleanupInvalidSession();
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }
        }

        // ✅ تحديث الحالة
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // ✅ جلب البيانات دائماً عند وجود جلسة
        if (currentSession?.user) {
          await fetchUserData(currentSession.user.id);
        } else {
          setIsLoading(false);
          setRolesLoading(false);
        }
        
        if (import.meta.env.DEV) {
          console.log('🔐 [AuthContext] انتهاء التهيئة');
        }
        setIsInitialized(true);
      } catch (err) {
        if (!isMounted) return;
        productionLogger.error('Unexpected error getting session', err);
        if (import.meta.env.DEV) {
          console.log('🔐 [AuthContext] خطأ:', err);
        }
        await cleanupInvalidSession();
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // ✅ إعداد المستمع لتغييرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      // ✅ تجاهل الأحداث قبل اكتمال التهيئة الأولية
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        rolesCache.current = [];
        setIsLoading(false);
        setRolesLoading(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED' && !newSession) {
        productionLogger.warn('Token refresh failed, cleaning up session');
        cleanupInvalidSession();
        setIsLoading(false);
        setRolesLoading(false);
        return;
      }

      // ✅ إصلاح: منع تكرار طلبات TOKEN_REFRESHED (يمنع 429 rate limit)
      if (event === 'TOKEN_REFRESHED') {
        if (tokenRefreshLock.current) {
          // تجاهل الطلبات المتكررة خلال 5 ثواني
          return;
        }
        tokenRefreshLock.current = true;
        setTimeout(() => {
          tokenRefreshLock.current = false;
        }, 5000);
      }

      // ✅ SIGNED_IN أو TOKEN_REFRESHED مع جلسة صالحة
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        
        // ✅ جلب البيانات دائماً عند SIGNED_IN (تسجيل دخول جديد)
        if (event === 'SIGNED_IN') {
          if (!isInitialized) {
            setIsLoading(true);
          }
          setTimeout(() => {
            fetchUserData(newSession.user.id);
          }, 0);
        }
      }
    });

    // ✅ بدء التهيئة
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      initRef.current = false;
    };
  }, [fetchUserData, cleanupInvalidSession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // تسجيل محاولة تسجيل الدخول
    try {
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_ip_address: 'client',
        p_success: !error,
        p_user_agent: navigator.userAgent
      });
    } catch (logError) {
      // لا نوقف تسجيل الدخول إذا فشل التسجيل
      console.warn('Failed to log login attempt:', logError);
    }

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/redirect`,
      },
    });

    if (error) throw error;
  };

  // ✅ تسجيل الدخول باستخدام Google OAuth
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/redirect`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    try {
      // ✅ 1. تنظيف حالة React أولاً (قبل أي async)
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      rolesCache.current = [];
      setRolesLoading(false);
      
      // ✅ 2. تنظيف React Query cache بالكامل
      queryInvalidationManager.resetForNewUser();
      
      // ✅ 3. استخدام AuthService للتنظيف الشامل
      await AuthService.logout({ keepTheme: true, scope: 'global' });
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error: unknown) {
      // ✅ التنظيف مضمون حتى لو حدث خطأ (تم أعلاه)
      const err = error as { message?: string };
      
      // لا نعرض خطأ إذا كان بسبب انتهاء الجلسة
      if (!err?.message?.includes('session') && !err?.message?.includes('JWT')) {
        toast({
          title: "تحذير",
          description: "تم تسجيل الخروج مع بعض التحذيرات",
          variant: "default",
        });
      } else {
        toast({
          title: "تم تسجيل الخروج",
          description: "تم تسجيل خروجك بنجاح",
        });
      }
    }
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;

    let currentRoles = rolesCache.current;
    
    if (currentRoles.length === 0) {
      currentRoles = await fetchUserRoles(user.id);
    }

    return checkPermission(permission as Permission, currentRoles);
  };

  const checkPermissionSync = (permission: string, userRoles: string[]): boolean => {
    return checkPermission(permission as Permission, userRoles);
  };

  const isRole = async (roleName: string): Promise<boolean> => {
    if (!user) return false;

    let currentRoles = rolesCache.current;
    
    if (currentRoles.length === 0) {
      currentRoles = await fetchUserRoles(user.id);
    }

    return currentRoles.includes(roleName);
  };

  // ✅ قائمة المسارات العامة التي لا تحتاج انتظار التهيئة
  const PUBLIC_ROUTES = ['/', '/login', '/signup', '/install', '/unauthorized', '/privacy', '/terms', '/security-policy', '/faq', '/contact'];
  
  // ✅ التحقق إذا كان المسار الحالي عام
  const isPublicRoute = typeof window !== 'undefined' && PUBLIC_ROUTES.includes(window.location.pathname);
  
  // ✅ إظهار التحميل فقط للصفحات المحمية
  const effectiveIsLoading = isPublicRoute ? false : (!isInitialized || isLoading);

  const value = {
    user,
    profile,
    isLoading: effectiveIsLoading,
    roles,
    rolesLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    hasPermission,
    isRole,
    checkPermissionSync,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { ROLE_PERMISSIONS };
