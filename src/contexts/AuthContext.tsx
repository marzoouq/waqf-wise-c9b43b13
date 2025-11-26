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
        // PGRST116 = no rows returned, which is ok
        throw error;
      }
      
      // إذا لم يوجد profile، نحاول إنشاء واحد
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
              // التحقق من أخطاء foreign key أو unique constraint
              if (createError.code === '23503') {
                console.error('Foreign key violation - user_id not found in auth.users');
              } else if (createError.code === '23505') {
                // Unique violation - profile already exists, try fetching again
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', userId)
                  .single();
                
                if (existingProfile) {
                  setProfile(existingProfile as any);
                  return;
                }
              }
              throw createError;
            }
            
            setProfile(newProfile as any);
          } catch (insertError: any) {
            console.error('Error creating profile:', insertError);
            // لا نعرض toast هنا لأنه قد يكون طبيعي في بعض الحالات
            // المستخدم يمكنه الاستمرار بدون profile
          }
        }
      } else {
        setProfile(data as any);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // نعرض toast فقط للأخطاء الحقيقية
      if (error.code && error.code !== '23505' && error.code !== '23503') {
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
      console.log('🔄 بدء عملية تسجيل الخروج...');
      
      // تنظيف localStorage (الاحتفاظ فقط بإعدادات الثيم)
      const keysToKeep = ['theme', 'vite-ui-theme'];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 تم حذف: ${key}`);
      });

      // تنظيف sessionStorage
      sessionStorage.clear();
      console.log('🧹 تم تنظيف sessionStorage');

      // تسجيل الخروج من Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ خطأ في تسجيل الخروج:', error);
        throw error;
      }

      // تنظيف الحالة المحلية
      setUser(null);
      setSession(null);
      setProfile(null);
      
      console.log('✅ تم تسجيل الخروج والتنظيف بنجاح');
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error: any) {
      console.error('❌ خطأ في signOut:', error);
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء تسجيل الخروج",
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
