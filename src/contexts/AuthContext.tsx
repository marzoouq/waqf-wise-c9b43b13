import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      initRef.current = false;
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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
              .select('*')
              .single();
            
            if (createError) {
              // معالجة أخطاء FK (23503): user_id غير موجود
              if (createError.code === '23503') {
                console.warn('FK violation - retrying after delay');
                await new Promise(resolve => setTimeout(resolve, 1000));
                const { data: retryProfile } = await supabase
                  .from('profiles')
                  .select('*')
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
                  .select('*')
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
              console.error('Error creating profile:', err);
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
        console.error('Error fetching profile:', err);
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
      const keysToKeep = ['theme', 'vite-ui-theme'];
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
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Permissions نستخدم useUserRole hook بدلاً من profile
    return true; // مؤقتاً، سنستخدم useUserRole في المكونات
  };

  const isRole = (roleName: string): boolean => {
    // Roles نستخدم useUserRole hook بدلاً من profile
    return false; // مؤقتاً، سنستخدم useUserRole في المكونات
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
