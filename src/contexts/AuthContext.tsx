import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { productionLogger } from '@/lib/logger/production-logger';
import { ROLE_PERMISSIONS, checkPermission, type Permission } from '@/config/permissions';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  roles: string[];
  rolesLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
  const { toast } = useToast();
  const initRef = useRef(false);
  const initialLoadDone = useRef(false); // ✅ تتبع التحميل الأولي
  const rolesCache = useRef<string[]>([]);
  const ROLES_CACHE_KEY = 'waqf_user_roles';

  // استرجاع الأدوار من الـ cache
  const getCachedRoles = useCallback((userId: string): string[] | null => {
    try {
      const cached = localStorage.getItem(ROLES_CACHE_KEY);
      if (cached) {
        const { userId: cachedUserId, roles: cachedRoles, timestamp } = JSON.parse(cached);
        // صالح لمدة 5 دقائق
        if (cachedUserId === userId && Date.now() - timestamp < 5 * 60 * 1000) {
          return cachedRoles;
        }
      }
    } catch {
      // تجاهل أخطاء localStorage
    }
    return null;
  }, []);

  // حفظ الأدوار في الـ cache
  const setCachedRoles = useCallback((userId: string, roles: string[]) => {
    try {
      localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify({
        userId,
        roles,
        timestamp: Date.now()
      }));
    } catch {
      // تجاهل أخطاء localStorage
    }
  }, []);

  // جلب أدوار المستخدم من قاعدة البيانات
  const fetchUserRoles = useCallback(async (userId: string): Promise<string[]> => {
    // محاولة استخدام الـ cache أولاً للتحميل السريع
    const cached = getCachedRoles(userId);
    if (cached && cached.length > 0) {
      rolesCache.current = cached;
      setRoles(cached);
      setRolesLoading(false);
      // جلب الأدوار في الخلفية للتحديث
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .then(({ data }) => {
          if (data) {
            const freshRoles = data.map(r => r.role);
            if (JSON.stringify(freshRoles) !== JSON.stringify(cached)) {
              rolesCache.current = freshRoles;
              setRoles(freshRoles);
              setCachedRoles(userId, freshRoles);
            }
          }
        });
      return cached;
    }

    setRolesLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        productionLogger.error('Error fetching user roles', error);
        setRolesLoading(false);
        return [];
      }

      const fetchedRoles = (data || []).map(r => r.role);
      rolesCache.current = fetchedRoles;
      setRoles(fetchedRoles);
      setCachedRoles(userId, fetchedRoles);
      setRolesLoading(false);
      return fetchedRoles;
    } catch (err) {
      productionLogger.error('Exception fetching user roles', err);
      setRolesLoading(false);
      return [];
    }
  }, [getCachedRoles, setCachedRoles]);

  // تنظيف الجلسات التالفة
  const cleanupInvalidSession = useCallback(async () => {
    try {
      // إزالة tokens القديمة من localStorage
      const keysToClean = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-') || key === ROLES_CACHE_KEY
      );
      keysToClean.forEach(key => localStorage.removeItem(key));
      
      // تسجيل الخروج من Supabase
      await supabase.auth.signOut({ scope: 'local' });
      
      // تنظيف الحالة
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

  // جلب البيانات بشكل متوازي
  const fetchUserData = useCallback(async (userId: string) => {
    // جلب profile و roles بشكل متوازي
    await Promise.all([
      fetchProfile(userId),
      fetchUserRoles(userId)
    ]);
  }, [fetchUserRoles]);

  // جلب الملف الشخصي - مُحسّن (الـ trigger يُنشئ الملف تلقائياً)
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, avatar_url, phone, position, is_active, created_at, updated_at, last_login_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        productionLogger.error('Error fetching profile', error);
      }
      
      // الـ trigger ينشئ الـ profile تلقائياً، لذا إذا لم يوجد ننتظر قليلاً ونعيد المحاولة
      if (!data) {
        // انتظار قصير للـ trigger
        await new Promise(resolve => setTimeout(resolve, 200));
        const { data: retryData } = await supabase
          .from('profiles')
          .select('id, user_id, email, full_name, avatar_url, phone, position, is_active, created_at, updated_at, last_login_at')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (retryData) {
          setProfile(retryData);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      productionLogger.error('Exception fetching profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    // ✅ جلب الجلسة أولاً قبل إعداد المستمع
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        // معالجة أخطاء الجلسة التالفة
        if (error) {
          const errorMsg = error.message?.toLowerCase() || '';
          if (errorMsg.includes('invalid') || 
              errorMsg.includes('bad_jwt') || 
              errorMsg.includes('missing sub claim') ||
              errorMsg.includes('expired')) {
            productionLogger.warn('Invalid session detected, cleaning up', error.message);
            await cleanupInvalidSession();
            setIsLoading(false);
            initialLoadDone.current = true;
            return;
          }
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // جلب البيانات بشكل متوازي
          await fetchUserData(currentSession.user.id);
        } else {
          setIsLoading(false);
          setRolesLoading(false);
        }
        
        initialLoadDone.current = true;
      } catch (err) {
        productionLogger.error('Unexpected error getting session', err);
        await cleanupInvalidSession();
        setIsLoading(false);
        initialLoadDone.current = true;
      }
    };

    // ✅ إعداد المستمع لتغييرات الجلسة (بعد التحميل الأولي)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // ✅ تجاهل الحدث الأولي إذا لم يكتمل التحميل الأولي بعد
      if (!initialLoadDone.current && event === 'INITIAL_SESSION') {
        return;
      }

      // معالجة حدث تسجيل الخروج
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

      // معالجة خطأ تجديد الـ token
      if (event === 'TOKEN_REFRESHED' && !newSession) {
        productionLogger.warn('Token refresh failed, cleaning up session');
        cleanupInvalidSession();
        setIsLoading(false);
        setRolesLoading(false);
        return;
      }

      // تحديث الجلسة والمستخدم
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // استخدام setTimeout لتجنب deadlock - جلب البيانات بشكل متوازي
        setTimeout(() => {
          fetchUserData(newSession.user.id);
        }, 0);
      } else if (initialLoadDone.current) {
        // ✅ فقط إذا اكتمل التحميل الأولي
        setProfile(null);
        setRoles([]);
        rolesCache.current = [];
        setIsLoading(false);
        setRolesLoading(false);
      }
    });

    // بدء التهيئة
    initializeAuth();

    return () => {
      subscription.unsubscribe();
      initRef.current = false;
    };
  }, [fetchUserData, cleanupInvalidSession]);

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
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    try {
      // تنظيف localStorage (الاحتفاظ فقط بإعدادات الثيم)
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

      // تنظيف sessionStorage
      sessionStorage.clear();

      // تسجيل الخروج من Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // تنظيف الحالة المحلية
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
      
      // محاولة التنظيف على أي حال
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      rolesCache.current = [];
      setRolesLoading(false);
      throw error;
    }
  };

  /**
   * التحقق من دور معين - sync version
   */
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  /**
   * التحقق من صلاحية معينة - async version
   */
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;

    // استخدام الـ cache إذا كان متوفراً
    let currentRoles = rolesCache.current;
    
    // إذا لم يكن هناك cache، جلب الأدوار
    if (currentRoles.length === 0) {
      currentRoles = await fetchUserRoles(user.id);
    }

    // استخدام دالة checkPermission من config
    return checkPermission(permission as Permission, currentRoles);
  };

  /**
   * التحقق من صلاحية معينة - sync version (للاستخدام في المكونات)
   */
  const checkPermissionSync = (permission: string, userRoles: string[]): boolean => {
    return checkPermission(permission as Permission, userRoles);
  };

  /**
   * التحقق من دور معين - async version
   */
  const isRole = async (roleName: string): Promise<boolean> => {
    if (!user) return false;

    // استخدام الـ cache إذا كان متوفراً
    let currentRoles = rolesCache.current;
    
    // إذا لم يكن هناك cache، جلب الأدوار
    if (currentRoles.length === 0) {
      currentRoles = await fetchUserRoles(user.id);
    }

    return currentRoles.includes(roleName);
  };

  const value = {
    user,
    profile,
    isLoading,
    roles,
    rolesLoading,
    signIn,
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

// تصدير خريطة الصلاحيات للاستخدام في أماكن أخرى
export { ROLE_PERMISSIONS };
