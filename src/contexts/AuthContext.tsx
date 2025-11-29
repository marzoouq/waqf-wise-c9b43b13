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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
  isRole: (roleName: string) => Promise<boolean>;
  checkPermissionSync: (permission: string, userRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const initRef = useRef(false);
  const rolesCache = useRef<string[]>([]);

  // جلب أدوار المستخدم من قاعدة البيانات
  const fetchUserRoles = useCallback(async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        productionLogger.error('Error fetching user roles', error);
        return [];
      }

      const roles = (data || []).map(r => r.role);
      rolesCache.current = roles;
      return roles;
    } catch (err) {
      productionLogger.error('Exception fetching user roles', err);
      return [];
    }
  }, []);

  // تنظيف الجلسات التالفة
  const cleanupInvalidSession = useCallback(async () => {
    try {
      // إزالة tokens القديمة من localStorage
      const keysToClean = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      keysToClean.forEach(key => localStorage.removeItem(key));
      
      // تسجيل الخروج من Supabase
      await supabase.auth.signOut({ scope: 'local' });
      
      // تنظيف الحالة
      setUser(null);
      setSession(null);
      setProfile(null);
      rolesCache.current = [];
    } catch (err) {
      productionLogger.error('Error cleaning up invalid session', err);
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // معالجة حدث تسجيل الخروج
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        rolesCache.current = [];
        setIsLoading(false);
        return;
      }

      // معالجة خطأ تجديد الـ token
      if (event === 'TOKEN_REFRESHED' && !newSession) {
        productionLogger.warn('Token refresh failed, cleaning up session');
        cleanupInvalidSession();
        setIsLoading(false);
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // استخدام setTimeout لتجنب deadlock
        setTimeout(() => {
          fetchProfile(newSession.user.id);
          fetchUserRoles(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        rolesCache.current = [];
        setIsLoading(false);
      }
    });

    // Check current session with error handling
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      // معالجة أخطاء الجلسة التالفة
      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('invalid') || 
            errorMsg.includes('bad_jwt') || 
            errorMsg.includes('missing sub claim') ||
            errorMsg.includes('expired')) {
          productionLogger.warn('Invalid session detected, cleaning up', error.message);
          cleanupInvalidSession();
          setIsLoading(false);
          return;
        }
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
        fetchUserRoles(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    }).catch((err) => {
      // معالجة أخطاء غير متوقعة
      productionLogger.error('Unexpected error getting session', err);
      cleanupInvalidSession();
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      initRef.current = false;
    };
  }, [fetchUserRoles, cleanupInvalidSession]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, avatar_url, phone, position, is_active, created_at, updated_at, last_login_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.email || 'مستخدم جديد'
              })
              .select('id, user_id, email, full_name, avatar_url, phone, position, is_active, created_at, updated_at, last_login_at')
              .single();
            
            if (createError) {
              // معالجة أخطاء FK (23503): user_id غير موجود
              if (createError.code === '23503') {
                productionLogger.warn('FK violation - retrying after delay');
                await new Promise(resolve => setTimeout(resolve, 1000));
                const { data: retryProfile } = await supabase
                  .from('profiles')
                  .select('id, user_id, email, full_name, avatar_url, phone, position, is_active, created_at, updated_at, last_login_at')
                  .eq('user_id', userId)
                  .maybeSingle();
                
                if (retryProfile) {
                  setProfile(retryProfile);
                  return;
                }
              } 
              // معالجة Unique constraint (23505): profile موجود مسبقاً
              else if (createError.code === '23505') {
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('id, user_id, email, full_name, avatar_url, phone, position, is_active, created_at, updated_at, last_login_at')
                  .eq('user_id', userId)
                  .maybeSingle();
                
                if (existingProfile) {
                  setProfile(existingProfile);
                  return;
                }
              }
              throw createError;
            }
            
            setProfile(newProfile);
          } catch (insertError: unknown) {
            const err = insertError as { code?: string; message?: string };
            // لا نعرض أخطاء FK وUnique للمستخدم
            if (!['23503', '23505'].includes(err.code || '')) {
              productionLogger.error('Error creating profile', insertError);
            }
          }
        }
      } else {
        setProfile(data);
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // نعرض toast فقط للأخطاء غير المتوقعة
      if (!['23505', '23503', 'PGRST116'].includes(err.code || '')) {
        productionLogger.error('Error fetching profile', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل بيانات المستخدم',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      rolesCache.current = [];
      
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
      rolesCache.current = [];
      throw error;
    }
  };

  /**
   * التحقق من صلاحية معينة - async version
   */
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;

    // استخدام الـ cache إذا كان متوفراً
    let roles = rolesCache.current;
    
    // إذا لم يكن هناك cache، جلب الأدوار
    if (roles.length === 0) {
      roles = await fetchUserRoles(user.id);
    }

    // استخدام دالة checkPermission من config
    return checkPermission(permission as Permission, roles);
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
    let roles = rolesCache.current;
    
    // إذا لم يكن هناك cache، جلب الأدوار
    if (roles.length === 0) {
      roles = await fetchUserRoles(user.id);
    }

    return roles.includes(roleName);
  };

  const value = {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    isRole,
    checkPermissionSync,
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
