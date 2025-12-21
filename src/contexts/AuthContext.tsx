import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useToast } from '@/hooks/ui/use-toast';
import { productionLogger } from '@/lib/logger/production-logger';
import { ROLE_PERMISSIONS, checkPermission, type Permission } from '@/config/permissions';
import { AuthService } from '@/services/auth.service';

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
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const data = await AuthService.getProfile(userId);
      
      if (!data) {
        // ✅ إعادة المحاولة فوراً بدون تأخير
        const retryData = await AuthService.getProfile(userId);
        if (retryData) {
          setProfile(retryData as Profile);
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      productionLogger.error('Exception fetching profile', error);
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

  // ✅ قائمة المسارات العامة - Lazy Auth: لا نجلب البيانات إلا عند الحاجة
  const PUBLIC_ROUTES_FOR_LAZY = ['/', '/login', '/signup', '/install', '/unauthorized', '/privacy', '/terms', '/security-policy', '/faq', '/contact'];
  
  const isCurrentRoutePublic = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return PUBLIC_ROUTES_FOR_LAZY.includes(window.location.pathname);
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let isMounted = true;

    const initializeAuth = async () => {
      console.log('🔐 [AuthContext] بدء التهيئة...');
      console.log('🔐 [AuthContext] المسار:', window.location.pathname);
      
      try {
        // ✅ جلب الجلسة الحالية
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        console.log('🔐 [AuthContext] نتيجة getSession:', { hasSession: !!currentSession });
        
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
        
        // ✅ LAZY AUTH: جلب البيانات فقط للصفحات المحمية
        if (currentSession?.user) {
          const isPublic = isCurrentRoutePublic();
          
          if (!isPublic) {
            // ✅ صفحة محمية: جلب البيانات فوراً من قاعدة البيانات
            await fetchUserData(currentSession.user.id);
          } else {
            // ✅ صفحة عامة: لا نجلب البيانات
            setIsLoading(false);
            setRolesLoading(false);
          }
        } else {
          setIsLoading(false);
          setRolesLoading(false);
        }
        
        console.log('🔐 [AuthContext] انتهاء التهيئة');
        setIsInitialized(true);
      } catch (err) {
        if (!isMounted) return;
        productionLogger.error('Unexpected error getting session', err);
        console.log('🔐 [AuthContext] خطأ:', err);
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
  }, [fetchUserData, cleanupInvalidSession, isCurrentRoutePublic]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
      const keysToKeep = [
        'theme',
        'vite-ui-theme',
        'paymentDaysThreshold',
        'itemsPerPage',
        'language',
        'notificationsEnabled',
      ];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();

      // ✅ استخدام scope: 'global' لمسح الجلسة من جميع الأجهزة (أمان كامل)
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;

      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      rolesCache.current = [];
      setRolesLoading(false);
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "خطأ",
        description: err?.message || "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      rolesCache.current = [];
      setRolesLoading(false);
      throw error;
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
